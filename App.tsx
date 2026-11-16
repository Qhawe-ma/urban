
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import StylistChat from './components/StylistChat';
import AdminPanel from './components/AdminPanel';
import CheckoutModal from './components/CheckoutModal';
import OrderTracking from './components/OrderTracking';
import { DEFAULT_SITE_CONTENT } from './constants';
import { subscribeToProducts, seedProductsIfEmpty, subscribeToSiteContent } from './services/productService';
import { Product, CartItem, View, SiteContent } from './types';
import { Heart, Instagram, Twitter, Facebook, Filter, ArrowRight, Settings, CheckCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [products, setProducts] = useState<Product[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isNewsletterJoined, setIsNewsletterJoined] = useState(false);

  useEffect(() => {
    seedProductsIfEmpty();
    
    const unsubscribeProducts = subscribeToProducts((data) => {
      setProducts(data);
      setIsLoading(false);
    });

    const unsubscribeContent = subscribeToSiteContent((data) => {
      setSiteContent(data);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeContent();
    };
  }, []);

  // Keep the shopper's quantity, but take price, image, and stock from the live catalogue.
  // A missing stock field is treated as zero so checkout cannot proceed on it.
  const cartWithLiveStock = cart.map(cartItem => {
    const product = products.find(p => p.id === cartItem.id);
    return product ? { 
        ...cartItem, 
        stock: product.stock ?? 0, 
        price: product.price, 
        image: product.image 
    } : cartItem;
  });

  const cartCount = cartWithLiveStock.reduce((acc, item) => acc + item.quantity, 0);

  const addToCart = (product: Product) => {
    const currentStock = product.stock ?? 0;
    if (currentStock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= currentStock) {
          return prev;
        }
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, stock: currentStock }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === id);
        const maxStock = product ? (product.stock ?? 0) : item.stock;
        const newQty = item.quantity + delta;

        if (delta > 0 && newQty > maxStock) {
          return item;
        }
        
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  const handleCheckoutSuccess = (orderId: string) => {
    setCart([]);
    setLastOrderId(orderId);
    setIsCartOpen(false); 
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;

    // Nothing is stored or sent. The message only confirms the click locally.
    setIsNewsletterJoined(true);
    setNewsletterEmail('');

    setTimeout(() => {
        setIsNewsletterJoined(false);
    }, 5000);
  };

  const handleFooterLinkClick = (category: string) => {
      setSelectedCategory(category);
      setCurrentView(View.SHOP);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (view: View) => {
    setCurrentView(view);
    // A manual visit should not reuse the order id from the confirmation screen.
    if (view === View.TRACK_ORDER) {
      setTrackingOrderId(null);
    }
  };

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const { hero, collections } = siteContent;

  if (lastOrderId) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-fade-in">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                      <CheckCircle size={40} />
                  </div>
                  <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                  <p className="text-gray-500 mb-6">Thank you for shopping with UrbanThreads. Your style upgrade is on the way.</p>
                  
                  <div className="bg-gray-50 border border-dashed border-gray-300 p-4 rounded-lg mb-8">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Order Number</p>
                      <p className="text-2xl font-mono font-bold text-urban-900 select-all">{lastOrderId}</p>
                  </div>

                  <div className="space-y-3">
                      <button 
                          onClick={() => {
                              setTrackingOrderId(lastOrderId);
                              setLastOrderId(null);
                              setCurrentView(View.TRACK_ORDER);
                          }}
                          className="w-full bg-urban-900 text-white py-3 rounded-lg font-bold hover:bg-urban-800 transition-colors"
                      >
                          Track My Order
                      </button>
                      <button 
                          onClick={() => {
                              setLastOrderId(null);
                              setCurrentView(View.HOME);
                          }}
                          className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                      >
                          Continue Shopping
                      </button>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      <Navbar 
        cartCount={cartCount} 
        onCartClick={() => setIsCartOpen(true)}
        onNavClick={handleNavClick}
        currentView={currentView}
      />

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        items={cartWithLiveStock}
        onRemove={removeFromCart}
        onUpdateQty={updateQuantity}
        onCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
        }}
      />
      
      <div className="relative z-[100]">
         <CheckoutModal 
            isOpen={isCheckoutOpen} 
            onClose={() => setIsCheckoutOpen(false)}
            cartItems={cartWithLiveStock}
            onSuccess={handleCheckoutSuccess}
         />
      </div>

      <main className="flex-grow">
        {currentView === View.ADMIN ? (
          <AdminPanel products={products} siteContent={siteContent} />
        ) : currentView === View.TRACK_ORDER ? (
          <OrderTracking initialOrderId={trackingOrderId} />
        ) : (
          <>
            {currentView === View.HOME && (
              <>
                <Hero content={hero} onShopNow={() => setCurrentView(View.SHOP)} />
                
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                     <div className="max-w-xl">
                        <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-4">Curated by Us, Styled by You</h2>
                        <p className="text-gray-500 text-lg font-light">We source pieces that tell a story. Find the collection that speaks to yours.</p>
                     </div>
                     <button 
                      onClick={() => setCurrentView(View.COLLECTIONS)}
                      className="hidden md:flex items-center text-sm font-semibold uppercase tracking-widest border-b border-black pb-1 hover:opacity-70 transition-opacity"
                     >
                       View All Collections
                     </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px] md:auto-rows-[400px]">
                    <div 
                      className="group relative overflow-hidden rounded-sm cursor-pointer md:col-span-2 md:row-span-2 bg-gray-100"
                      onClick={() => setCurrentView(View.SHOP)}
                    >
                      <img src={collections[0]?.image} alt={collections[0]?.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                      <div className="absolute bottom-0 left-0 p-8">
                        <h3 className="text-white text-3xl md:text-4xl font-serif font-medium mb-2">{collections[0]?.name}</h3>
                        <p className="text-white/90 text-sm uppercase tracking-wider font-semibold">Shop Now <ArrowRight className="inline ml-1 w-4 h-4" /></p>
                      </div>
                    </div>

                    <div 
                      className="group relative overflow-hidden rounded-sm cursor-pointer bg-gray-100"
                      onClick={() => setCurrentView(View.SHOP)}
                    >
                       <img src={collections[1]?.image} alt={collections[1]?.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                       <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                       <div className="absolute bottom-0 left-0 p-6">
                        <h3 className="text-white text-2xl font-serif font-medium mb-2">{collections[1]?.name}</h3>
                      </div>
                    </div>

                     <div 
                      className="group relative overflow-hidden rounded-sm cursor-pointer bg-gray-100"
                      onClick={() => setCurrentView(View.SHOP)}
                    >
                       <img src={collections[2]?.image} alt={collections[2]?.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                       <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                       <div className="absolute bottom-0 left-0 p-6">
                        <h3 className="text-white text-2xl font-serif font-medium mb-2">{collections[2]?.name}</h3>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 md:hidden">
                     <button 
                      onClick={() => setCurrentView(View.COLLECTIONS)}
                      className="w-full flex items-center justify-center py-3 border border-gray-900 text-sm font-semibold uppercase tracking-widest hover:bg-gray-50"
                     >
                       View All Collections
                     </button>
                  </div>
                </section>

                <section className="bg-stone-50 py-24">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-3xl font-serif font-medium text-gray-900 mb-4">Fresh Arrivals</h2>
                        <p className="text-gray-500 font-light">Our latest pieces, designed for comfort and styled for impact.</p>
                    </div>
                    
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-urban-900 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {products.slice(0, 4).map(product => (
                          <ProductCard key={product.id} product={product} onAdd={addToCart} />
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-16 text-center">
                       <button 
                        onClick={() => setCurrentView(View.SHOP)}
                        className="inline-flex items-center px-8 py-3 bg-white border border-gray-200 shadow-sm text-sm font-medium rounded-sm text-gray-900 hover:bg-gray-50 transition-colors"
                       >
                          View All Products
                       </button>
                    </div>
                  </div>
                </section>
              </>
            )}

            {(currentView === View.SHOP || currentView === View.COLLECTIONS) && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
                   <div>
                      <h1 className="text-4xl font-serif font-medium text-gray-900">The Collection</h1>
                      <p className="text-gray-500 mt-2 font-light">Discover styles for every identity.</p>
                   </div>
                   
                   <div className="mt-6 md:mt-0 flex flex-wrap gap-2">
                     {categories.map(cat => (
                       <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-6 py-2 rounded-full text-sm transition-all duration-200 border ${
                          selectedCategory === cat 
                          ? 'bg-urban-900 text-white border-urban-900' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                        }`}
                       >
                         {cat}
                       </button>
                     ))}
                   </div>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-32">
                    <div className="w-10 h-10 border-2 border-urban-900 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                    {filteredProducts.map(product => (
                      <ProductCard key={product.id} product={product} onAdd={addToCart} />
                    ))}
                  </div>
                )}
                
                {!isLoading && filteredProducts.length === 0 && (
                    <div className="text-center py-32 bg-gray-50 rounded-lg mt-8">
                        <div className="inline-block p-4 rounded-full bg-white mb-4 shadow-sm">
                            <Filter className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your filters to see more styles.</p>
                        <button onClick={() => setSelectedCategory('All')} className="mt-6 text-urban-900 font-semibold hover:underline">
                            Clear Filters
                        </button>
                    </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 text-gray-900 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-2xl font-serif font-bold mb-6 tracking-wide">URBAN<span className="font-light">THREADS</span></h3>
              <p className="text-gray-500 text-sm leading-relaxed font-light">
                Born in the city, made for the world. We provide high-quality, inclusive fashion staples that empower you to express your unique identity.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-400">Shop</h4>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li><button onClick={() => handleFooterLinkClick('All')} className="hover:text-urban-900 cursor-pointer transition-colors text-left">New Arrivals</button></li>
                <li><button onClick={() => handleFooterLinkClick('Men')} className="hover:text-urban-900 cursor-pointer transition-colors text-left">Men</button></li>
                <li><button onClick={() => handleFooterLinkClick('Women')} className="hover:text-urban-900 cursor-pointer transition-colors text-left">Women</button></li>
                <li><button onClick={() => handleFooterLinkClick('Unisex')} className="hover:text-urban-900 cursor-pointer transition-colors text-left">Unisex</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-400">Customer Care</h4>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-urban-900 cursor-pointer transition-colors block">Shipping (RSA)</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-urban-900 cursor-pointer transition-colors block">Returns & Exchanges</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-urban-900 cursor-pointer transition-colors block">Size Guide</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-urban-900 cursor-pointer transition-colors block">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-400">Join the Community</h4>
              <div className="flex space-x-6 mb-6">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-urban-900 transition-colors"><Instagram size={20} /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-urban-900 transition-colors"><Twitter size={20} /></a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-urban-900 transition-colors"><Facebook size={20} /></a>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="relative">
                 <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full bg-gray-50 border-b border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-urban-900 transition-colors disabled:opacity-50"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    disabled={isNewsletterJoined}
                    required
                 />
                 <button 
                    type="submit"
                    className={`absolute right-2 top-2 text-xs font-bold transition-colors ${isNewsletterJoined ? 'text-green-600' : 'text-gray-400 hover:text-urban-900'}`}
                    disabled={isNewsletterJoined}
                 >
                    {isNewsletterJoined ? 'JOINED' : 'JOIN'}
                 </button>
                 {isNewsletterJoined && (
                     <div className="absolute top-full left-0 mt-2 flex items-center text-green-600 text-xs animate-fade-in">
                        <CheckCircle size={12} className="mr-1" /> Thanks for subscribing!
                     </div>
                 )}
              </form>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 flex-wrap">
              <p className="text-gray-400 text-xs">© 2023 UrbanThreads South Africa. All rights reserved.</p>
              <button 
                onClick={() => setCurrentView(View.ADMIN)} 
                className="flex items-center text-gray-300 hover:text-gray-500 transition-colors text-xs"
                title="Admin Panel"
              >
                <Settings size={12} className="mr-1" /> Admin
              </button>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex items-center space-x-1 text-gray-400 text-xs">
                <span>Designed with</span>
                <Heart size={12} className="text-red-500 fill-current" />
                <span>in Durban.</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <StylistChat />
    </div>
  );
};

export default App;
