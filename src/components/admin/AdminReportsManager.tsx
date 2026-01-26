import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IndianRupee, Users, TrendingUp, Calendar } from 'lucide-react';

export const AdminReportsManager = () => {
    const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, activeTables: 0 });
    const [staffSales, setStaffSales] = useState<any[]>([]);
    const [filter, setFilter] = useState('today'); // today, week, month

    useEffect(() => {
        // Mock data or fetch real stats
        // In a real app, we'd fetch from /api/admin/stats?period=today
        const mockStats = {
            totalSales: 24500,
            totalOrders: 45,
            activeTables: 3
        };
        const mockStaffSales = [
            { id: 1, name: 'John Doe', sales: 12000, orders: 20 },
            { id: 2, name: 'Jane Smith', sales: 8500, orders: 15 },
            { id: 3, name: 'Bob Wilson', sales: 4000, orders: 10 }
        ];

        setStats(mockStats);
        setStaffSales(mockStaffSales);
    }, [filter]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Sales & Analytics</h2>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-md bg-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Branch Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-foreground">₹{stats.totalSales.toLocaleString()}</div>
                        <p className="text-xs text-status-free font-bold mt-1">+12% from yesterday</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Operational Orders</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-foreground">{stats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground mt-1">Daily volume</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Table Occupancy</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-foreground">{stats.activeTables}</div>
                        <p className="text-xs text-muted-foreground mt-1">Live customers</p>
                    </CardContent>
                </Card>
            </div>

            {/* Staff Performance */}
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Staff Performance Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {staffSales.map((staff, i) => (
                            <div key={staff.id} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-primary text-xl">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground">{staff.name}</p>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">{staff.orders} Orders Processed</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-xl text-primary">₹{staff.sales.toLocaleString()}</p>
                                    <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-status-free">
                                        <TrendingUp className="w-3 h-3" />
                                        <span>EXCELLENT</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
