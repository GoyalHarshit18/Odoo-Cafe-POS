import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [kdsTickets, setKdsTickets] = useState<KDSTicket[]>([]);
  const [orderCounter, setOrderCounter] = useState(1001);

  // Fetch floors from backend
  const fetchFloors = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pos/floors', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const mappedFloors = data.map((f: any) => ({
          id: f.id,
          name: f.name,
          tables: (f.tables || []).map((t: any) => ({
            id: t.id,
            number: t.number,
            seats: t.seats,
            status: t.status,
            floor: f.id
          }))
        }));
        setFloors(mappedFloors);
      }
    } catch (error) {
      console.error('Failed to fetch floors:', error);
    }
  }, []);

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pos/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
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
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  }, []);

  // Fetch KDS Tickets (Active Orders)
  const fetchKDSTickets = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders?status=active', { // Need to ensure API supports this
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        const tickets: KDSTicket[] = data.map((order: any) => ({
          orderId: order.id,
          tableNumber: order.tableNumber || '?',
          items: order.items.map((item: any) => ({
            product: { id: item.product, name: item.name, price: item.price },
            quantity: item.quantity
          })),
          status: order.kitchenStatus || 'to-cook',
          createdAt: new Date(order.createdAt),
          startedAt: order.startedAt,
          completedAt: order.completedAt,
          lockedBy: order.lockedBy
        }));
        setKdsTickets(tickets);
        // Also update orders state if needed, or keep them separate
        // setOrders(data); // If this overwrites local state negatively, be careful. 
        // Better to have separate sync for "My Orders" vs "All Orders" or just use KDS for kitchen.
      }
    } catch (error) {
      console.error("Failed to fetch KDS tickets");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchFloors();
      fetchProducts();
      fetchKDSTickets();

      const interval = setInterval(() => {
        fetchKDSTickets();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [fetchFloors, fetchProducts, fetchKDSTickets]);

  const currentScreen = location.pathname.split('/').pop() || 'dashboard';

  const setCurrentScreen = useCallback((screen: string) => {
    navigate(`/pos/${screen}`);
  }, [navigate]);

  const openSession = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sessions/open', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ openingBalance: 5000 })
      });

      if (response.ok) {
        const data = await response.json();
        setSession({
          id: data.id,
          openedAt: new Date(data.openedAt),
          cashier: data.cashierName || 'Staff User',
          openingBalance: data.openingBalance,
          totalSales: 0,
          ordersCount: 0,
        });
        localStorage.setItem('activeSession', JSON.stringify(data));
        navigate('/pos/floor');
      }
    } catch (error) {
      console.error('Failed to open session:', error);
    }
  }, [navigate]);

  const restoreSession = useCallback(() => {
    const saved = localStorage.getItem('activeSession');
    if (saved) {
      const data = JSON.parse(saved);
      setSession({
        id: data.id,
        openedAt: new Date(data.openedAt),
        cashier: data.cashierName || 'Staff User',
        openingBalance: data.openingBalance,
        totalSales: data.totalSales || 0,
        ordersCount: data.ordersCount || 0,
      });
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const closeSession = useCallback(async () => {
    if (session) {
      try {
        await fetch(`http://localhost:5000/api/sessions/${session.id}/close`, {
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

  const selectTable = useCallback((table: Table | null) => {
    setSelectedTable(table);
    if (table) {
      setCurrentOrder([]);
    }
  }, []);

  const updateTableStatus = useCallback(async (tableId: string, status: TableStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/pos/tables/${tableId}`, {
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
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tableId: selectedTable.id,
          sessionId: "6793910c6600a9435b674b88", // Hardcoded fallback or real ID if available
          items: currentOrder.map(item => ({
            product: item.product.id,
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
        const newOrder: Order = {
          id: savedOrder._id,
          tableId: selectedTable.id,
          tableNumber: selectedTable.number,
          items: [...currentOrder],
          status: 'in-kitchen',
          createdAt: new Date(),
          updatedAt: new Date(),
          total: total + tax,
        };
        setOrders(prev => [...prev, newOrder]);
      }
    } catch (error) {
      console.error('Failed to save order:', error);
    }

    clearOrder();
  }, [selectedTable, currentOrder, orderCounter, updateTableStatus, getOrderTotal, clearOrder]);

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
      let kitchenStatus = 'pending';
      if (status === 'preparing') kitchenStatus = 'cooking';
      if (status === 'completed') kitchenStatus = 'ready';

      await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ kitchenStatus })
      });
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
        const response = await fetch(`http://localhost:5000/api/orders/${tableOrder.id}/pay`, {
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
