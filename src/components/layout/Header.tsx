import { usePOS } from '@/context/POSContext';
import { User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '../ThemeToggle';

import { useLanguage } from '@/context/LanguageContext';

export const Header = () => {
  const { session, selectedTable } = usePOS();
  const { t } = useLanguage();
  const [time, setTime] = useState(new Date());

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const displayName = session?.cashier || user?.username || 'Staff User';

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-card border-b border-border px-4 lg:px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 ml-12 lg:ml-0">
        {session && (
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-status-free animate-pulse" />
            <span>Session Active</span>
          </div>
        )}

        {selectedTable && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-accent rounded-lg">
            <span className="text-sm font-medium text-accent-foreground">
              {t('table')} {selectedTable.number}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{format(time, 'EEE, MMM d')}</span>
          <span className="font-medium text-foreground">{format(time, 'HH:mm')}</span>
        </div>

        <ThemeToggle />

        <button className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="hidden lg:block text-sm font-medium">{displayName}</span>
        </button>
      </div>
    </header>
  );
};
