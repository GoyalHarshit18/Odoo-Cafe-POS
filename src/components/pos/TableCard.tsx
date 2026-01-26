import { Table } from '@/types/pos';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableCardProps {
  table: Table;
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
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
};

export const TableCard = ({ table, onClick, selected, disabled }: TableCardProps) => {
  const config = statusConfig[table.status];
  const isOccupied = table.status === 'occupied';
  const isDisabled = disabled || isOccupied;

  return (
    <button
      onClick={isOccupied ? undefined : onClick}
      disabled={disabled}
      className={cn(
        'table-card w-full text-left transition-all duration-200',
        config.className,
        selected && 'ring-2 ring-primary ring-offset-2',
        isOccupied && 'cursor-default opacity-80 filter grayscale-[0.2]',
        disabled && 'cursor-not-allowed'
      )}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-2xl font-bold text-foreground">
          T{table.number}
        </span>
        <span className={cn('w-3 h-3 rounded-full', config.dot, !isOccupied && 'animate-pulse-soft')} />
      </div>

      <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
        <Users className="w-4 h-4" />
        <span>{table.seats} seats</span>
      </div>

      <div className="mt-2 text-right">
        <span className={cn(
          'status-badge',
          table.status === 'free' && 'status-badge-free',
          table.status === 'occupied' && 'status-badge-occupied',
        )}>
          {config.label}
        </span>
      </div>
    </button>
  );
};
