import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import {
    Users, LayoutGrid, Coffee, BarChart3, LogOut, Plus, Trash2, ShieldCheck, MapPin
} from 'lucide-react';
import { usePOS } from '@/context/POSContext'; // Reuse for floor/products if possible, or fetch directly
import { AdminFloorManager } from '@/components/admin/AdminFloorManager';
import { AdminProductManager } from '@/components/admin/AdminProductManager';
import { AdminReportsManager } from '@/components/admin/AdminReportsManager';

export const AdminDashboardScreen = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("staff");
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Staff Form State
    const [newStaff, setNewStaff] = useState({ username: '', email: '', password: '', role: 'cashier' });
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/login');
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/staff', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStaffList(data);
            }
        } catch (error) {
            console.error("Failed to fetch staff");
        }
    };

    const handleAddStaff = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/staff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newStaff)
            });
            if (response.ok) {
                toast({ title: "Staff Added" });
                setIsAddStaffOpen(false);
                fetchStaff();
                setNewStaff({ username: '', email: '', password: '', role: 'cashier' });
            } else {
                const data = await response.json();
                toast({
                    title: "Failed to add staff",
                    description: data.message || data.error || "Unknown error",
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            console.error(error);
            toast({ title: "Network Error", description: error.message, variant: "destructive" });
        }
    };

    const handleDeleteStaff = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            const response = await fetch(`http://localhost:5000/api/admin/staff/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                toast({ title: "Staff Removed" });
                fetchStaff();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <header className="flex justify-between items-center mb-8 bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <p className="text-sm text-muted-foreground">Manage your restaurant</p>
                    </div>
                </div>
                <Button variant="ghost" onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
            </header>

            <Tabs defaultValue="staff" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-card p-1 border border-border h-auto grid grid-cols-2 md:grid-cols-4 gap-2 w-full max-w-4xl mx-auto">
                    <TabsTrigger value="staff" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-12">
                        <Users className="w-4 h-4 mr-2" /> Staff
                    </TabsTrigger>
                    <TabsTrigger value="floors" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-12">
                        <LayoutGrid className="w-4 h-4 mr-2" /> Floors
                    </TabsTrigger>
                    <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-12">
                        <Coffee className="w-4 h-4 mr-2" /> Products
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-12">
                        <BarChart3 className="w-4 h-4 mr-2" /> Reports
                    </TabsTrigger>
                </TabsList>

                {/* Staff Management Tab */}
                <TabsContent value="staff" className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Staff Management</h2>
                        <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
                            <DialogTrigger asChild>
                                <Button><Plus className="w-4 h-4 mr-2" /> Add Staff</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Staff Member</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input value={newStaff.username} onChange={e => setNewStaff({ ...newStaff, username: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input type="email" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Password</Label>
                                        <Input type="password" value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <Select value={newStaff.role} onValueChange={v => setNewStaff({ ...newStaff, role: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cashier">Cashier</SelectItem>
                                                <SelectItem value="kitchen">Kitchen Staff</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={handleAddStaff} className="w-full">Create Account</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {staffList.map((staff: any) => (
                                        <TableRow key={staff.id}>
                                            <TableCell className="font-medium">{staff.username}</TableCell>
                                            <TableCell>{staff.email}</TableCell>
                                            <TableCell className="capitalize">{staff.role}</TableCell>
                                            <TableCell><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span></TableCell>
                                            <TableCell className="text-right">
                                                {staff.role !== 'admin' && (
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteStaff(staff.id)} className="text-destructive hover:bg-destructive/10">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Placeholders for other tabs */}
                <TabsContent value="floors">
                    <AdminFloorManager />
                </TabsContent>
                <TabsContent value="products">
                    <AdminProductManager />
                </TabsContent>
                <TabsContent value="reports">
                    <AdminReportsManager />
                </TabsContent>
            </Tabs>
        </div>
    );
};
