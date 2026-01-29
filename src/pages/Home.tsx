import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    ArrowRight,
    ChefHat,
    CreditCard,
    Monitor,
    LayoutDashboard,
    Grid3X3,
    Zap,
    Globe,
    User,
    Utensils
} from 'lucide-react';

import heroImage from '@/assets/cafe_hero_wide_1769246092524.png';
import burgerImage from '@/assets/gourmet_burger_plate_1769246107987.png';
import coffeeImage from '@/assets/latte_art_coffee_1769246121448.png';
import dessertImage from '@/assets/dessert_plate_1769246141807.png';
import pizzaImage from '@/assets/pizza_wood_oven_1769246157679.png';

export const Home = () => {
    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem('token');
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleAction = () => {
        if (isAuthenticated) {
            navigate('/pos');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background font-sans text-foreground">
            {/* Navbar */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-border/50 py-3' : 'bg-transparent py-4'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-primary-foreground font-bold text-xl">O</span>
                        </div>
                        <span className="font-semibold text-2xl tracking-tight text-primary">Odoo Cafe</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex items-center gap-8 mr-4">
                            <a href="#roles" className="text-sm font-semibold text-foreground/80 hover:text-primary transition-colors">Explore Roles</a>
                        </div>
                        <div className="flex items-center gap-3">
                            {isAuthenticated ? (
                                <Button
                                    onClick={() => navigate('/pos')}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 hover:scale-[1.03] transition-transform"
                                >
                                    Dashboard
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/login')}
                                    className="border-primary text-primary hover:bg-primary hover:text-white rounded-full px-6 hover:scale-[1.03] transition-all"
                                >
                                    Login
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => navigate('/admin/signup')}
                                className="border-gray-300 text-foreground/70 hover:bg-gray-50 rounded-full px-4 hidden sm:flex hover:scale-[1.03] transition-all"
                            >
                                Partner
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={heroImage}
                        alt="Modern Cafe Interior"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />
                </div>

                <div className="relative z-10 px-4 max-w-5xl mx-auto">
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl animate-fade-in-up">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8">
                                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span>Fast and Reliable SaaS Solution</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight leading-[1.1]">
                                Smart POS for <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-200">Modern Cafés</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed">
                                Manage orders, tables, payments, and kitchens effortlessly with a POS designed for speed and style. Experience the future of dining.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Button
                                    size="lg"
                                    onClick={handleAction}
                                    className="h-14 px-12 rounded-full text-lg bg-gradient-to-b from-[#FF9A2F] to-[#FF7A00] text-white shadow-[0_0_25px_rgba(255,122,0,0.35)] hover:scale-[1.03] transition-all duration-300 border-none"
                                >
                                    {isAuthenticated ? 'Go to Dashboard' : 'Explore POS'} <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Food Gallery Section */}
            <section className="py-24 px-4 bg-card">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-primary mb-4">Crafted for Culinary Excellence</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Showcase your menu with stunning visuals. Our POS handles everything from gourmet burgers to artisan coffee.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FoodCard
                            image={burgerImage}
                            title="Gourmet Burger"
                            desc="Juicy double patty with melted cheddar."
                        />
                        <FoodCard
                            image={pizzaImage}
                            title="Wood-Fired Pizza"
                            desc="Authentic Neapolitan margherita."
                        />
                        <FoodCard
                            image={coffeeImage}
                            title="Artisan Coffee"
                            desc="Perfectly brewed cappuccino."
                        />
                        <FoodCard
                            image={dessertImage}
                            title="Decadent Dessert"
                            desc="Rich chocolate fudge cake."
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-4 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-orange-500 font-semibold tracking-wider uppercase text-sm">Everything You Need</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">Powerful POS Features</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Grid3X3}
                            title="Table Management"
                            desc="Visual floor plans to track occupancy and manage seating efficiently."
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Fast Billing"
                            desc="Lightning-fast checkout with touch-friendly interface."
                        />
                        <FeatureCard
                            icon={CreditCard}
                            title="Easy Payments"
                            desc="Integrated support for Cash, Cards, and UPI QR payments."
                        />
                        <FeatureCard
                            icon={ChefHat}
                            title="Kitchen Display"
                            desc="Real-time order sync to the kitchen for timely preparation."
                        />
                        <FeatureCard
                            icon={Monitor}
                            title="Customer Display"
                            desc="Transparent order view for customers to track status."
                        />
                        <FeatureCard
                            icon={Globe}
                            title="Multilingual"
                            desc="Seamlessly switch between English & Hindi for staff."
                        />
                    </div>
                </div>
            </section>

            {/* User Roles Section */}
            <section id="roles" className="py-24 px-4 bg-primary text-primary-foreground">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tailored for Every Role</h2>
                            <p className="text-white/80 text-lg max-w-xl">
                                A unified platform that empowers every member of your restaurant staff.
                            </p>
                        </div>
                        <Button
                            onClick={handleAction}
                            size="lg"
                            className="bg-background text-foreground hover:bg-background/90 rounded-full"
                        >
                            {isAuthenticated ? 'Open POS' : 'Try It Now'}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <RoleCard
                            icon={User}
                            title="Admin & POS Staff"
                            desc="Manage sessions, take orders, and view comprehensive reports."
                        />
                        <RoleCard
                            icon={ChefHat}
                            title="Kitchen Team"
                            desc="See incoming orders instantly and mark items as ready."
                        />
                        <RoleCard
                            icon={Utensils}
                            title="Customers"
                            desc="View live order status and digital receipts."
                        />
                    </div>
                </div>
            </section>

            {/* Professional Footer */}
            <footer className="bg-[#111827] text-gray-300 pt-20 pb-10 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        {/* Brand Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                    <span className="text-primary-foreground font-bold text-xl">O</span>
                                </div>
                                <span className="font-semibold text-2xl tracking-tight text-white">Odoo Cafe</span>
                            </div>
                            <p className="text-gray-400 leading-relaxed max-w-xs">
                                Automate your cafe operations with the world's most intuitive and powerful SaaS POS solution. Crafted for excellence.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 transition-colors cursor-pointer">
                                    <span className="text-xs">Tw</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 transition-colors cursor-pointer">
                                    <span className="text-xs">Ig</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 transition-colors cursor-pointer">
                                    <span className="text-xs">Li</span>
                                </div>
                            </div>
                        </div>

                        {/* Product Links */}
                        <div>
                            <h4 className="text-white font-bold text-lg mb-6">Product</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="hover:text-primary transition-colors">Point of Sale</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Kitchen Display</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Admin Dashboard</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Inventory Suite</a></li>
                            </ul>
                        </div>

                        {/* Resources Links */}
                        <div>
                            <h4 className="text-white font-bold text-lg mb-6">Resources</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Video Tutorials</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Community Forum</a></li>
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div>
                            <h4 className="text-white font-bold text-lg mb-6">Stay Updated</h4>
                            <p className="text-gray-400 mb-4 text-sm">Get the latest updates and tips for your business.</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter email"
                                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-primary text-sm"
                                />
                                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">Join</Button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-gray-500 text-sm">
                            © 2026 Odoo Cafe. All rights reserved.
                        </p>
                        <div className="flex gap-8 text-sm text-gray-500">
                            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
                            <a href="#" className="hover:text-gray-300">Terms of Service</a>
                            <a href="#" className="hover:text-gray-300">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Sub-components
const FoodCard = ({ image, title, desc }: { image: string; title: string; desc: string }) => (
    <div className="group rounded-2xl overflow-hidden bg-card border border-border/50 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
        <div className="h-48 overflow-hidden">
            <img
                src={image}
                alt={title}
                loading="lazy"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
        </div>
        <div className="p-6">
            <h3 className="font-bold text-lg text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
    </div>
);

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
    <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300 group">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
            <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
        </div>
        <h3 className="font-bold text-xl mb-3 text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
);

const RoleCard = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors">
        <Icon className="w-8 h-8 text-orange-400 mb-4" />
        <h3 className="font-bold text-xl text-primary-foreground mb-2">{title}</h3>
        <p className="text-primary-foreground/60 text-sm">{desc}</p>
    </div>
);
