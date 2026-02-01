import { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { useLanguage } from '@/context/LanguageContext';
import { PaymentMethodCard } from '@/components/pos/PaymentMethodCard';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  QrCode,
  CheckCircle,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type PaymentMethod = 'cash' | 'card' | 'upi';
type PaymentState = 'select' | 'processing' | 'upi-qr' | 'success';

export const PaymentScreen = () => {
  const { selectedTable, currentOrder, getOrderTotal, completePayment, setCurrentScreen, orders } = usePOS();
  const { t } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>('select');
  const { toast } = useToast();

  // Get total from current order or from existing order for this table
  const existingOrder = orders.find(o => o.tableId === selectedTable?.id && o.status !== 'paid');
  const orderTotal = currentOrder.length > 0 ? getOrderTotal() : (existingOrder?.total || 0);
  const totalWithTax = Math.round(orderTotal * 1.05);

  const handlePayment = () => {
    if (!selectedMethod) return;

    if (selectedMethod === 'upi') {
      setPaymentState('upi-qr');
      return;
    }

    setPaymentState('processing');

    setTimeout(() => {
      completePayment(selectedMethod);
      setPaymentState('success');

      setTimeout(() => {
        toast({
          title: t('paymentSuccess'),
          description: `${t('table')} ${selectedTable?.number} is now free`,
        });
        setCurrentScreen('floor');
      }, 2000);
    }, 1500);
  };

  const handleUPIConfirm = () => {
    setPaymentState('processing');

    setTimeout(() => {
      completePayment('upi');
      setPaymentState('success');

      setTimeout(() => {
        toast({
          title: 'UPI ' + t('paymentSuccess'),
          description: `${t('table')} ${selectedTable?.number} is now free`,
        });
        setCurrentScreen('floor');
      }, 2000);
    }, 1000);
  };

  if (paymentState === 'upi-qr') {
    // Generate a simple UPI URL for the QR placeholder
    const upiUrl = `upi://pay?pa=merchant@upi&pn=CafeCloud&am=${totalWithTax}&cu=INR`;

    return (
      <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="pos-card p-8 max-w-sm w-full shadow-2xl border-2 border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary animate-pulse" />

          <h2 className="text-2xl font-bold mb-1 text-center">Scan & Pay</h2>
          <p className="text-muted-foreground mb-6 text-center text-sm">Cafe Cloud - Table {selectedTable?.number}</p>

          <div className="bg-white p-6 rounded-3xl mb-6 shadow-inner flex flex-col items-center">
            <div className="w-56 h-56 bg-foreground/5 rounded-2xl flex items-center justify-center border-2 border-dashed border-primary/20 relative group">
              <QrCode className="w-40 h-40 text-foreground transition-transform duration-300 group-hover:scale-95" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 backdrop-blur-[2px]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-white px-2 py-1 rounded-full shadow-sm">Secure Transfer</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 opacity-60">
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo.png" alt="UPI" className="h-4 object-contain" />
              <div className="h-4 w-[1px] bg-border" />
              <span className="text-[10px] font-semibold uppercase tracking-tighter">Powered by BHIM</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold mb-1">Amount to pay</p>
            <p className="text-5xl font-black text-primary">₹{totalWithTax}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => setPaymentState('select')}
              className="h-12 rounded-xl hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all"
            >
              <X className="w-4 h-4 mr-2" />
              {t('cancel')}
            </Button>
            <Button
              onClick={handleUPIConfirm}
              className="h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all font-bold"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentState === 'processing') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <Loader2 className="w-20 h-20 text-primary animate-spin relative z-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2 tracking-tight">{t('processing')}...</h2>
        <p className="text-muted-foreground max-w-[200px] mx-auto text-sm">Authenticating your secure payment transaction</p>
      </div>
    );
  }

  if (paymentState === 'success') {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-center animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #22c55e 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div className="flex flex-col items-center justify-center text-center p-6 max-w-md w-full relative">
          {/* Success Animation */}
          <div className="w-32 h-32 rounded-full bg-status-free/10 flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 rounded-full border-4 border-status-free animate-ping opacity-20" />
            <CheckCircle className="w-16 h-16 text-status-free animate-bounce-subtle" />
          </div>

          <h1 className="text-4xl font-black text-foreground mb-4 tracking-tighter uppercase italic">
            Successful Payment
          </h1>

          <div className="pos-card py-4 px-8 border-status-free/20 bg-status-free/5 mb-8">
            <p className="text-sm text-status-free font-bold uppercase tracking-widest mb-1">Total Received</p>
            <p className="text-4xl font-black text-status-free">₹{totalWithTax}</p>
          </div>

          <div className="space-y-2 text-muted-foreground">
            <p className="font-medium">Table {selectedTable?.number} is now available</p>
            <p className="text-xs opacity-60">Redirecting to floor view in a few seconds...</p>
          </div>

          {/* Lottie-like particles (simple div imitation) */}
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-status-free/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-pulse delay-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentScreen('order')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-primary" />
            {t('payment')}
          </h1>
          {selectedTable && (
            <p className="text-muted-foreground">{t('table')} {selectedTable.number}</p>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="pos-card p-6 mb-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">{t('total')}</p>
        <p className="text-5xl font-bold text-primary mb-4">₹{totalWithTax}</p>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span>{t('subtotal')}: ₹{orderTotal}</span>
          <span>{t('tax')} (5%): ₹{Math.round(orderTotal * 0.05)}</span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">{t('paymentMethods')}</h2>
        <div className="grid grid-cols-3 gap-4">
          <PaymentMethodCard
            title={t('cash')}
            description="Pay with cash"
            icon={Banknote}
            selected={selectedMethod === 'cash'}
            onClick={() => setSelectedMethod('cash')}
          />
          <PaymentMethodCard
            title={t('card')}
            description="Credit / Debit"
            icon={CreditCard}
            selected={selectedMethod === 'card'}
            onClick={() => setSelectedMethod('card')}
          />
          <PaymentMethodCard
            title={t('upi')}
            description="Scan QR code"
            icon={QrCode}
            selected={selectedMethod === 'upi'}
            onClick={() => setSelectedMethod('upi')}
          />
        </div>
      </div>

      {/* Confirm Button */}
      <Button
        onClick={handlePayment}
        disabled={!selectedMethod}
        size="lg"
        className="w-full h-14 text-lg touch-btn"
      >
        <CheckCircle className="w-5 h-5 mr-2" />
        {t('confirmPayment')} - ₹{totalWithTax}
      </Button>
    </div>
  );
};
