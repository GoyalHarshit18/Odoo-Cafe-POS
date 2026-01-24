import { OrderItem } from '@/types/pos';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderItemRowProps {
  item: OrderItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export const OrderItemRow = ({ item, onUpdateQuantity, onRemove }: OrderItemRowProps) => {
  const subtotal = item.product.price * item.quantity;

  return (
    <div className="order-item animate-slide-in-right">
      <img
        src={item.product.image}
        alt={item.product.name}
        className="w-12 h-12 rounded-lg object-cover"
      />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
        <p className="text-xs text-muted-foreground">₹{item.product.price} each</p>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(item.quantity - 1)}
          className={cn(
            'qty-btn bg-secondary text-secondary-foreground',
            'hover:bg-secondary/80'
          )}
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <span className="w-8 text-center font-semibold">{item.quantity}</span>
        
        <button
          onClick={() => onUpdateQuantity(item.quantity + 1)}
          className={cn(
            'qty-btn bg-primary text-primary-foreground',
            'hover:bg-primary/90'
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="font-semibold text-sm w-16 text-right">₹{subtotal}</span>
        <button
          onClick={onRemove}
          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
