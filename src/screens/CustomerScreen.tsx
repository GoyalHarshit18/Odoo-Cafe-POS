import { usePOS } from '@/context/POSContext';
import { Monitor, CheckCircle, Clock, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CustomerScreen = () => {
  const { selectedTable, orders, currentOrder, getOrderTotal } = usePOS();

  // Find the most recent order for display
  const recentOrder = orders.filter(o => o.status !== 'paid').slice(-1)[0];
  const displayItems = currentOrder.length > 0 ? currentOrder : (recentOrder?.items || []);
  const total = currentOrder.length > 0 ? getOrderTotal() : (recentOrder?.total || 0);
  const isPaid = recentOrder?.status === 'paid';
  const hasPendingPayment = recentOrder?.status !== 'paid' && displayItems.length > 0;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 lg:p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Monitor className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Customer Display</h1>
          <p className="text-muted-foreground">
            {selectedTable ? `Table ${selectedTable.number}` : 'Welcome to Odoo Cafe'}
          </p>
        </div>

        {displayItems.length === 0 ? (
          <div className="pos-card p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-xl font-semibold text-muted-foreground mb-2">
              No Active Order
            </h2>
            <p className="text-muted-foreground">
              Your order will appear here once items are added
            </p>
          </div>
        ) : (
          <div className="pos-card overflow-hidden">
            {/* Order Items with Images */}
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Your Order</h2>
              <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin">
                {displayItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 animate-slide-in-right" style={{ animationDelay: `${i * 100}ms` }}>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.product.price} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold">₹{item.product.price * item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-secondary p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{total}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted-foreground">Tax (5%)</span>
                <span className="font-medium">₹{Math.round(total * 0.05)}</span>
              </div>
              <div className="flex justify-between items-center text-2xl font-bold border-t border-border pt-4">
                <span>Total</span>
                <span className="text-primary">₹{Math.round(total * 1.05)}</span>
              </div>
            </div>

            {/* Payment Status */}
            <div className={cn(
              'p-4 text-center',
              isPaid ? 'bg-status-free/10' : hasPendingPayment ? 'bg-status-pending/10' : 'bg-status-occupied/10'
            )}>
              {isPaid ? (
                <div className="flex items-center justify-center gap-2 text-status-free">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Payment Complete ✅</span>
                </div>
              ) : hasPendingPayment ? (
                <div className="flex items-center justify-center gap-2 text-status-pending">
                  <Clock className="w-5 h-5 animate-pulse" />
                  <span className="font-semibold">Payment Pending ⏳</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-status-occupied">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">Order in Progress</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Restaurant Branding */}
        <div className="mt-8 text-center text-muted-foreground">
          <p className="text-sm">Thank you for dining with us!</p>
          <p className="text-xs mt-1">Odoo Cafe POS • Premium Dining Experience</p>
        </div>
      </div>
    </div>
  );
};
