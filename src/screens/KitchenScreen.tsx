import { usePOS } from '@/context/POSContext';
import { useLanguage } from '@/context/LanguageContext';
import { KDSTicketCard } from '@/components/pos/KDSTicketCard';
import { ChefHat, Clock, Flame, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const KitchenScreen = () => {
  const { kdsTickets, updateKDSStatus } = usePOS();
  const { t } = useLanguage();

  const toCook = kdsTickets.filter((t) => t.status === 'to-cook');
  const preparing = kdsTickets.filter((t) => t.status === 'preparing');
  const completed = kdsTickets.filter((t) => t.status === 'completed');

  const columns = [
    {
      id: 'to-cook',
      label: t('toCook'),
      icon: Clock,
      tickets: toCook,
      color: 'bg-warm-amber/20 border-warm-amber',
      iconColor: 'text-warm-amber',
    },
    {
      id: 'preparing',
      label: t('preparing'),
      icon: Flame,
      tickets: preparing,
      color: 'bg-status-occupied/20 border-status-occupied',
      iconColor: 'text-status-occupied',
    },
    {
      id: 'completed',
      label: t('readyToServe'),
      icon: CheckCircle,
      tickets: completed,
      color: 'bg-kds-accent/20 border-kds-accent',
      iconColor: 'text-kds-accent',
    },
  ];

  return (
    <div className="min-h-screen bg-kds-background -m-4 lg:-m-6 p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-kds-foreground flex items-center gap-3">
          <ChefHat className="w-7 h-7" />
          {t('kitchen')}
        </h1>
        <div className="flex items-center gap-4 text-sm text-kds-foreground/60">
          <span>🍳 {toCook.length} {t('toCook')}</span>
          <span>🔥 {preparing.length} {t('preparing')}</span>
          <span>🍽️ {completed.length} {t('ready')}</span>
        </div>
      </div>

      {kdsTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-kds-foreground/50">
          <ChefHat className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-xl">{t('noOrders')}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className={cn(
                'flex items-center gap-3 p-3 rounded-xl border-2',
                column.color
              )}>
                <column.icon className={cn('w-5 h-5', column.iconColor)} />
                <span className="font-bold text-kds-foreground">{column.label}</span>
                <span className="ml-auto px-2.5 py-0.5 bg-kds-background/50 rounded-full text-sm font-medium text-kds-foreground">
                  {column.tickets.length}
                </span>
              </div>

              <div className="space-y-4">
                {column.tickets.map((ticket) => (
                  <KDSTicketCard
                    key={ticket.orderId}
                    ticket={ticket}
                    onStatusChange={(status) => {
                      // Logic to prevent editing if locked by someone else
                      // Assuming current user ID is available in localStorage or Context
                      const user = JSON.parse(localStorage.getItem('user') || '{}');
                      if (ticket.status === 'preparing' && ticket.lockedBy && ticket.lockedBy !== user.id) {
                        alert("This order is being prepared by another chef!");
                        return;
                      }
                      updateKDSStatus(ticket.orderId, status);
                    }}
                  />
                ))}
              </div>

              {column.tickets.length === 0 && (
                <div className="text-center py-8 text-kds-foreground/30 text-sm">
                  {t('noOrders')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
