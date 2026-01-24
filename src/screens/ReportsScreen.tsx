import { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { KPICard } from '@/components/pos/KPICard';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Download,
  Calendar,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export const ReportsScreen = () => {
  const { session, orders } = usePOS();
  const [dateRange, setDateRange] = useState('today');
  const { toast } = useToast();

  const paidOrders = orders.filter((o) => o.status === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

  const handleExport = (type: 'pdf' | 'xls') => {
    toast({
      title: `Export to ${type.toUpperCase()}`,
      description: 'Report download will start shortly (simulated)',
    });
  };

  // Simulated data for charts
  const hourlyData = [
    { hour: '9AM', orders: 12, revenue: 3500 },
    { hour: '10AM', orders: 18, revenue: 5200 },
    { hour: '11AM', orders: 25, revenue: 7800 },
    { hour: '12PM', orders: 42, revenue: 12500 },
    { hour: '1PM', orders: 48, revenue: 14200 },
    { hour: '2PM', orders: 35, revenue: 10200 },
    { hour: '3PM', orders: 22, revenue: 6500 },
    { hour: '4PM', orders: 28, revenue: 8100 },
    { hour: '5PM', orders: 38, revenue: 11200 },
    { hour: '6PM', orders: 52, revenue: 15800 },
  ];

  const topProducts = [
    { name: 'Margherita Pizza', quantity: 45, revenue: 13455 },
    { name: 'Classic Cheeseburger', quantity: 38, revenue: 9462 },
    { name: 'Cappuccino', quantity: 62, revenue: 9238 },
    { name: 'French Fries', quantity: 55, revenue: 5445 },
    { name: 'Chocolate Lava Cake', quantity: 28, revenue: 5572 },
  ];

  const maxRevenue = Math.max(...hourlyData.map((d) => d.revenue));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary" />
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            {session ? `Session: ${format(session.openedAt, 'MMM d, yyyy')}` : 'View performance metrics'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            className="touch-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('xls')}
            className="touch-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Period:</span>
        </div>
        {['today', 'week', 'month', 'year'].map((range) => (
          <Button
            key={range}
            variant={dateRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange(range)}
            className="capitalize"
          >
            {range === 'today' ? 'Today' : `This ${range}`}
          </Button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={`₹${(totalRevenue || 95420).toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 12.5, positive: true }}
        />
        <KPICard
          title="Total Orders"
          value={paidOrders.length || 320}
          icon={ShoppingBag}
          trend={{ value: 8.2, positive: true }}
        />
        <KPICard
          title="Avg Order Value"
          value={`₹${avgOrderValue || 298}`}
          icon={TrendingUp}
          trend={{ value: 3.1, positive: true }}
        />
        <KPICard
          title="Customers Served"
          value={paidOrders.length * 2 || 640}
          icon={Users}
          trend={{ value: 15.3, positive: true }}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart (simulated with bars) */}
        <div className="pos-card p-6">
          <h2 className="text-lg font-semibold mb-4">Hourly Revenue</h2>
          <div className="space-y-3">
            {hourlyData.map((data, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-12 text-sm text-muted-foreground">{data.hour}</span>
                <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{
                      width: `${(data.revenue / maxRevenue) * 100}%`,
                      animationDelay: `${i * 50}ms`,
                    }}
                  />
                </div>
                <span className="w-20 text-sm font-medium text-right">
                  ₹{data.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="pos-card p-6">
          <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
          <div className="space-y-4">
            {topProducts.map((product, i) => (
              <div key={i} className="flex items-center justify-between animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
                    i === 0 ? 'bg-warm-amber/20 text-warm-amber' :
                    i === 1 ? 'bg-muted text-muted-foreground' :
                    i === 2 ? 'bg-warm-amber/10 text-warm-amber/70' :
                    'bg-secondary text-muted-foreground'
                  )}>
                    #{i + 1}
                  </span>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.quantity} sold</p>
                  </div>
                </div>
                <span className="font-bold text-primary">₹{product.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session Summary */}
      {session && (
        <div className="pos-card p-6">
          <h2 className="text-lg font-semibold mb-4">Current Session Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Session Started</p>
              <p className="text-lg font-semibold">{format(session.openedAt, 'HH:mm')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cashier</p>
              <p className="text-lg font-semibold">{session.cashier}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Opening Balance</p>
              <p className="text-lg font-semibold">₹{session.openingBalance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-lg font-semibold text-status-free">
                ₹{(session.openingBalance + session.totalSales).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
