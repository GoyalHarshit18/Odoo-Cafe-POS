import { useRef, useState, useEffect } from 'react';
import { BASE_URL, getAuthToken } from '@/lib/api';
import { CheckCircle2, Clock, Download, LogOut } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
}

interface CustomerOrder {
    id: string;
    tokenNumber: string;
    tableNumber?: number;
    items: OrderItem[];
    totalAmount: number;
    paymentStatus: 'PAID' | 'PENDING';
    preparationMessage: string;
}

export const CustomerDisplayScreen = () => {
    const billRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [order, setOrder] = useState<CustomerOrder | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch customer's current order from backend
        const fetchCustomerOrder = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) {
                    navigate('/login');
                    return;
                }

                const token = getAuthToken();
                if (!token) {
                    navigate('/login'); // Redirect if no token
                    return;
                }

                const user = JSON.parse(userStr);
                const response = await fetch(`${BASE_URL}/api/orders/customer/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setOrder(data);
                } else {
                    // Use mock data if no order found
                    setOrder({
                        id: '1',
                        tokenNumber: 'T-007',
                        tableNumber: 7,
                        items: [
                            {
                                id: '1',
                                name: 'Chocolate Lava Cake',
                                quantity: 1,
                                price: 299,
                                image: 'https://images.unsplash.com/photo-1563805039227-9362e9910fbc?w=200&h=200&fit=crop'
                            },
                            {
                                id: '2',
                                name: 'Iced Latte',
                                quantity: 1,
                                price: 199,
                                image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=200&h=200&fit=crop'
                            }
                        ],
                        totalAmount: 523,
                        paymentStatus: 'PAID',
                        preparationMessage: 'Your delicious treats are being served! 🍰☕'
                    });
                }
            } catch (error) {
                console.error('Failed to fetch order:', error);
            }
        };

        fetchCustomerOrder();
    }, [navigate]);

    const handleDownloadPDF = async () => {
        if (!billRef.current || isGenerating || !order) return;
        setIsGenerating(true);

        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const element = billRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                logging: false,
                width: element.scrollWidth,
                height: element.scrollHeight,
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 10;
            const imgWidth = pageWidth - (margin * 2);
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
            pdf.save(`Cafe_Cloud_Bill_${order.tokenNumber}.pdf`);
        } catch (error) {
            console.error('PDF Generation failed:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const isPaid = order.paymentStatus === 'PAID';

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
            {/* Header */}
            <header className="bg-card border-b border-border shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">O</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-foreground">Cafe Cloud</h1>
                            <p className="text-xs text-muted-foreground">Customer Display</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleDownloadPDF}
                            disabled={isGenerating}
                            className="touch-btn"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {isGenerating ? 'Generating...' : 'Download Bill'}
                        </Button>
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="touch-btn"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* Status Banner */}
            <div className={`py - 4 ${isPaid ? 'bg-status-free/10' : 'bg-warm-amber/10'} `}>
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex items-center justify-center gap-3">
                        {isPaid ? (
                            <>
                                <CheckCircle2 className="w-6 h-6 text-status-free" />
                                <p className="text-status-free font-semibold">
                                    PAYMENT SUCCESSFUL — Your order is confirmed!
                                </p>
                            </>
                        ) : (
                            <>
                                <Clock className="w-6 h-6 text-warm-amber" />
                                <p className="text-warm-amber font-semibold">
                                    PAYMENT PENDING — Please complete payment at the counter
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="pos-card p-8" ref={billRef} id="bill-content">
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Token Number</p>
                            <p className="text-3xl font-bold text-primary">{order.tokenNumber}</p>
                        </div>
                        {order.tableNumber && (
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground mb-1">Table</p>
                                <p className="text-2xl font-bold text-foreground">{order.tableNumber}</p>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4 mb-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Your Order</h2>
                        {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                                <img
                                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop'}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                    crossOrigin="anonymous"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop';
                                    }}
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-foreground">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                </div>
                                <p className="font-bold text-primary">
                                    ₹{(item.price * item.quantity).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between pt-6 border-t border-border">
                        <span className="text-lg font-semibold text-foreground">Total Payable</span>
                        <span className="text-2xl font-bold text-primary">
                            ₹{order.totalAmount.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Preparation Message */}
                <div className="mt-6 text-center">
                    <p className="text-lg text-muted-foreground">{order.preparationMessage}</p>
                </div>
            </main>
        </div>
    );
};
