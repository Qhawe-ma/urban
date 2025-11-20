
import React, { useState } from 'react';
import { X, CreditCard, Truck, ShieldCheck, ShoppingBag, AlertCircle, Calendar, Lock, User, MapPin, Mail } from 'lucide-react';
import { CartItem, Order } from '../types';
import { createOrder } from '../services/productService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onSuccess: (orderId: string) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, cartItems, onSuccess }) => {
  const [step, setStep] = useState<'FORM' | 'PROCESSING' | 'SUCCESS'>('FORM');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 150; // Flat rate
  const total = subtotal + shipping;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('PROCESSING');
    setError(null);

    // Simulate payment processing delay
    setTimeout(async () => {
      const orderData: Omit<Order, 'id'> = {
        items: cartItems,
        total: total,
        date: new Date().toISOString(),
        status: 'Processing',
        customer: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          address: `${formData.address}, ${formData.city}, ${formData.zip}`
        }
      };

      try {
        const orderId = await createOrder(orderData, cartItems);
        onSuccess(orderId);
        setStep('SUCCESS'); 
        onClose();
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Checkout failed. Please try again.');
        setStep('FORM');
      }
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Credit Card Formatting
    if (name === 'cardNumber') {
        const raw = value.replace(/\D/g, '');
        const truncated = raw.slice(0, 16);
        formattedValue = truncated.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    
    // Expiry Formatting (MM/YY)
    else if (name === 'expiry') {
        const raw = value.replace(/\D/g, '');
        const truncated = raw.slice(0, 4);
        
        // Logic to handle slash insertion/deletion
        if (truncated.length > 2) {
             formattedValue = `${truncated.slice(0, 2)}/${truncated.slice(2)}`;
        } else if (truncated.length === 2) {
             // Only add slash if we are typing (length increasing), not deleting
             const isTyping = value.length > formData.expiry.length;
             if (isTyping) {
                 formattedValue = `${truncated}/`;
             } else {
                 formattedValue = truncated;
             }
        } else {
             formattedValue = truncated;
        }
    }

    // CVV Formatting
    else if (name === 'cvv') {
        const raw = value.replace(/\D/g, '');
        formattedValue = raw.slice(0, 4);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  // Common input class for consistency and visibility
  const inputClass = "w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-urban-900 focus:border-transparent outline-none transition-all shadow-sm";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-fade-in">
        {/* Left Side: Form */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-gray-900">Checkout</h2>
            <button onClick={onClose} className="md:hidden text-gray-400"><X size={24} /></button>
          </div>

          {step === 'PROCESSING' ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-12 h-12 border-4 border-urban-900 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 font-medium">Processing your payment...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-start">
                  <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Contact */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                    <Mail size={14} className="mr-2" /> Contact Information
                </h3>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Mail size={18} />
                    </div>
                    <input 
                      required
                      type="email" 
                      name="email"
                      placeholder="Email Address" 
                      value={formData.email}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                </div>
              </div>

              {/* Shipping */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                    <Truck size={14} className="mr-2" /> Shipping Address
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <User size={18} />
                        </div>
                        <input required type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} className={inputClass} />
                    </div>
                    <div className="relative">
                         {/* Use padding left without icon for consistency if needed, or add icon */}
                        <input required type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} className={`${inputClass} pl-4`} />
                    </div>
                    
                    <div className="relative col-span-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <MapPin size={18} />
                        </div>
                        <input required type="text" name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} className={inputClass} />
                    </div>
                    
                    <div className="relative">
                        <input required type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} className={`${inputClass} pl-4`} />
                    </div>
                    <div className="relative">
                        <input required type="text" name="zip" placeholder="ZIP Code" value={formData.zip} onChange={handleInputChange} className={`${inputClass} pl-4`} />
                    </div>
                </div>
              </div>

              {/* Payment */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                    <ShieldCheck size={14} className="mr-2" /> Payment Details
                </h3>
                <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 space-y-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="bg-urban-900 text-white p-1 rounded">
                        <CreditCard size={16} />
                    </div>
                    <span className="text-sm font-bold text-gray-900">Credit or Debit Card</span>
                  </div>
                  
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <CreditCard size={18} />
                      </div>
                      <input 
                        required
                        type="text" 
                        name="cardNumber"
                        inputMode="numeric"
                        placeholder="0000 0000 0000 0000" 
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        maxLength={19}
                        className={`${inputClass} font-mono`}
                      />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Calendar size={18} />
                        </div>
                        <input 
                            required 
                            type="text" 
                            name="expiry" 
                            inputMode="numeric"
                            placeholder="MM / YY" 
                            value={formData.expiry} 
                            onChange={handleInputChange} 
                            maxLength={5}
                            className={`${inputClass} font-mono`}
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Lock size={18} />
                        </div>
                        <input 
                            required 
                            type="password" 
                            name="cvv" 
                            inputMode="numeric"
                            placeholder="CVV" 
                            value={formData.cvv} 
                            onChange={handleInputChange} 
                            maxLength={4}
                            className={`${inputClass} font-mono`}
                        />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-urban-900 text-white py-4 rounded-lg font-bold text-lg hover:bg-urban-800 transition-all transform active:scale-[0.99] shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Pay R {total.toFixed(0)}
              </button>
              
              <div className="flex items-center justify-center text-xs text-gray-400 space-x-1">
                <ShieldCheck size={14} />
                <span>256-bit SSL Encrypted Payment</span>
              </div>
            </form>
          )}
        </div>

        {/* Right Side: Order Summary */}
        <div className="hidden md:block w-80 bg-gray-50 border-l border-gray-200 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-auto">
                <X size={24} />
            </button>
          </div>
          <h3 className="font-bold text-gray-900 mb-6 flex items-center">
            <ShoppingBag size={18} className="mr-2" /> Order Summary
          </h3>
          
          <div className="space-y-5 mb-8">
            {cartItems.map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="w-16 h-20 bg-white rounded-md border border-gray-200 overflow-hidden relative flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <span className="absolute top-0 right-0 bg-urban-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-md">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</h4>
                  <p className="text-xs text-gray-500 truncate">{item.category}</p>
                  {item.stock < 5 && item.stock > 0 && (
                     <p className="text-[10px] text-red-500 font-medium mt-0.5">Only {item.stock} left</p>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900">R {(item.price * item.quantity).toFixed(0)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>R {subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span>R {shipping.toFixed(0)}</span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-gray-900">Total</span>
              <span className="font-bold text-xl text-urban-900">R {total.toFixed(0)}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-right">Includes VAT</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
