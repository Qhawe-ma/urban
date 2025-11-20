
import React, { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle, MapPin, Box, ArrowRight, Clock } from 'lucide-react';
import { getOrder } from '../services/productService';
import { Order } from '../types';

interface OrderTrackingProps {
  initialOrderId?: string | null;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ initialOrderId }) => {
  const [orderId, setOrderId] = useState(initialOrderId || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progressWidth, setProgressWidth] = useState(0);

  const fetchOrderData = async (id: string) => {
    if (!id.trim()) return;
    
    setLoading(true);
    setError('');
    setOrder(null);
    setProgressWidth(0); // Reset animation

    try {
      const result = await getOrder(id.trim());
      if (result) {
        setOrder(result);
      } else {
        setError('Order not found. Please check your Order ID.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrderData(orderId);
  };

  // Automatically fetch order if initialOrderId is provided
  useEffect(() => {
    if (initialOrderId) {
      setOrderId(initialOrderId);
      fetchOrderData(initialOrderId);
    }
  }, [initialOrderId]);

  const STATUS_STEPS = [
    { key: 'Processing', label: 'Processing & Packing', icon: Box, desc: 'We are packaging your items with care.' },
    { key: 'Shipped', label: 'On the Move', icon: Truck, desc: 'Your order has left our warehouse.' },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: MapPin, desc: 'The courier is in your area.' },
    { key: 'Delivered', label: 'Delivered', icon: CheckCircle, desc: 'Enjoy your new look!' },
  ];

  useEffect(() => {
    if (order) {
      const index = STATUS_STEPS.findIndex(s => s.key === order.status);
      // Calculate percentage for the progress bar width
      // We want it to line up with the centers of the circles.
      // 0 items = 0%, 1 item = 0%, 2 items = 33%, 3 = 66%, 4 = 100% roughly
      const totalSteps = STATUS_STEPS.length;
      const percent = index === -1 ? 0 : (index / (totalSteps - 1)) * 100;
      
      // Add a small delay to ensure the DOM is ready for the transition visual
      const timer = setTimeout(() => {
        setProgressWidth(Math.max(0, Math.min(percent, 100)));
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [order]);

  const getCurrentStepIndex = () => {
      if (!order) return -1;
      return STATUS_STEPS.findIndex(s => s.key === order.status);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 min-h-[80vh]">
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Track Your Order</h1>
        <p className="text-gray-500 text-lg font-light">Enter your Order ID to see exactly where your package is.</p>
      </div>

      <form onSubmit={handleSearch} className="max-w-md mx-auto mb-16 relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400 group-focus-within:text-urban-900 transition-colors" size={20} />
        </div>
        <input 
          type="text" 
          placeholder="e.g., ORD-806290" 
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="w-full pl-12 pr-14 py-4 border-2 border-gray-100 rounded-xl shadow-sm focus:outline-none focus:border-urban-900 focus:ring-4 focus:ring-urban-900/10 transition-all text-lg font-medium bg-gray-50 focus:bg-white"
        />
        <button 
          type="submit"
          disabled={loading}
          className="absolute right-2 top-2 bottom-2 px-4 bg-urban-900 text-white rounded-lg hover:bg-urban-800 disabled:opacity-70 flex items-center justify-center transition-transform active:scale-95"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ArrowRight size={20} />}
        </button>
      </form>

      {error && (
        <div className="max-w-md mx-auto text-center text-red-600 bg-red-50 p-4 rounded-lg mb-8 border border-red-100 animate-pulse">
          {error}
        </div>
      )}

      {order && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slide-up transition-all">
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="text-center md:text-left">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Order Number</div>
                <h2 className="text-2xl font-bold text-urban-900">{order.id}</h2>
             </div>
             <div className="text-center md:text-right">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Estimated Delivery</div>
                <p className="text-lg font-medium text-gray-700">3-5 Business Days</p>
             </div>
          </div>

          <div className="p-6 md:p-10">
            {/* Progress Bar Section */}
            <div className="relative mb-16 mt-4">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-100 rounded-full -translate-y-1/2 hidden md:block"></div>
                
                {/* Animated Foreground Line */}
                <div 
                    className="absolute top-1/2 left-0 h-2 bg-urban-900 rounded-full -translate-y-1/2 hidden md:block transition-all duration-[1500ms] ease-out"
                    style={{ width: `${progressWidth}%` }}
                ></div>

                {/* Steps */}
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-0">
                    {STATUS_STEPS.map((step, index) => {
                        const currentIndex = getCurrentStepIndex();
                        const isActive = index === currentIndex;
                        const isCompleted = index <= currentIndex;
                        const Icon = step.icon;

                        return (
                            <div key={step.key} className={`relative flex md:flex-col items-center z-10 group md:w-48 ${index === 0 ? 'md:items-start' : index === STATUS_STEPS.length - 1 ? 'md:items-end' : 'md:items-center'}`}>
                                
                                {/* Icon Circle */}
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500
                                    ${isActive ? 'bg-urban-900 border-urban-100 scale-110 shadow-lg ring-4 ring-urban-50' : ''}
                                    ${isCompleted && !isActive ? 'bg-urban-900 border-urban-900 text-white' : ''}
                                    ${!isCompleted ? 'bg-white border-gray-200 text-gray-300' : ''}
                                `}>
                                    <Icon size={20} className={`
                                        ${isActive ? 'text-white animate-bounce' : ''} 
                                        ${isCompleted && !isActive ? 'text-white' : ''}
                                    `} />
                                </div>

                                {/* Mobile Line Connector */}
                                {index !== STATUS_STEPS.length - 1 && (
                                    <div className={`absolute left-6 top-12 w-1 h-16 -ml-0.5 md:hidden ${isCompleted && getCurrentStepIndex() > index ? 'bg-urban-900' : 'bg-gray-100'}`}></div>
                                )}

                                {/* Text */}
                                <div className={`ml-6 md:ml-0 md:mt-4 flex flex-col ${index === 0 ? 'md:items-start md:text-left' : index === STATUS_STEPS.length - 1 ? 'md:items-end md:text-right' : 'md:items-center md:text-center'}`}>
                                    <span className={`font-bold text-base transition-colors ${isCompleted ? 'text-urban-900' : 'text-gray-400'}`}>
                                        {step.label}
                                    </span>
                                    <span className="text-xs text-gray-500 max-w-[150px] mt-1 hidden md:block">
                                        {step.desc}
                                    </span>
                                    {/* Mobile Description */}
                                    <span className="text-xs text-gray-500 mt-1 md:hidden">
                                        {step.desc}
                                    </span>
                                    
                                    {/* Packaging status specific text */}
                                    {isActive && step.key === 'Processing' && (
                                        <span className="md:hidden inline-block px-2 py-1 bg-urban-50 text-urban-900 text-[10px] font-bold uppercase tracking-wider rounded mt-2">
                                            Packing in progress...
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Order Items Summary */}
            <div className="border-t border-gray-100 pt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Shipment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Items</h4>
                        <div className="space-y-4">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="w-14 h-14 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} • {item.category}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Delivery Address</h4>
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex items-start">
                            <MapPin className="text-urban-900 mt-1 flex-shrink-0" size={20} />
                            <div className="ml-4">
                                <p className="font-bold text-gray-900">{order.customer.name}</p>
                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{order.customer.address}</p>
                                <p className="text-xs text-gray-400 mt-2">{order.customer.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
