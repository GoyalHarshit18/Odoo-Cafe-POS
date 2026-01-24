import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export const KPICard = ({ title, value, icon: Icon, trend, className }: KPICardProps) => {
  return (
    <div className={cn('kpi-card animate-fade-in', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        <div className="p-2 bg-accent rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium mb-1',
              trend.positive ? 'text-status-free' : 'text-destructive'
            )}
          >
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
    </div>
  );
};
