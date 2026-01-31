import { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { useLanguage } from '@/context/LanguageContext';
import { ProductCard } from '@/components/pos/ProductCard';
import { OrderItemRow } from '@/components/pos/OrderItemRow';
import { categories } from '@/data/products';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag,
  Send,
  CreditCard,
  Trash2,
  ArrowLeft,
  Search,
  X,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export const OrderScreen = () => {
  const {
    products,
    selectedTable,
    currentOrder,
    addToOrder,
    removeFromOrder,
    updateQuantity,
    clearOrder,
    getOrderTotal,
    sendToKitchen,
    setCurrentScreen,
    updateTableStatus,
    isProductsLoading,
  } = usePOS();

  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const { toast } = useToast();

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const allCategoriesLabel = t('allCategories');
  // Temporary fix to update the "All" category label dynamically if needed
  // Alternatively, handle rendering logic in the map below



  const handleProceedToPayment = () => {
    if (!selectedTable) {
      toast({
        title: 'No table selected',
        description: 'Please select a table first',
        variant: 'destructive',
      });
      return;
    }

    if (currentOrder.length === 0) {
      toast({
        title: 'Empty order',
        description: 'Add items to proceed to payment',
        variant: 'destructive',
      });
      return;
    }

    // Automatically send to kitchen when proceeding to payment
    sendToKitchen();

    setCurrentScreen('payment');
  };

  const total = getOrderTotal();
  const itemCount = currentOrder.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentScreen('floor')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-primary" />
                Order Screen
              </h1>
              {selectedTable && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {t('table')} {selectedTable.number} • {selectedTable.seats} {t('guests')}
                  </p>
                  {selectedTable.status === 'occupied' && (
                    <span className="px-2 py-0.5 bg-status-occupied/10 text-status-occupied text-[10px] font-bold rounded-full border border-status-occupied/20 animate-pulse">
                      IN PROGRESS
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('searchProducts')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-4 overflow-x-auto pb-6 mb-6 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "relative flex-shrink-0 w-32 h-40 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 group",
                selectedCategory === cat.id
                  ? "ring-4 ring-primary ring-offset-2 scale-105 shadow-lg"
                  : "hover:scale-105 hover:shadow-md grayscale-[0.3] hover:grayscale-0"
              )}
            >
              <img
                src={(cat as any).image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80';
                }}
              />
              <div className={cn(
                "absolute inset-0 flex flex-col items-center justify-end p-3 transition-colors duration-300",
                selectedCategory === cat.id
                  ? "bg-primary/40"
                  : "bg-black/40 group-hover:bg-black/20"
              )}>
                <span className="text-2xl mb-1 drop-shadow-md">{cat.icon}</span>
                <span className="text-xs font-bold text-white uppercase tracking-wider text-center drop-shadow-md">
                  {cat.id === 'all' ? t('allCategories') : cat.name}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {isProductsLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
              <p className="text-muted-foreground animate-pulse">Fetching your menu...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={() => addToOrder(product)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <ShoppingBag className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
              <h3 className="text-lg font-medium">No Products Found</h3>
              <p className="text-muted-foreground max-w-xs">
                {searchQuery
                  ? `No products match "${searchQuery}"`
                  : "This category is currently empty. Add products from the Admin Dashboard."}
              </p>
              {!searchQuery && (
                <Button variant="outline" className="mt-6" onClick={() => window.location.href = '/admin/dashboard'}>
                  Go to Admin Dashboard
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Mobile Cart Toggle */}
        {itemCount > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="lg:hidden fixed bottom-4 right-4 z-40 bg-primary text-primary-foreground px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="font-semibold">{itemCount} {t('items')}</span>
            <span className="font-bold">₹{total}</span>
          </button>
        )}
      </div>

      {/* Cart Panel - Desktop */}
      <div className="hidden lg:flex flex-col w-96 bg-card border border-border rounded-2xl overflow-hidden">
        <CartContent
          currentOrder={currentOrder}
          updateQuantity={updateQuantity}
          removeFromOrder={removeFromOrder}
          clearOrder={clearOrder}
          total={total}
          itemCount={itemCount}
          onProceedToPayment={handleProceedToPayment}
          selectedTable={selectedTable}
        />
      </div>

      {/* Cart Panel - Mobile */}
      {showCart && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowCart(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl max-h-[80vh] flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-bold text-lg">{t('orders')}</h2>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-secondary rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CartContent
                currentOrder={currentOrder}
                updateQuantity={updateQuantity}
                removeFromOrder={removeFromOrder}
                clearOrder={clearOrder}
                total={total}
                itemCount={itemCount}
                onProceedToPayment={() => {
                  handleProceedToPayment();
                  setShowCart(false);
                }}
                selectedTable={selectedTable}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CartContentProps {
  currentOrder: any[];
  updateQuantity: (id: string, qty: number) => void;
  removeFromOrder: (id: string) => void;
  clearOrder: () => void;
  total: number;
  itemCount: number;
  onProceedToPayment: () => void;
  selectedTable: any;
}

const CartContent = ({
  currentOrder,
  updateQuantity,
  removeFromOrder,
  clearOrder,
  total,
  itemCount,
  onProceedToPayment,
  selectedTable,
}: CartContentProps) => {
  const { t } = useLanguage();
  return (
    <>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Cart</h2>
          {itemCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearOrder}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {t('cancel')}
            </Button>
          )}
        </div>
        {selectedTable && (
          <p className="text-sm text-muted-foreground">
            {t('table')} {selectedTable.number}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {currentOrder.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t('orderEmpty')}</p>
            <p className="text-sm">{t('searchProducts')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentOrder.map((item) => (
              <OrderItemRow
                key={item.product.id}
                item={item}
                onUpdateQuantity={(qty) => updateQuantity(item.product.id, qty)}
                onRemove={() => removeFromOrder(item.product.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('subtotal')}</span>
            <span>₹{total}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('tax')} (5%)</span>
            <span>₹{Math.round(total * 0.05)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
            <span>{t('total')}</span>
            <span className="text-primary">₹{Math.round(total * 1.05)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">

          <Button
            onClick={onProceedToPayment}
            disabled={itemCount === 0}
            className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all touch-btn"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {t('payment')}
          </Button>
        </div>
      </div>
    </>
  );
};
