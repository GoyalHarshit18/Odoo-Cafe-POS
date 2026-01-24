import { KDSTicket } from '@/types/pos';
import { Clock, ChefHat, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface KDSTicketCardProps {
  ticket: KDSTicket;
  onStatusChange: (status: KDSTicket['status']) => void;
}

const statusButtons = {
  'to-cook': { next: 'preparing' as const, label: 'Start Cooking', icon: ChefHat },
  'preparing': { next: 'completed' as const, label: 'Mark Ready', icon: CheckCircle },
  'completed': null,
};

export const KDSTicketCard = ({ ticket, onStatusChange }: KDSTicketCardProps) => {
  const elapsed = formatDistanceToNow(ticket.createdAt, { addSuffix: false });
  const nextAction = statusButtons[ticket.status];

  return (
    <div className={cn(
      'kds-ticket animate-slide-up',
      ticket.status === 'completed' && 'opacity-60'
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-kds-foreground">
            #{ticket.orderId}
          </span>
          <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-kds-foreground/80">
            Table {ticket.tableNumber}
          </span>
        </div>
        <div className="flex items-center gap-1 text-kds-foreground/60 text-xs">
          <Clock className="w-3 h-3" />
          {elapsed}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {ticket.items.map((item, idx) => (
          <div
            key={idx}
            className={cn(
              'flex items-center gap-2 text-kds-foreground',
              ticket.status === 'completed' && 'line-through opacity-60'
            )}
          >
            <span className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-sm font-bold">
              {item.quantity}
            </span>
            <span className="text-sm">{item.product.name}</span>
          </div>
        ))}
      </div>

      {nextAction && (
        <button
          onClick={() => onStatusChange(nextAction.next)}
          className={cn(
            'w-full py-3 rounded-lg font-medium transition-all duration-200',
            'flex items-center justify-center gap-2',
            ticket.status === 'to-cook'
              ? 'bg-warm-amber text-warm-wood hover:bg-warm-amber/90'
              : 'bg-kds-accent text-kds-background hover:bg-kds-accent/90'
          )}
        >
          <nextAction.icon className="w-5 h-5" />
          {nextAction.label}
        </button>
      )}
    </div>
  );
};
