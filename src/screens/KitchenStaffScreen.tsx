import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, RefreshCw, ChefHat, Play, CheckCircle2, ListChecks, Flame, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { BASE_URL } from '@/lib/api';

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    isPrepared?: boolean;
}

interface Order {
    id: string;
    ticketNumber: string;
    tableNumber?: number;
    time: string;
    status: 'draft' | 'running' | 'paid' | 'cancelled' | 'in-kitchen' | 'preparing' | 'ready' | 'completed';
    items: OrderItem[];
    createdAt: string;
    lockedBy?: number | null;
}

export const KitchenStaffScreen = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${BASE_URL}/api/orders/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const mappedOrders = data
                    .filter((o: any) => ['running', 'in-kitchen', 'preparing', 'ready'].includes(o.status))
                    .map((o: any) => {
                        const orderId = o.id || o._id;
                        return {
                            id: orderId.toString(),
                            ticketNumber: `ORD-${orderId.toString().padStart(4, '0')}`, // Consistent with ORD-XXXX
                            tableNumber: o.Table?.number,
                            time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            status: o.status,
                            items: o.items.map((i: any) => ({
                                id: i.id || i._id,
                                name: i.Product?.name || i.name,
                                quantity: i.quantity,
                            })),
                            createdAt: o.createdAt,
                            lockedBy: o.lockedBy
                        };
                    });
                setOrders(mappedOrders);
            } else {
                console.error('Fetch Orders Status:', response.status);
                const errorText = await response.text();
                console.error('Fetch Orders Error Body:', errorText);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const updateOrderStatus = async (orderId: string, newStatus: string, lockedByValue?: number | null) => {
        try {
            const token = localStorage.getItem('token');
            const body: any = { status: newStatus };
            if (lockedByValue !== undefined) body.lockedBy = lockedByValue;

            const response = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                toast({ title: "Status Updated", description: `Order moved to ${newStatus}` });
                fetchOrders();
            } else {
                const err = await response.json();
                toast({ title: "Action Denied", description: err.message, variant: "destructive" });
            }
        } catch (error) {
            console.error('Update failed', error);
        }
    };

    const handleMoveForward = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        let nextStatus = '';
        let nextLockedBy = order.lockedBy;

        if (['running', 'in-kitchen', 'draft'].includes(order.status)) {
            nextStatus = 'preparing';
            nextLockedBy = currentUser._id; // Lock it to me
        }
        else if (order.status === 'preparing') nextStatus = 'ready';
        else if (order.status === 'ready') nextStatus = 'completed';

        if (nextStatus) {
            updateOrderStatus(orderId, nextStatus, nextLockedBy);
        }
    };

    const handleToggleItem = (orderId: string, itemId: string) => {
        setOrders(prevOrders => prevOrders.map(order => {
            if (order.id !== orderId) return order;
            return {
                ...order,
                items: order.items.map(item =>
                    item.id === itemId ? { ...item, isPrepared: !item.isPrepared } : item
                )
            };
        }));
    };

    const getOrdersByStatus = (statusGroup: string) => {
        return orders.filter(order => {
            if (statusGroup === 'TO_COOK') return ['running', 'in-kitchen', 'draft'].includes(order.status);
            if (statusGroup === 'PREPARING') return order.status === 'preparing';
            if (statusGroup === 'COMPLETED') return ['ready', 'completed'].includes(order.status);
            return false;
        });
    };

    return (
        <div className="min-h-screen bg-secondary/20 p-6 lg:p-8">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                        <ChefHat className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Kitchen Dashboard</h1>
                        <div className="flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full", isLoading ? "bg-yellow-500" : "bg-green-500")} />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Operation Live</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => fetchOrders()}
                        variant="outline"
                        className="bg-card shadow-sm h-11 px-6 rounded-xl font-bold text-xs"
                    >
                        <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                        SYNC
                    </Button>
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="bg-card shadow-sm h-11 px-6 rounded-xl font-bold text-xs text-red-500 hover:bg-red-50 border-red-100"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        EXIT
                    </Button>
                </div>
            </header>

            <main className="h-[calc(100vh-12rem)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                    <Column
                        title="TO COOK"
                        orders={getOrdersByStatus('TO_COOK')}
                        icon={<ListChecks className="w-5 h-5 text-warm-amber" />}
                        onAction={handleMoveForward}
                        onToggleItem={handleToggleItem}
                        accent="bg-warm-amber"
                        actionLabel="START PREPARING"
                        actionIcon={<Play className="w-4 h-4 fill-current" />}
                        headerClass="bg-warm-amber/10 text-warm-amber border-warm-amber/20"
                        currentUser={currentUser}
                    />
                    <Column
                        title="PREPARING"
                        orders={getOrdersByStatus('PREPARING')}
                        icon={<Flame className="w-5 h-5 text-primary" />}
                        onAction={handleMoveForward}
                        onToggleItem={handleToggleItem}
                        accent="bg-primary"
                        actionLabel="MARK READY"
                        actionIcon={<CheckCircle2 className="w-4 h-4" />}
                        headerClass="bg-primary/10 text-primary border-primary/20"
                        currentUser={currentUser}
                    />
                    <Column
                        title="READY"
                        orders={getOrdersByStatus('COMPLETED')}
                        icon={<CheckCircle2 className="w-5 h-5 text-status-free" />}
                        onAction={handleMoveForward}
                        onToggleItem={handleToggleItem}
                        accent="bg-status-free"
                        actionLabel="COMPLETE"
                        actionIcon={<CheckCircle2 className="w-4 h-4" />}
                        headerClass="bg-status-free/10 text-status-free border-status-free/20"
                        currentUser={currentUser}
                    />
                </div>
            </main>
        </div>
    );
};

interface ColumnProps {
    title: string;
    orders: Order[];
    icon: React.ReactNode;
    onAction: (orderId: string) => void;
    onToggleItem: (orderId: string, itemId: string) => void;
    accent: string;
    actionLabel: string;
    actionIcon: React.ReactNode;
    headerClass: string;
    currentUser: any;
}

const Column = ({ title, orders, icon, onAction, onToggleItem, accent, actionLabel, actionIcon, headerClass, currentUser }: ColumnProps) => {
    return (
        <div className="flex flex-col h-full bg-card rounded-2xl border border-border shadow-sm overflow-hidden text-card-foreground">
            <div className={cn("p-5 flex items-center justify-between border-b border-border", headerClass)}>
                <div className="flex items-center gap-3">
                    {icon}
                    <h2 className="text-sm font-bold tracking-widest uppercase">{title}</h2>
                </div>
                <span className="bg-white/50 text-foreground px-3 py-1 rounded-full text-xs font-bold">
                    {orders.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/5">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20">
                        <ListChecks className="w-12 h-12 mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest">No active orders</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden">
                            <div className="p-4 border-b border-border flex items-center justify-between transition-colors">
                                <div>
                                    <div className="text-lg font-bold text-primary">{order.ticketNumber}</div>
                                    <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">{order.time}</div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {order.tableNumber && (
                                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-bold">
                                            Table {order.tableNumber}
                                        </div>
                                    )}
                                    {order.lockedBy && String(order.lockedBy) !== String(currentUser?._id) && (
                                        <span className="text-[9px] font-black bg-red-500 text-white px-2 py-0.5 rounded uppercase animate-pulse">
                                            Locked by other
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 space-y-2">
                                {order.items.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => onToggleItem(order.id, item.id)}
                                        className={cn(
                                            "flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer",
                                            item.isPrepared
                                                ? "bg-status-free/10 border-status-free/20 text-status-free"
                                                : "bg-secondary/30 border-border/50 hover:border-border"
                                        )}
                                    >
                                        <span className={cn(
                                            "w-7 h-7 rounded flex items-center justify-center font-bold text-xs",
                                            item.isPrepared ? "bg-status-free text-white" : "bg-primary text-white"
                                        )}>
                                            {item.quantity}
                                        </span>
                                        <span className="flex-1 text-sm font-medium uppercase tracking-tight">{item.name}</span>
                                        {item.isPrepared && <CheckCircle2 className="w-4 h-4 text-status-free" />}
                                    </div>
                                ))}
                            </div>

                            <div className="px-4 pb-4">
                                <Button
                                    onClick={() => onAction(order.id)}
                                    disabled={!!order.lockedBy && String(order.lockedBy) !== String(currentUser?._id)}
                                    className={cn(
                                        "w-full h-11 rounded-xl font-bold text-xs tracking-widest gap-2 shadow-sm transition-transform active:scale-95 text-white border-none",
                                        !!order.lockedBy && String(order.lockedBy) !== String(currentUser?._id) ? "bg-slate-300 cursor-not-allowed" : accent
                                    )}
                                >
                                    {!!order.lockedBy && String(order.lockedBy) !== String(currentUser?._id) ? <Clock className="w-4 h-4" /> : actionIcon}
                                    {!!order.lockedBy && String(order.lockedBy) !== String(currentUser?._id) ? "BEING PREPARED" : actionLabel}
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
