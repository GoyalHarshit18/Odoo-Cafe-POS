import {
  LayoutDashboard,
  Grid3X3,
  ShoppingBag,
  CreditCard,
  ChefHat,
  Monitor,
  BarChart3,
  LogOut,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePOS } from '@/context/POSContext';
import { useLanguage } from '@/context/LanguageContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Sidebar = () => {
  const { currentScreen, setCurrentScreen, session, closeSession } = usePOS();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    closeSession();
    navigate('/login');
  };

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'order', label: t('orders'), icon: ShoppingBag },
    { id: 'kitchen', label: t('kitchen'), icon: ChefHat },
    ...(isAdmin ? [
      { id: 'admin-dashboard', label: 'Admin Portal', icon: ShieldCheck, path: '/admin/dashboard' },
      { id: 'reports', label: t('reports'), icon: BarChart3 }
    ] : []),
  ];

  const handleNavClick = (item: any) => {
    if (item.path) {
      navigate(item.path);
    } else {
      setCurrentScreen(item.id);
    }
    setMobileOpen(false);
  };

  const NavContent = () => (
    <>
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Cafe Cloud" className="w-10 h-10 object-contain" />
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-sidebar-foreground">Cafe Cloud</h1>
              <p className="text-xs text-muted-foreground">POS System</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-3 rounded-xl',
              'transition-all duration-200 touch-btn',
              currentScreen === item.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-3 rounded-xl',
            'text-destructive hover:bg-destructive/10 transition-colors touch-btn'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>


      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-xl shadow-lg"
      >
        <Menu className="w-6 h-6 text-foreground" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col',
          'transform transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-2 hover:bg-sidebar-accent rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border',
          'transition-all duration-300',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 z-10 p-1.5 bg-card border border-border rounded-full shadow-md hover:bg-accent transition-colors"
        >
          <Menu className="w-4 h-4 text-foreground" />
        </button>
        <NavContent />
      </aside>
    </>
  );
};
