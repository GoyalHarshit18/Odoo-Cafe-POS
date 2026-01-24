import { usePOS } from '@/context/POSContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { FloorScreen } from '@/screens/FloorScreen';
import { OrderScreen } from '@/screens/OrderScreen';
import { PaymentScreen } from '@/screens/PaymentScreen';
import { KitchenScreen } from '@/screens/KitchenScreen';
import { CustomerScreen } from '@/screens/CustomerScreen';
import { ReportsScreen } from '@/screens/ReportsScreen';

export const POSPage = () => {
  const { currentScreen } = usePOS();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'floor':
        return <FloorScreen />;
      case 'order':
        return <OrderScreen />;
      case 'payment':
        return <PaymentScreen />;
      case 'kitchen':
        return <KitchenScreen />;
      case 'customer':
        return <CustomerScreen />;
      case 'reports':
        return <ReportsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <MainLayout>
      {renderScreen()}
    </MainLayout>
  );
};
