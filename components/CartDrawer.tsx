import React from 'react';
import { X, Trash2, ArrowRight, Minus, Plus, ShoppingBag, AlertCircle } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onCheckout?: () => void; 
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemove, onUpdateQty, onCheckout }) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasStockIssues = items.some(item => item.quantity > (item.stock ?? 0));

  return (
    <div className={`fixed inset-0 z-[60] overflow-hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
      />

      <div className={`fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          
          <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between bg-white">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Your Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <ShoppingBag size={32} />
                </div>
                <p className="text-lg font-medium text-gray-900">Your bag is empty</p>
                <p className="text-sm text-gray-500 mt-1">Looks like you haven't found your style yet.</p>
                <button onClick={onClose} className="mt-6 px-6 py-2 bg-urban-900 text-white rounded-sm font-medium hover:bg-urban-800 transition-colors">
                    Start Shopping
                </button>
              </div>
            ) : (
              <ul className="space-y-6">
                {items.map((item) => {
                  const stock = item.stock ?? 0;
                  const isOOS = stock === 0;
                  const isLowStock = item.quantity > stock;
                  
                  return (
                    <li key={item.id} className={`flex py-2 bg-white p-4 rounded-lg shadow-sm border ${isLowStock ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-100'}`}>
                      <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                        <img src={item.image} alt={item.name} className={`h-full w-full object-cover object-center ${isOOS ? 'grayscale opacity-70' : ''}`} />
                        {isOOS && (
                           <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                               <span className="text-[10px] font-bold bg-white px-1 py-0.5 rounded shadow-sm">SOLD OUT</span>
                           </div>
                        )}
                      </div>

                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3 className="line-clamp-1 mr-2">{item.name}</h3>
                            <p className="whitespace-nowrap">R {(item.price * item.quantity).toFixed(0)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                          
                          {isLowStock && (
                             <div className="flex items-center mt-2 text-xs font-medium text-red-600 bg-red-50 p-1.5 rounded">
                                <AlertCircle size={12} className="mr-1.5" />
                                {stock === 0 ? "Item is sold out" : `Only ${stock} available`}
                             </div>
                          )}
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm mt-2">
                          <div className="flex items-center border border-gray-200 rounded-md bg-gray-50">
                             <button 
                              onClick={() => onUpdateQty(item.id, -1)}
                              className="p-1.5 text-gray-600 hover:text-urban-900 hover:bg-gray-200 rounded-l-md transition-colors"
                              disabled={item.quantity <= 1}
                             >
                                 <Minus size={14} />
                             </button>
                             <span className="px-3 py-1 text-gray-900 font-medium min-w-[2rem] text-center">{item.quantity}</span>
                             <button 
                              onClick={() => onUpdateQty(item.id, 1)}
                              className="p-1.5 text-gray-600 hover:text-urban-900 hover:bg-gray-200 rounded-r-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              disabled={item.quantity >= stock}
                             >
                                 <Plus size={14} />
                             </button>
                          </div>

                          <button type="button" onClick={() => onRemove(item.id)} className="font-medium text-gray-400 hover:text-red-600 transition-colors flex items-center p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="bg-white border-t border-gray-100 px-6 py-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
                <p>Subtotal</p>
                <p>R {subtotal.toFixed(0)}</p>
              </div>
              <p className="mt-0.5 text-sm text-gray-500 mb-6">Shipping and taxes calculated at checkout.</p>
              
              {hasStockIssues && (
                  <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-md flex items-start">
                      <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                      <span>Some items in your cart are no longer available in the requested quantity. Please adjust to proceed.</span>
                  </div>
              )}

              <button 
                  disabled={hasStockIssues}
                  className={`w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-sm shadow-sm text-base font-bold text-white transition-all transform active:scale-[0.99] ${
                      hasStockIssues 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-urban-900 hover:bg-urban-800'
                  }`}
                  onClick={onCheckout}
                >
                  {hasStockIssues ? 'Update Cart to Checkout' : 'Checkout'}
                  {!hasStockIssues && <ArrowRight className="ml-2" size={20} />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
