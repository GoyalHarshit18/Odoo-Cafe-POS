import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Store, User, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

export const AdminSignupPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        restaurantName: '',
        restaurantPhone: '',
        restaurantEmail: '',
        restaurantAddress: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.adminPassword !== formData.confirmPassword) {
            toast({
                title: "Passwords do not match",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/admin/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Registration Successful",
                    description: "Welcome entire restaurant system setup complete."
                });
                // Auto login
                localStorage.setItem('token', data.user.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                // Redirect to Admin Dashboard (to be created)
                navigate('/admin/dashboard');
            } else {
                toast({
                    title: "Registration Failed",
                    description: data.message || "Something went wrong",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to connect to server",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
            <div className="w-full max-w-2xl bg-card border border-border shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row">

                {/* Left Side - Hero/Info */}
                <div className="bg-primary/5 p-8 md:w-1/3 flex flex-col justify-center items-center text-center border-r border-border">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                        <Store className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Partner with Us</h2>
                    <p className="text-sm text-muted-foreground mb-6">Create your digital restaurant in minutes.</p>
                    <div className="space-y-4 text-left w-full">
                        <div className="flex items-center gap-3 text-sm text-foreground/80">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><User className="w-4 h-4" /></div>
                            <span>Admin Control</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-foreground/80">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><MapPin className="w-4 h-4" /></div>
                            <span>Multi-location</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="p-8 md:w-2/3">
                    <h1 className="text-2xl font-bold text-foreground mb-1">Restaurant Signup</h1>
                    <p className="text-muted-foreground text-sm mb-6">Enter your restaurant details to get started</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Restaurant Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="restaurantName">Restaurant Name</Label>
                                    <Input id="restaurantName" name="restaurantName" required onChange={handleChange} placeholder="Tasty Bites" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="restaurantPhone">Phone</Label>
                                    <Input id="restaurantPhone" name="restaurantPhone" required onChange={handleChange} placeholder="+91 9876543210" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="restaurantAddress">Location / Address</Label>
                                <Input id="restaurantAddress" name="restaurantAddress" required onChange={handleChange} placeholder="123 Main St, City" />
                            </div>
                        </div>

                        <div className="h-px bg-border my-4" />

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Admin Credentials</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="adminName">Admin Name</Label>
                                    <Input id="adminName" name="adminName" required onChange={handleChange} placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="adminEmail">Email (Login ID)</Label>
                                    <Input id="adminEmail" name="adminEmail" type="email" required onChange={handleChange} placeholder="admin@example.com" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="adminPassword">Password</Label>
                                    <Input id="adminPassword" name="adminPassword" type="password" required onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input id="confirmPassword" name="confirmPassword" type="password" required onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full mt-6" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground mt-4">
                            Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};
