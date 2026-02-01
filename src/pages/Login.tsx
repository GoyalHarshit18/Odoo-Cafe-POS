import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { authApi, getAuthToken } from '@/lib/api';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

import pizzaImg from '@/assets/food/pizza.jpg';
import burgerImg from '@/assets/food/burger.jpg';
import coffeeImg from '@/assets/food/coffee.jpg';

export const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('light');

    // Check if user is already logged in
    const token = getAuthToken();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (token) {
      if (user.role === 'kitchen') {
        navigate('/kitchen-display', { replace: true });
      } else {
        navigate('/pos', { replace: true });
      }
    }
  }, [setTheme, navigate]);

  const handleAuthRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let data;
      if (isLogin) {
        // Direct Login
        data = await authApi.login({ email, password });
      } else {
        // Direct Signup
        data = await authApi.register({
          username: name,
          email,
          password,
          role: 'cashier',
        });
      }

      // Store token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data._id,
        username: data.username,
        email: data.email,
        role: data.role
      }));

      toast({
        title: 'Success!',
        description: isLogin ? 'Successfully logged in.' : 'Account created successfully.',
      });

      if (data.role === 'kitchen') {
        navigate('/kitchen-display');
      } else {
        navigate('/pos');
      }
    } catch (error: any) {
      const isTimeout = error.name === 'AbortError' || error.message?.includes('timeout');
      toast({
        title: isTimeout ? 'Service Timeout' : 'Authentication Error',
        description: isTimeout
          ? 'The server is taking too long to respond. It might be waking up (Cold Start). Please wait 30 seconds and try again.'
          : (error.message || 'Something went wrong. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-16 py-12">
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">O</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Odoo Cafe</h1>
              <p className="text-sm text-muted-foreground">Restaurant Management System</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-muted-foreground">
              {isLogin
                ? 'Enter your credentials to access the POS system'
                : 'Register to start using Odoo Cafe'}
            </p>
          </div>

          <form onSubmit={handleAuthRequest} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="staff@odoocafe.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base touch-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Want to register your restaurant?{' '}
            <button
              onClick={() => navigate('/admin/signup')}
              className="text-primary font-medium hover:underline"
            >
              Become a Partner
            </button>
          </p>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-primary/5 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />

        <div className="relative z-10 text-center max-w-lg">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <img
              src={pizzaImg}
              alt="Pizza"
              className="w-full aspect-square object-cover rounded-2xl shadow-lg animate-bounce-subtle"
              style={{ animationDelay: '0s' }}
            />
            <img
              src={burgerImg}
              alt="Burger"
              className="w-full aspect-square object-cover rounded-2xl shadow-lg animate-bounce-subtle"
              style={{ animationDelay: '0.2s' }}
            />
            <img
              src={coffeeImg}
              alt="Coffee"
              className="w-full aspect-square object-cover rounded-2xl shadow-lg animate-bounce-subtle col-span-2 max-w-[200px] mx-auto"
              style={{ animationDelay: '0.4s' }}
            />
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-3">
            Complete POS Solution
          </h3>
          <p className="text-muted-foreground">
            Manage orders, tables, kitchen display, and payments all in one place.
            Built for speed and efficiency during peak hours.
          </p>
        </div>
      </div>
    </div>
  );
};
