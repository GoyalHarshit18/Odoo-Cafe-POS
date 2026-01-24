import { Product } from '@/types/pos';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAdd: () => void;
}

export const ProductCard = ({ product, onAdd }: ProductCardProps) => {
  return (
    <div className="product-card group animate-fade-in">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="product-image transition-transform duration-300 group-hover:scale-105"
        />
        <button
          onClick={onAdd}
          className={cn(
            'absolute bottom-3 right-3 w-10 h-10 rounded-full',
            'bg-primary text-primary-foreground shadow-lg',
            'flex items-center justify-center',
            'transition-all duration-200 hover:scale-110 active:scale-95',
            'opacity-0 group-hover:opacity-100 md:opacity-100'
          )}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-3">
        <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {product.description}
          </p>
        )}
        <p className="text-primary font-bold mt-2">₹{product.price}</p>
      </div>
    </div>
  );
};
