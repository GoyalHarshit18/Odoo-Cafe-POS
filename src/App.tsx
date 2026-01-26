import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { POSProvider } from "@/context/POSContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { LoginPage } from "./pages/Login";
import { AdminSignupPage } from "./pages/AdminSignup";
import { CustomerLoginPage } from "./pages/CustomerLogin";
import { CustomerDashboardPage } from "./pages/CustomerDashboard";
import { Home } from "./pages/Home";
import { POSPage } from "./pages/POS";
import NotFound from "./pages/NotFound";

import { DashboardScreen } from '@/screens/DashboardScreen';
import { FloorScreen } from '@/screens/FloorScreen';
import { OrderScreen } from '@/screens/OrderScreen';
import { PaymentSelectionScreen } from '@/screens/PaymentSelectionScreen';
import { KitchenScreen } from '@/screens/KitchenScreen';
import { CustomerScreen } from '@/screens/CustomerScreen';
import { ReportsScreen } from '@/screens/ReportsScreen';
import { AdminDashboardScreen } from '@/screens/AdminDashboardScreen';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BrowserRouter>
          <POSProvider>
            <LanguageProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin/signup" element={<AdminSignupPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardScreen />} />
                <Route path="/customer/login" element={<CustomerLoginPage />} />
                <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />

                <Route path="/pos" element={
                  <ProtectedRoute>
                    <POSPage />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardScreen />} />
                  <Route path="floor" element={<FloorScreen />} />
                  <Route path="table" element={<FloorScreen />} /> {/* Alias if needed */}
                  <Route path="order" element={<OrderScreen />} />
                  <Route path="payment" element={<PaymentSelectionScreen />} />
                  <Route path="kitchen" element={<KitchenScreen />} />
                  <Route path="customer" element={<CustomerScreen />} />
                  <Route path="reports" element={<ReportsScreen />} />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </LanguageProvider>
          </POSProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
