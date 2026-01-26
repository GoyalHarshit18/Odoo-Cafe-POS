import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, Clock, Calendar, ChefHat } from 'lucide-react';
import { format } from 'date-fns';

export const CustomerDashboardPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [customer, setCustomer] = useState(null);

    useEffect(() => {
        const custStr = localStorage.getItem('customer');
        const token = localStorage.getItem('customer_token');
        if (!custStr || !token) {
            navigate('/customer/login');
            return;
        }
        setCustomer(JSON.parse(custStr));
        fetchHistory(token);
    }, []);

    const fetchHistory = async (token) => {
        try {
            const response = await fetch('http://localhost:5000/api/customer/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('customer');
        localStorage.removeItem('customer_token');
        navigate('/customer/login');
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="font-bold text-lg">Hi, {customer?.name}</h1>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Order History
                </h2>

                {orders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No orders found yet. Visit us to have some delicious food!
                    </div>
                ) : (
                    orders.map((order: any) => (
                        <Card key={order.id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="bg-primary/5 p-4 flex justify-between items-center border-b">
                                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                                        <Calendar className="w-4 h-4 opacity-50" />
                                        {format(new Date(order.createdAt), 'MMM dd, yyyy • hh:mm a')}
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {order.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="p-4 space-y-3">
                                    {order.items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="font-medium text-foreground">
                                                    {item.quantity}x {item.name || item.product?.name}
                                                </div>
                                            </div>
                                            <div className="text-muted-foreground">₹{item.price * item.quantity}</div>
                                        </div>
                                    ))}
                                    <div className="border-t pt-3 mt-3 flex justify-between items-center font-bold">
                                        <span>Total</span>
                                        <span>₹{order.total}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </main>
        </div>
    );
};
