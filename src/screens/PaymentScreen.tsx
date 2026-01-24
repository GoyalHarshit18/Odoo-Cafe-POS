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
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="pos-card p-8 max-w-sm w-full animate-fade-in">
          <h2 className="text-xl font-bold mb-2">UPI {t('payment')}</h2>
          <p className="text-muted-foreground mb-6">Scan QR code to pay</p>

          <div className="bg-white p-4 rounded-2xl mb-4">
            <div className="w-48 h-48 mx-auto bg-foreground/5 rounded-xl flex items-center justify-center">
              <QrCode className="w-32 h-32 text-foreground" />
            </div>
          </div>

          <p className="text-3xl font-bold text-primary mb-6">₹{totalWithTax}</p>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => setPaymentState('select')}
              className="touch-btn"
            >
              <X className="w-4 h-4 mr-2" />
              {t('cancel')}
            </Button>
            <Button onClick={handleUPIConfirm} className="touch-btn">
              <CheckCircle className="w-4 h-4 mr-2" />
              {t('confirmPayment')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentState === 'processing') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-fade-in">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-bold mb-2">{t('processing')}</h2>
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (paymentState === 'success') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-status-free/20 flex items-center justify-center mb-4 animate-bounce-subtle">
          <CheckCircle className="w-12 h-12 text-status-free" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t('paymentSuccess')}</h2>
        <p className="text-muted-foreground mb-2">₹{totalWithTax} received</p>
        <p className="text-sm text-muted-foreground">Returning to floor view...</p>
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
