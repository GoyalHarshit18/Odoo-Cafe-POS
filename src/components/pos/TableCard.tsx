import { Table } from '@/types/pos';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableCardProps {
  table: Table;
  onClick: () => void;
  selected?: boolean;
}

const statusConfig = {
  free: {
    label: 'Available',
    className: 'table-free',
    dot: 'bg-status-free',
  },
  occupied: {
    label: 'Occupied',
    className: 'table-occupied',
    dot: 'bg-status-occupied',
  },
  pending: {
    label: 'Payment Due',
    className: 'table-pending',
    dot: 'bg-status-pending',
  },
};

export const TableCard = ({ table, onClick, selected }: TableCardProps) => {
  const config = statusConfig[table.status];

  return (
    <button
      onClick={onClick}
      className={cn(
        'table-card w-full text-left transition-all duration-200',
        config.className,
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-2xl font-bold text-foreground">
          T{table.number}
        </span>
        <span className={cn('w-3 h-3 rounded-full animate-pulse-soft', config.dot)} />
      </div>
      
      <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
        <Users className="w-4 h-4" />
        <span>{table.seats} seats</span>
      </div>
      
      <div className="mt-2">
        <span className={cn(
          'status-badge',
          table.status === 'free' && 'status-badge-free',
          table.status === 'occupied' && 'status-badge-occupied',
          table.status === 'pending' && 'status-badge-pending',
        )}>
          {config.label}
        </span>
      </div>
    </button>
  );
};
