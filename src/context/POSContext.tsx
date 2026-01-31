import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Table, Order, OrderItem, Product, Session, KDSTicket, TableStatus, Floor } from '@/types/pos';
import { BASE_URL } from '@/lib/api';

interface POSContextType {
  session: Session | null;
  openSession: () => void;
  closeSession: () => void;

  floors: Floor[];
  products: Product[];
  selectedTable: Table | null;
  selectTable: (table: Table | null) => void;
  updateTableStatus: (tableId: string, status: TableStatus) => void;

  currentOrder: OrderItem[];
  addToOrder: (product: Product) => void;
  removeFromOrder: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearOrder: () => void;
  getOrderTotal: () => number;

  kdsTickets: KDSTicket[];
  sendToKitchen: () => void;
  updateKDSStatus: (orderId: string, status: KDSTicket['status']) => void;

  orders: Order[];
  completePayment: (method: 'cash' | 'card' | 'upi') => void;

  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  isFloorsLoading: boolean;
  isProductsLoading: boolean;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [kdsTickets, setKdsTickets] = useState<KDSTicket[]>([]);
  const [orderCounter, setOrderCounter] = useState(1001);
  const [isFloorsLoading, setIsFloorsLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  // Fetch floors from backend
  const fetchFloors = useCallback(async () => {
    try {
      setIsFloorsLoading(true);
      const response = await fetch(`${BASE_URL}/api/pos/floors`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Safe logging to prevent crash if tables are missing
        console.log('[POSContext] Fetched Floors:', data.map((f: any) => ({
          name: f.name,
          tables: (f.tables || []).map((t: any) => `${t.number}:${t.status}`)
        })));

        const mappedFloors = data.map((f: any) => ({
          id: f.id.toString(),
          name: f.name,
          tables: (f.tables || []).map((t: any) => ({
            id: t.id.toString(),
            number: t.number,
            seats: t.seats,
            status: t.status,
            floor: f.id.toString()
          }))
        }));
        setFloors(mappedFloors);
      }
    } catch (error) {
      console.error('Failed to fetch floors:', error);
    } finally {
      setIsFloorsLoading(false);
    }
  }, []);

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    try {
      setIsProductsLoading(true);
      const response = await fetch(`${BASE_URL}/api/pos/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log(`[POSContext] Fetched ${data.length} products from backend`);
        const mappedProducts = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          image: p.image
            ? (p.image.startsWith('http') ? p.image : `${BASE_URL}${p.image}`)
            : `${BASE_URL}/public/placeholder-food.png`,
          description: p.description
        }));
        console.log(`[POSContext] Mapped products:`, mappedProducts.map(p => `${p.name} (${p.category})`));
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsProductsLoading(false);
    }
  }, []);

  // Fetch KDS Tickets (Active Orders)
  const fetchKDSTickets = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/orders/all`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Only show orders that are actually in progress or ready
        const allActiveOrders = data.filter((o: any) =>
          ['running', 'preparing', 'ready', 'in-kitchen', 'paid'].includes(o.status)
        );

        // Filter duplicates: Keep only the latest order per table
        const seenTables = new Set();
        const activeOrders = allActiveOrders.filter((o: any) => {
          const tableId = o.tableId || o.Table?.id;
          if (seenTables.has(tableId)) return false;
          seenTables.add(tableId);
          return true;
        });

        const tickets: KDSTicket[] = activeOrders.map((order: any) => {
          const dbId = (order.id || order._id).toString();
          return {
            orderId: dbId,
            // Format for display to match user's screenshot
            ticketNumber: `ORD-${dbId.padStart(4, '0')}`,
            tableNumber: order.tableNumber || '?',
            items: order.items.map((item: any) => ({
              product: {
                id: item.productId || item.product,
                name: item.Product?.name || item.name || 'Item',
                price: item.price
              },
              quantity: item.quantity
            })),
            status: order.status === 'preparing' ? 'preparing' :
              (order.status === 'ready') ? 'completed' : 'to-cook',
            createdAt: new Date(order.createdAt),
            startedAt: order.startedAt,
            completedAt: order.completedAt,
            lockedBy: order.lockedBy
          };
        });
        setKdsTickets(tickets);
      } else {
        const errorText = await response.text();
        console.error("KDS Fetch Error:", response.status, errorText);
      }
    } catch (error) {
      console.error("Failed to fetch KDS tickets", error);
    }
  }, []);

  const checkActiveSession = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/sessions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data) {
          const sessionId = data.id || data._id;
          setSession({
            id: sessionId,
            openedAt: new Date(data.startTime),
            cashier: data.cashierName || 'Staff User',
            openingBalance: parseFloat(data.openingBalance),
            totalSales: data.totalSales || 0,
            ordersCount: data.ordersCount || 0,
          });
          localStorage.setItem('activeSession', JSON.stringify({ ...data, id: sessionId }));
        }
      }
    } catch (error) {
      console.error('Failed to check active session:', error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchFloors();
      fetchProducts();
      fetchKDSTickets();
      checkActiveSession();

      const syncInterval = setInterval(() => {
        fetchKDSTickets();
        fetchFloors(); // Fetch floors periodically for real-time updates
      }, 2000); // 2 seconds for better real-time feel
      return () => clearInterval(syncInterval);
    }
  }, [fetchFloors, fetchProducts, fetchKDSTickets, checkActiveSession]);

  const currentScreen = location.pathname.split('/').pop() || 'dashboard';

  const setCurrentScreen = useCallback((screen: string) => {
    navigate(`/pos/${screen}`);
  }, [navigate]);

  const openSession = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/sessions/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ openingBalance: 5000 })
      });

      if (response.ok) {
        const data = await response.json();
        const sessionId = data.id || data._id;
        setSession({
          id: sessionId,
          openedAt: new Date(data.startTime),
          cashier: data.cashierName || 'Staff User',
          openingBalance: parseFloat(data.openingBalance),
          totalSales: 0,
          ordersCount: 0,
        });
        localStorage.setItem('activeSession', JSON.stringify({ ...data, id: sessionId }));
        toast({ title: "Session Opened", description: "Terminal is now active." });
        navigate('/pos/floor');
      } else {
        const err = await response.json();
        if (err.message?.includes('already have an active session')) {
          // Auto-recovery: Sync State
          checkActiveSession();
          toast({ title: "Session Resumed", description: "You already have an active session." });
        } else {
          toast({ title: "Failed to Open Session", description: err.message || "Unknown error", variant: "destructive" });
        }
      }
    } catch (error) {
      console.error('Failed to open session:', error);
    }
  }, [navigate, checkActiveSession, toast]);

  const restoreSession = useCallback(() => {
    const saved = localStorage.getItem('activeSession');
    if (saved) {
      const data = JSON.parse(saved);
      const sessionId = data.id || data._id;
      setSession({
        id: sessionId,
        openedAt: new Date(data.startTime || data.openedAt),
        cashier: data.cashierName || 'Staff User',
        openingBalance: parseFloat(data.openingBalance),
        totalSales: data.totalSales || 0,
        ordersCount: data.ordersCount || 0,
      });
    } else {
      // If no local storage, ask server anyway
      checkActiveSession();
    }
  }, [checkActiveSession]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const closeSession = useCallback(async () => {
    if (session) {
      try {
        await fetch(`${BASE_URL}/api/sessions/${session.id}/close`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setSession(null);
        localStorage.removeItem('activeSession');
        navigate('/pos/dashboard');
      } catch (error) {
        console.error('Failed to close session:', error);
        // Fallback: Clear locally anyway
        setSession(null);
        localStorage.removeItem('activeSession');
      }
    }
  }, [session, navigate]);

  const selectTable = useCallback(async (table: Table | null) => {
    setSelectedTable(table);
    if (table && table.status === 'occupied') {
      try {
        const response = await fetch(`${BASE_URL}/api/orders/table/${table.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          const orderData = await response.json();
          const mappedOrder = (orderData.items || []).map((item: any) => ({
            product: {
              id: item.productId.toString(),
              name: item.name,
              price: parseFloat(item.price),
              category: 'Food', // Fallback or fetch from item.Product if included
              image: item.Product?.image || ''
            },
            quantity: item.quantity,
            notes: item.notes || ''
          }));
          setCurrentOrder(mappedOrder);
        } else {
          setCurrentOrder([]);
        }
      } catch (error) {
        console.error('Failed to fetch table items:', error);
        setCurrentOrder([]);
      }
    } else {
      setCurrentOrder([]);
    }
  }, []);

  const updateTableStatus = useCallback(async (tableId: string, status: TableStatus) => {
    try {
      const response = await fetch(`${BASE_URL}/api/pos/tables/${tableId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setFloors(prev => prev.map(floor => ({
          ...floor,
          tables: floor.tables.map(table =>
            table.id === tableId ? { ...table, status } : table
          )
        })));
        await fetchFloors();
      }
    } catch (error) {
      console.error('Failed to update table status:', error);
    }
  }, []);

  const addToOrder = useCallback((product: Product) => {
    setCurrentOrder(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromOrder = useCallback((productId: string) => {
    setCurrentOrder(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(productId);
      return;
    }
    setCurrentOrder(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromOrder]);

  const clearOrder = useCallback(() => {
    setCurrentOrder([]);
  }, []);

  const getOrderTotal = useCallback(() => {
    return currentOrder.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [currentOrder]);

  const sendToKitchen = useCallback(async () => {
    if (!selectedTable || currentOrder.length === 0) return;

    const orderId = `ORD-${orderCounter}`;
    setOrderCounter(prev => prev + 1);

    const newTicket: KDSTicket = {
      orderId,
      tableNumber: selectedTable.number,
      items: [...currentOrder],
      status: 'to-cook',
      createdAt: new Date(),
    };

    setKdsTickets(prev => [...prev, newTicket]);
    await updateTableStatus(selectedTable.id, 'occupied');

    const total = getOrderTotal();
    const tax = Math.round(total * 0.05);

    // Save to database
    try {
      if (!session?.id) {
        toast({ title: "No Session", description: "Please open a session before ordering.", variant: "destructive" });
        return;
      }

      const response = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tableId: parseInt(selectedTable.id.toString()),
          sessionId: parseInt(session.id.toString()),
          items: currentOrder.map(item => ({
            product: parseInt((item.product.id || (item.product as any)._id).toString()),
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity
          })),
          subtotal: total,
          tax: tax,
          total: total + tax
        })
      });

      if (response.ok) {
        const savedOrder = await response.json();
        const dbId = (savedOrder.id || savedOrder._id).toString();
        const newOrder: Order = {
          id: dbId,
          tableId: selectedTable.id,
          tableNumber: selectedTable.number,
          items: [...currentOrder],
          status: 'in-kitchen',
          createdAt: new Date(),
          updatedAt: new Date(),
          total: total + tax,
        };
        setOrders(prev => [...prev, newOrder]);

        // Update the local ticket with the real ID
        setKdsTickets(prev => prev.map(t =>
          t.orderId === orderId ? {
            ...t,
            orderId: dbId,
            ticketNumber: `ORD-${dbId.padStart(4, '0')}`
          } : t
        ));

        toast({ title: "Sent to Kitchen", description: `Order ${dbId} created successfully.` });
        clearOrder();
        await fetchFloors();
      } else {
        const err = await response.json();
        toast({ title: "Order Failed", description: err.message || "Could not save order to database.", variant: "destructive" });
        // Rollback local ticket
        setKdsTickets(prev => prev.filter(t => t.orderId !== orderId));
      }
    } catch (error: any) {
      console.error('Failed to save order:', error);
      toast({ title: "Network Error", description: error.message, variant: "destructive" });
      setKdsTickets(prev => prev.filter(t => t.orderId !== orderId));
    }
  }, [selectedTable, currentOrder, orderCounter, updateTableStatus, getOrderTotal, clearOrder, session, toast]);

  const updateKDSStatus = useCallback(async (orderId: string, status: KDSTicket['status']) => {
    // Optimistic update
    setKdsTickets(prev =>
      prev.map(ticket =>
        ticket.orderId === orderId
          ? {
            ...ticket,
            status,
            startedAt: status === 'preparing' ? new Date() : ticket.startedAt,
            completedAt: status === 'completed' ? new Date() : ticket.completedAt,
          }
          : ticket
      )
    );

    try {
      // Map KDS status to Order status enums if different
      // KDS: to-cook, preparing, completed
      // Order: pending, cooking, ready, served (or similar)
      let nextStatus = 'running';
      if (status === 'preparing') nextStatus = 'preparing';
      if (status === 'completed') nextStatus = 'ready';

      const response = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (response.ok) {
        await fetchKDSTickets();
      }
    } catch (error) {
      console.error("Failed to update KDS status on server");
      // Revert? For now, just log.
    }
  }, []);

  const completePayment = useCallback(async (method: 'cash' | 'card' | 'upi') => {
    if (!selectedTable) return;

    const tableOrder = orders.find(o => o.tableId === selectedTable.id && o.status !== 'paid');
    if (tableOrder) {
      try {
        const response = await fetch(`${BASE_URL}/api/orders/${tableOrder.id}/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ paymentMethod: method })
        });

        if (response.ok) {
          setOrders(prev =>
            prev.map(o =>
              o.id === tableOrder.id
                ? { ...o, status: 'paid', paymentMethod: method, updatedAt: new Date() }
                : o
            )
          );

          setSession(prev => prev ? {
            ...prev,
            totalSales: prev.totalSales + tableOrder.total,
            ordersCount: prev.ordersCount + 1,
          } : null);
          await fetchFloors();
        }
      } catch (error) {
        console.error('Failed to process payment in DB:', error);
      }
    }

    await updateTableStatus(selectedTable.id, 'free');
    setSelectedTable(null);
    clearOrder();
  }, [selectedTable, orders, updateTableStatus, clearOrder]);

  return (
    <POSContext.Provider
      value={{
        session,
        openSession,
        closeSession,
        floors,
        products,
        selectedTable,
        selectTable,
        updateTableStatus,
        currentOrder,
        addToOrder,
        removeFromOrder,
        updateQuantity,
        clearOrder,
        getOrderTotal,
        kdsTickets,
        sendToKitchen,
        updateKDSStatus,
        orders,
        completePayment,
        currentScreen,
        setCurrentScreen,
        isFloorsLoading,
        isProductsLoading,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within POSProvider');
  }
  return context;
};
