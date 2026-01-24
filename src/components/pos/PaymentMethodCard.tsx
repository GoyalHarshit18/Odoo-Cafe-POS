import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethodCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  selected?: boolean;
  onClick: () => void;
}

export const PaymentMethodCard = ({
  title,
  description,
  icon: Icon,
  selected,
  onClick,
}: PaymentMethodCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'payment-method transition-all duration-200',
        selected && 'payment-method-active'
      )}
    >
      <div
        className={cn(
          'w-16 h-16 rounded-2xl flex items-center justify-center transition-colors',
          selected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'
        )}
      >
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </button>
  );
};
