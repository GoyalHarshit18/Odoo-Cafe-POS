export type Language = 'en' | 'hi';

export type TranslationKey = 
  // Common
  | 'loading'
  | 'hello'
  // Sidebar
  | 'dashboard'
  | 'pos'
  | 'kitchen'
  | 'customer'
  | 'orders'
  | 'payment'
  | 'reports'
  | 'settings'
  // POS / Order Screen
  | 'searchProducts'
  | 'allCategories'
  | 'table'
  | 'guest'
  | 'guests'
  | 'orderEmpty'
  | 'addToCart'
  | 'item'
  | 'qty'
  | 'price'
  | 'total'
  | 'sendToKitchen'
  | 'payNow'
  | 'items'
  | 'tax'
  | 'subtotal'
  | 'discount'
  // Kitchen Screen
  | 'toCook'
  | 'preparing'
  | 'completed'
  | 'ready'
  | 'noOrders'
  | 'markReady'
  | 'markCompleted'
  | 'orderId'
  // Customer Screen
  | 'yourFoodBeingPrepared'
  | 'readyToServe'
  | 'pleaseCollect'
  | 'paid'
  | 'unpaid'
  | 'paymentPending'
  | 'thankYou'
  // Payment Screen
  | 'paymentMethods'
  | 'cash'
  | 'card'
  | 'upi'
  | 'confirmPayment'
  | 'processing'
  | 'paymentSuccess'
  | 'changeDue'
  | 'amountTendered'
  | 'remaining'
  | 'receipt'
  | 'printReceipt'
  | 'newOrder'
  | 'cancel'
  // Dashboard
  | 'openSession'
  | 'closeRegister'
  | 'reloadData'
  | 'dailyRevenue'
  | 'totalOrders'
  | 'activeTables'
  | 'avgOrderValue';

export const translations: Record<TranslationKey, Record<Language, string>> = {
  // Common
  loading: { en: 'Loading...', hi: 'लोड हो रहा है...' },
  hello: { en: 'Hello', hi: 'नमस्ते' },
  
  // Sidebar
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  pos: { en: 'Point of Sale', hi: 'बिक्री केंद्र' },
  kitchen: { en: 'Kitchen Display', hi: 'रसोई डिस्प्ले' },
  customer: { en: 'Customer View', hi: 'ग्राहक डिस्प्ले' },
  orders: { en: 'Orders', hi: 'ऑर्डर' },
  payment: { en: 'Payment', hi: 'भुगतान' },
  reports: { en: 'Reports', hi: 'रिपोर्ट' },
  settings: { en: 'Settings', hi: 'सैटिंग्स' },

  // POS / Order Screen
  searchProducts: { en: 'Search products...', hi: 'उत्पाद खोजें...' },
  allCategories: { en: 'All Categories', hi: 'सभी श्रेणियां' },
  table: { en: 'Table', hi: 'मेज़' },
  guest: { en: 'Guest', hi: 'अतिथि' },
  guests: { en: 'Guests', hi: 'अतिथि' },
  orderEmpty: { en: 'Order is empty', hi: 'ऑर्डर खाली है' },
  addToCart: { en: 'Add to Cart', hi: 'कार्ट में जोड़ें' },
  item: { en: 'Item', hi: 'वस्तु' },
  qty: { en: 'Qty', hi: 'मात्रा' },
  price: { en: 'Price', hi: 'मूल्य' },
  total: { en: 'Total', hi: 'कुल' },
  sendToKitchen: { en: 'Send to Kitchen', hi: 'किचन को भेजें' },
  payNow: { en: 'Pay Now', hi: 'अभी भुगतान करें' },
  items: { en: 'Items', hi: 'वस्तुएं' },
  tax: { en: 'Tax', hi: 'कर' },
  subtotal: { en: 'Subtotal', hi: 'उपयोग' },
  discount: { en: 'Discount', hi: 'छूट' },

  // Kitchen Screen
  toCook: { en: 'To Cook', hi: 'पकाने के लिए' },
  preparing: { en: 'Preparing', hi: 'तैयार हो रहा है' },
  completed: { en: 'Completed', hi: 'पूरा हुआ' },
  ready: { en: 'Ready', hi: 'तैयार' },
  noOrders: { en: 'No active orders', hi: 'कोई सक्रिय ऑर्डर नहीं' },
  markReady: { en: 'Mark Ready', hi: 'तैयार चिह्नित करें' },
  markCompleted: { en: 'Mark Completed', hi: 'पूरा चिह्नित करें' },
  orderId: { en: 'Order ID', hi: 'ऑर्डर आईडी' },

  // Customer Screen
  yourFoodBeingPrepared: { en: 'Your food is being prepared', hi: 'आपका खाना तैयार हो रहा है' },
  readyToServe: { en: 'Ready to serve', hi: 'परोसने के लिए तैयार' },
  pleaseCollect: { en: 'Please collect your order', hi: 'कृपया अपना ऑर्डर लें' },
  paid: { en: 'Paid', hi: 'भुगतान किया गया' },
  unpaid: { en: 'Unpaid', hi: 'भुगतान शेष' },
  paymentPending: { en: 'Payment Pending', hi: 'भुगतान लंबित' },
  thankYou: { en: 'Thank you for dining with us!', hi: 'हमारे साथ भोजन करने के लिए धन्यवाद!' },

  // Payment Screen
  paymentMethods: { en: 'Payment Methods', hi: 'भुगतान विधियां' },
  cash: { en: 'Cash', hi: 'नकद' },
  card: { en: 'Card', hi: 'कार्ड' },
  upi: { en: 'UPI / QR', hi: 'यूपीआई / क्यूआर' },
  confirmPayment: { en: 'Confirm Payment', hi: 'भुगतान की पुष्टि करें' },
  processing: { en: 'Processing...', hi: 'प्रोसेसिंग...' },
  paymentSuccess: { en: 'Payment Successful', hi: 'भुगतान सफल' },
  changeDue: { en: 'Change Due', hi: 'वापसी राशि' },
  amountTendered: { en: 'Amount Tendered', hi: 'दी गई राशि' },
  remaining: { en: 'Remaining', hi: 'शेष' },
  receipt: { en: 'Receipt', hi: 'रसीद' },
  printReceipt: { en: 'Print Receipt', hi: 'रसीद प्रिंट करें' },
  newOrder: { en: 'New Order', hi: 'नया ऑर्डर' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },

  // Dashboard
  openSession: { en: 'Open Session', hi: 'सत्र खोलें' },
  closeRegister: { en: 'Close Register', hi: 'रजिस्टर बंद करें' },
  reloadData: { en: 'Reload Data', hi: 'डेटा रीलोड करें' },
  dailyRevenue: { en: 'Daily Revenue', hi: 'दैनिक राजस्व' },
  totalOrders: { en: 'Total Orders', hi: 'कुल ऑर्डर' },
  activeTables: { en: 'Active Tables', hi: 'सक्रिय मेजें' },
  avgOrderValue: { en: 'Avg. Order Value', hi: 'औसत ऑर्डर मूल्य' }
};
