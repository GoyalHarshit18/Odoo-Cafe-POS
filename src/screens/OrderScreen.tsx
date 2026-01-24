import { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { useLanguage } from '@/context/LanguageContext';
import { ProductCard } from '@/components/pos/ProductCard';
import { OrderItemRow } from '@/components/pos/OrderItemRow';
import { products, categories } from '@/data/products';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag,
  Send,
  CreditCard,
  Trash2,
  ArrowLeft,
  Search,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export const OrderScreen = () => {
  const {
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

  const handleSendToKitchen = () => {
    if (!selectedTable) {
      toast({
        title: 'No table selected',
        description: 'Please select a table first',
        variant: 'destructive',
      });
      setCurrentScreen('floor');
      return;
    }

    sendToKitchen();
    toast({
      title: 'Order sent to kitchen!',
      description: `Order for Table ${selectedTable.number} is being prepared`,
    });
    updateTableStatus(selectedTable.id, 'occupied');
  };

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

    updateTableStatus(selectedTable.id, 'pending');
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
                <p className="text-sm text-muted-foreground">
                  {t('table')} {selectedTable.number} • {selectedTable.seats} {t('guests')}
                </p>
              )}
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('searchProducts')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.id)}
              className="whitespace-nowrap touch-btn"
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.id === 'all' ? t('allCategories') : cat.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={() => addToOrder(product)}
              />
            ))}
          </div>
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
          onSendToKitchen={handleSendToKitchen}
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
                onSendToKitchen={() => {
                  handleSendToKitchen();
                  setShowCart(false);
                }}
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
  onSendToKitchen: () => void;
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
  onSendToKitchen,
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
            onClick={onSendToKitchen}
            disabled={itemCount === 0}
            variant="outline"
            className="touch-btn"
          >
            <Send className="w-4 h-4 mr-2" />
            {t('sendToKitchen')}
          </Button>
          <Button
            onClick={onProceedToPayment}
            disabled={itemCount === 0}
            className="touch-btn"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {t('payment')}
          </Button>
        </div>
      </div>
    </>
  );
};
