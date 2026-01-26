
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
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-border/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">O</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-primary">Odoo Cafe</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:block">Features</a>
                        <a href="#roles" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:block">Explore Roles</a>
                        {isAuthenticated ? (
                            <Button
                                onClick={() => navigate('/pos')}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
                            >
                                Dashboard
                            </Button>
                        ) : (
                            <Button
                                onClick={() => navigate('/login')}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
                            >
                                Login
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => navigate('/admin/signup')}
                            className="rounded-full px-4"
                        >
                            Partner
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-16 min-h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={heroImage}
                        alt="Modern Cafe Interior"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6">
                        <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>Fast and Reliable</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                        Smart POS for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">Modern Cafés</span>
                    </h1>

                    <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Manage orders, tables, payments, and kitchens effortlessly with a POS designed for speed and style. EXPERIENCE the future of dining.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            size="lg"
                            onClick={handleAction}
                            className="h-14 px-8 rounded-full text-lg bg-[#F97316] hover:bg-[#EA580C] text-white shadow-lg shadow-orange-500/20 hover:scale-105 transition-all duration-300"
                        >
                            {isAuthenticated ? 'Go to Dashboard' : 'Explore POS'} <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-14 px-8 rounded-full text-lg bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            View Features
                        </Button>
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

            {/* Footer */}
            <footer className="bg-card text-card-foreground py-12 px-4 border-t border-border">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">O</span>
                        </div>
                        <span className="font-bold text-xl">Odoo Cafe </span>
                    </div>
                    <p className="text-white/40 text-sm">
                        © 2026 Odoo Cafe. All rights reserved.
                    </p>
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
