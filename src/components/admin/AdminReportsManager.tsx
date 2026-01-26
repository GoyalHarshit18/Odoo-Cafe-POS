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
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.totalSales.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last period</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">+10.5% from last period</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tables</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeTables}</div>
                        <p className="text-xs text-muted-foreground">Current occupancy</p>
                    </CardContent>
                </Card>
            </div>

            {/* Staff Performance */}
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Staff Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {staffSales.map(staff => (
                            <div key={staff.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                        {staff.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{staff.name}</p>
                                        <p className="text-sm text-muted-foreground">{staff.orders} Orders Processed</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">₹{staff.sales.toLocaleString()}</p>
                                    <p className="text-xs text-green-600 font-medium">Excellent</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
