import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Utensils, Phone, User, Loader2 } from 'lucide-react';

export const CustomerLoginPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/customer/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('customer_token', data.token);
                localStorage.setItem('customer', JSON.stringify(data));
                toast({ title: "Welcome back!", description: `Logged in as ${data.name}` });
                navigate('/customer/dashboard');
            } else {
                toast({ title: "Login Failed", description: data.message, variant: "destructive" });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
            <div className="w-full max-w-md bg-white border border-border shadow-xl rounded-2xl p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Utensils className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Cafe Customer</h1>
                    <p className="text-muted-foreground text-center">Enter your details to view your orders</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Your Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="John Doe" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="9876543210" required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "View My Orders"}
                    </Button>
                </form>
            </div>
        </div>
    );
};
