import { useState, useEffect } from 'react';
import { BASE_URL, getAuthToken } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, LayoutTemplate } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableCard } from '../pos/TableCard';

export const AdminFloorManager = () => {
    const { toast } = useToast();
    const [floors, setFloors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Add Floor State
    const [newFloorName, setNewFloorName] = useState('');
    const [isAddFloorOpen, setIsAddFloorOpen] = useState(false);

    // Add Table State
    const [newTable, setNewTable] = useState({ floorId: '', number: '', seats: 4 });
    const [isAddTableOpen, setIsAddTableOpen] = useState(false);
    const [selectedFloorForTable, setSelectedFloorForTable] = useState<string | null>(null);

    useEffect(() => {
        fetchFloors();
    }, []);

    const fetchFloors = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await fetch(`${BASE_URL}/api/pos/floors`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setFloors(data);
            }
        } catch (error) {
            console.error("Failed to fetch floors");
        } finally {
            setLoading(false);
        }
    };

    const handleAddFloor = async () => {
        if (!newFloorName) return;
        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await fetch(`${BASE_URL}/api/pos/floors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newFloorName })
            });

            if (response.ok) {
                toast({ title: "Floor Added" });
                setIsAddFloorOpen(false);
                setNewFloorName('');
                fetchFloors();
            } else {
                const data = await response.json();
                toast({ title: "Failed to add floor", description: data.error || data.message, variant: "destructive" });
            }
        } catch (error: any) {
            console.error(error);
            toast({ title: "Network Error", description: error.message, variant: "destructive" });
        }
    };

    const handleDeleteFloor = async (id: string) => {
        if (!confirm("Delete this floor and all its tables?")) return;
        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await fetch(`${BASE_URL}/api/pos/floors/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                toast({ title: "Floor Deleted" });
                fetchFloors();
            } else {
                const data = await response.json();
                toast({ title: "Failed to delete floor", description: data.error || data.message, variant: "destructive" });
            }
        } catch (error: any) {
            console.error(error);
            toast({ title: "Network Error", description: error.message, variant: "destructive" });
        }
    };

    const handleAddTable = async () => {
        if (!selectedFloorForTable) return;
        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await fetch(`${BASE_URL}/api/pos/tables`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    floorId: selectedFloorForTable,
                    number: newTable.number,
                    seats: newTable.seats
                })
            });

            if (response.ok) {
                toast({ title: "Table Added" });
                setIsAddTableOpen(false);
                setNewTable({ floorId: '', number: '', seats: 4 });
                fetchFloors();
            } else {
                const data = await response.json();
                toast({ title: "Failed to add table", description: data.error || data.message, variant: "destructive" });
            }
        } catch (error: any) {
            console.error(error);
            toast({ title: "Network Error", description: error.message, variant: "destructive" });
        }
    };

    // Need Delete Table endpoint? Maybe implement later.

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Floor Layout</h2>
                <Dialog open={isAddFloorOpen} onOpenChange={setIsAddFloorOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="w-4 h-4 mr-2" /> Add Floor</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Add New Floor</DialogTitle></DialogHeader>
                        <div className="flex gap-4 py-4">
                            <Input value={newFloorName} onChange={e => setNewFloorName(e.target.value)} placeholder="Ground Floor" />
                            <Button onClick={handleAddFloor}>Add</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {floors.map(floor => (
                    <Card key={floor.id} className="relative group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium">{floor.name}</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteFloor(floor.id)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="min-h-[100px] border-2 border-dashed border-muted rounded-lg p-4 flex flex-wrap gap-2 content-start">
                                {floor.tables && floor.tables.map((table: any) => (
                                    <div key={table.id} className="w-32">
                                        <TableCard
                                            table={{
                                                id: table.id,
                                                number: table.number,
                                                seats: table.seats,
                                                status: table.status || 'free',
                                                floor: floor.id
                                            }}
                                            onClick={() => { }} // Admin view might not need click on table cards here
                                        />
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    className="w-12 h-12 border-dashed"
                                    onClick={() => {
                                        setSelectedFloorForTable(floor.id);
                                        setIsAddTableOpen(true);
                                    }}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isAddTableOpen} onOpenChange={setIsAddTableOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add Table</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Table Number</Label>
                            <Input type="number" value={newTable.number} onChange={e => setNewTable({ ...newTable, number: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Seats</Label>
                            <Input type="number" value={newTable.seats} onChange={e => setNewTable({ ...newTable, seats: parseInt(e.target.value) })} />
                        </div>
                        <Button onClick={handleAddTable} className="w-full">Create Table</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
