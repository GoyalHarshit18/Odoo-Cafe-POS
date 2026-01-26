// POS Types

export type TableStatus = 'free' | 'occupied';

export interface Table {
  id: string;
  number: number;
  seats: number;
  status: TableStatus;
  orderId?: string;
  floor: string;
}

export interface Floor {
  id: string;
  name: string;
  tables: Table[];
}

export type ProductCategory = 'pizza' | 'burgers' | 'pasta' | 'sides' | 'beverages' | 'desserts';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  image: string;
  description?: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'pending' | 'in-kitchen' | 'preparing' | 'ready' | 'served' | 'paid';

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  total: number;
  paymentMethod?: 'cash' | 'card' | 'upi';
}

export interface Session {
  id: string;
  openedAt: Date;
  closedAt?: Date;
  cashier: string;
  openingBalance: number;
  closingBalance?: number;
  totalSales: number;
  ordersCount: number;
}

export type KDSStatus = 'to-cook' | 'preparing' | 'completed';

export interface KDSTicket {
  orderId: string;
  tableNumber: number;
  items: OrderItem[];
  status: KDSStatus;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  lockedBy?: string | number; // User ID
}
