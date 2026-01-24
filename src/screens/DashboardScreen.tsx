import { usePOS } from '@/context/POSContext';
import { KPICard } from '@/components/pos/KPICard';
import { Button } from '@/components/ui/button';
import {
  Play,
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Grid3X3,
  ChefHat,
  Clock,
  CreditCard,
  Settings,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const DashboardScreen = () => {
  const { session, openSession, setCurrentScreen, orders, kdsTickets, floors } = usePOS();

  const totalTables = floors.reduce((sum, f) => sum + f.tables.length, 0);
  const occupiedTables = floors.reduce(
    (sum, f) => sum + f.tables.filter(t => t.status !== 'free').length,
    0
  );
  const activeOrders = kdsTickets.filter(t => t.status !== 'completed').length;

  const roleFeatures = [
    { icon: Grid3X3, label: 'Manage Floors & Tables', color: 'bg-primary/10 text-primary' },
    { icon: ShoppingBag, label: 'Create Orders', color: 'bg-status-free/10 text-status-free' },
    { icon: ChefHat, label: 'Kitchen Display', color: 'bg-warm-amber/10 text-warm-amber' },
    { icon: CreditCard, label: 'Process Payments', color: 'bg-primary/10 text-primary' },
    { icon: BarChart3, label: 'View Reports', color: 'bg-status-occupied/10 text-status-occupied' },
    { icon: Settings, label: 'System Settings', color: 'bg-muted text-muted-foreground' },
  ];

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">POS Staff Dashboard</h1>
          <p className="text-muted-foreground">
            Manage the complete restaurant workflow from orders to payments
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {roleFeatures.map((feature, i) => (
            <div
              key={i}
              className={cn(
                'pos-card p-4 flex items-center gap-3 animate-fade-in',
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', feature.color)}>
                <feature.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-foreground">{feature.label}</span>
            </div>
          ))}
        </div>

        <div className="pos-card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">No Active Session</h2>
          <p className="text-muted-foreground mb-6">
            Open a new session to start taking orders and processing payments
          </p>
          <Button onClick={openSession} size="lg" className="touch-btn">
            <Play className="w-5 h-5 mr-2" />
            Open Session
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Session opened at {format(session.openedAt, 'HH:mm')} by {session.cashier}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-status-free-bg rounded-xl">
          <div className="w-2 h-2 rounded-full bg-status-free animate-pulse" />
          <span className="text-sm font-medium text-status-free">Session Active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Today's Sales"
          value={`₹${session.totalSales.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 12, positive: true }}
        />
        <KPICard
          title="Orders"
          value={session.ordersCount}
          icon={ShoppingBag}
          trend={{ value: 8, positive: true }}
        />
        <KPICard
          title="Tables Occupied"
          value={`${occupiedTables}/${totalTables}`}
          icon={Users}
        />
        <KPICard
          title="Active Kitchen"
          value={activeOrders}
          icon={ChefHat}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="pos-card p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 touch-btn"
              onClick={() => setCurrentScreen('floor')}
            >
              <Grid3X3 className="w-6 h-6" />
              <span>Floor View</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 touch-btn"
              onClick={() => setCurrentScreen('kitchen')}
            >
              <ChefHat className="w-6 h-6" />
              <span>Kitchen Display</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 touch-btn"
              onClick={() => setCurrentScreen('reports')}
            >
              <BarChart3 className="w-6 h-6" />
              <span>Reports</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 touch-btn"
              onClick={() => setCurrentScreen('customer')}
            >
              <TrendingUp className="w-6 h-6" />
              <span>Customer Display</span>
            </Button>
          </div>
        </div>

        <div className="pos-card p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No orders yet</p>
              <p className="text-sm">Start by selecting a table</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[240px] overflow-y-auto scrollbar-thin">
              {orders.slice(-5).reverse().map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                  <div>
                    <p className="font-medium">#{order.id}</p>
                    <p className="text-sm text-muted-foreground">Table {order.tableNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{order.total}</p>
                    <span className={cn(
                      'status-badge',
                      order.status === 'paid' && 'status-badge-free',
                      order.status === 'in-kitchen' && 'status-badge-occupied',
                      order.status === 'pending' && 'status-badge-pending',
                    )}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
