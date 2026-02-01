import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { POSProvider } from "@/context/POSContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { getAuthToken } from "@/lib/api";

// Lazy Load Pages
const LoginPage = lazy(() => import("./pages/Login").then(module => ({ default: module.LoginPage })));
const AdminSignupPage = lazy(() => import("./pages/AdminSignup").then(module => ({ default: module.AdminSignupPage })));
const Home = lazy(() => import("./pages/Home").then(module => ({ default: module.Home })));
const POSPage = lazy(() => import("./pages/POS").then(module => ({ default: module.POSPage })));
const NotFound = lazy(() => import("./pages/NotFound")); // Default export usually

// Lazy Load Screens
const DashboardScreen = lazy(() => import("@/screens/DashboardScreen").then(m => ({ default: m.DashboardScreen })));
const FloorScreen = lazy(() => import("@/screens/FloorScreen").then(m => ({ default: m.FloorScreen })));
const OrderScreen = lazy(() => import("@/screens/OrderScreen").then(m => ({ default: m.OrderScreen })));
const PaymentSelectionScreen = lazy(() => import("@/screens/PaymentSelectionScreen").then(m => ({ default: m.PaymentSelectionScreen })));
const KitchenScreen = lazy(() => import("@/screens/KitchenScreen").then(m => ({ default: m.KitchenScreen })));
const KitchenStaffScreen = lazy(() => import("@/screens/KitchenStaffScreen").then(m => ({ default: m.KitchenStaffScreen })));
const ReportsScreen = lazy(() => import("@/screens/ReportsScreen").then(m => ({ default: m.ReportsScreen })));
const AdminDashboardScreen = lazy(() => import("@/screens/AdminDashboardScreen").then(m => ({ default: m.AdminDashboardScreen })));

// Loading Component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getAuthToken();
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
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/admin/signup" element={<AdminSignupPage />} />
                  <Route path="/admin/dashboard" element={<AdminDashboardScreen />} />
                  <Route path="/kitchen-display" element={
                    <ProtectedRoute>
                      <KitchenStaffScreen />
                    </ProtectedRoute>
                  } />

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
                    <Route path="reports" element={<ReportsScreen />} />
                  </Route>

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </LanguageProvider>
          </POSProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
