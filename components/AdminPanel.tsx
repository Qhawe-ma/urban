import React, { useState, useEffect, useRef } from 'react';
import { Product, SiteContent, HeroContent, Order, OrderStatus } from '../types';
import { addProduct, updateProduct, deleteProduct, updateSiteContent, subscribeToOrders, updateOrderStatus } from '../services/productService';
import {
  Trash2, Edit, Plus, Save, X, Lock,
  LayoutTemplate, Package, Upload, Image as ImageIcon,
  AlertCircle, CheckCircle, LogOut, BarChart3, Search, Truck, Clock, User, ChevronDown,
  type LucideIcon,
} from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  siteContent: SiteContent;
}

type Tab = 'DASHBOARD' | 'PRODUCTS' | 'ORDERS' | 'CONTENT';

const AdminPanel: React.FC<AdminPanelProps> = ({ products, siteContent }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  
  const initialProductState: Omit<Product, 'id'> = {
    name: '',
    price: 0,
    category: 'Unisex',
    image: '',
    description: '',
    stock: 20
  };
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>(initialProductState);
  const [editableContent, setEditableContent] = useState<SiteContent>(siteContent);
  const [contentSaved, setContentSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);

  // The form is a copy. Refresh it when the live document changes.
  useEffect(() => {
    setEditableContent(siteContent);
  }, [siteContent]);

  useEffect(() => {
    if (isAuthenticated) {
      const unsubscribe = subscribeToOrders((data) => {
        setOrders(data);
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin1234') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          callback(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await updateProduct(id, updates);
      setEditingProduct(null);
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error("Delete failed", error);
        alert("Failed to delete product");
      }
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newProduct.name || !newProduct.price) {
        alert("Name and Price are required");
        return;
      }
      await addProduct(newProduct);
      setIsAdding(false);
      setNewProduct(initialProductState);
    } catch (error) {
      console.error("Add failed", error);
      alert("Failed to add product");
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus as OrderStatus);
    } catch (error) {
      console.error("Status update failed", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Out for Delivery': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSaveContent = async () => {
    try {
      await updateSiteContent(editableContent);
      setContentSaved(true);
      setTimeout(() => setContentSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save content", error);
      alert("Failed to save changes");
    }
  };

  const updateHero = (field: keyof HeroContent, value: string) => {
    setEditableContent(prev => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }));
  };

  const updateCollection = (index: number, field: 'name' | 'image', value: string) => {
    const newCollections = [...editableContent.collections];
    newCollections[index] = { ...newCollections[index], [field]: value };
    setEditableContent(prev => ({ ...prev, collections: newCollections }));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = products.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0);
  const lowStockItems = products.filter(p => (p.stock || 0) < 10).length;
  const pendingOrders = orders.filter(o => o.status === 'Processing').length;


  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="bg-white p-10 rounded-xl shadow-xl border border-gray-100 max-w-md w-full text-center">
          <div className="bg-urban-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Lock className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Admin Access</h2>
          <p className="text-gray-500 mb-8">Secure area for authorized personnel only.</p>
          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-urban-900 focus:border-transparent transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-urban-900 text-white py-3.5 rounded-lg font-semibold hover:bg-urban-800 hover:shadow-md transition-all transform active:scale-[0.98]"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const NavButton = ({ tab, icon: Icon, label }: { tab: Tab, icon: LucideIcon, label: string }) => (
    <button 
      onClick={() => setActiveTab(tab)}
      className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-urban-accent text-white font-medium shadow-md' : 'text-gray-600 md:text-gray-400 hover:text-urban-900 md:hover:text-white md:hover:bg-white/5'}`}
    >
      <Icon size={20} className="mr-3" /> {label}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      <aside className="w-64 bg-urban-900 text-white hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold tracking-wide">URBAN<span className="font-light text-gray-300">ADMIN</span></h2>
        </div>
        
        <nav className="flex-1 py-6 space-y-1 px-3">
          <NavButton tab="DASHBOARD" icon={BarChart3} label="Dashboard" />
          <NavButton tab="PRODUCTS" icon={Package} label="Inventory" />
          <NavButton tab="ORDERS" icon={Truck} label="Orders" />
          <NavButton tab="CONTENT" icon={LayoutTemplate} label="Site Content" />
        </nav>

        <div className="p-6 border-t border-gray-800">
          <button onClick={() => setIsAuthenticated(false)} className="flex items-center text-gray-400 hover:text-white transition-colors">
            <LogOut size={18} className="mr-2" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden">
        
        <header className="mb-8">
           <div className="flex justify-between items-center mb-6 md:mb-0">
            <div>
                <h1 className="text-2xl font-serif font-bold text-gray-900">
                {activeTab === 'DASHBOARD' && 'Overview'}
                {activeTab === 'PRODUCTS' && 'Product Management'}
                {activeTab === 'ORDERS' && 'Order Management'}
                {activeTab === 'CONTENT' && 'Content Editor'}
                </h1>
                <p className="text-gray-500 text-sm mt-1 hidden md:block">Welcome back, Admin.</p>
            </div>
            <div className="md:hidden">
                <button className="p-2 bg-white rounded-md shadow-sm border border-gray-200 text-gray-600" onClick={() => setIsAuthenticated(false)}>
                    <LogOut size={20} />
                </button>
            </div>
           </div>

           <div className="md:hidden flex overflow-x-auto pb-2 space-x-2 no-scrollbar">
               <button 
                 onClick={() => setActiveTab('DASHBOARD')} 
                 className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'DASHBOARD' ? 'bg-urban-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
               >
                 Dashboard
               </button>
               <button 
                 onClick={() => setActiveTab('PRODUCTS')} 
                 className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'PRODUCTS' ? 'bg-urban-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
               >
                 Inventory
               </button>
               <button 
                 onClick={() => setActiveTab('ORDERS')} 
                 className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'ORDERS' ? 'bg-urban-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
               >
                 Orders
               </button>
               <button 
                 onClick={() => setActiveTab('CONTENT')} 
                 className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'CONTENT' ? 'bg-urban-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
               >
                 Content
               </button>
           </div>
        </header>

        {activeTab === 'DASHBOARD' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Products</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{products.length}</h3>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                    <Package size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Inventory Value</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">R {totalValue.toLocaleString()}</h3>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-green-600">
                    <BarChart3 size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Orders</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{pendingOrders}</h3>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-yellow-600">
                    <Clock size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Low Stock Alerts</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{lowStockItems}</h3>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg text-red-600">
                    <AlertCircle size={24} />
                  </div>
                </div>
                {lowStockItems > 0 && (
                   <p className="text-xs text-red-500 mt-2 font-medium">Items needing restock</p>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-800">Quick Actions</h3>
                </div>
                <div className="p-6 flex flex-wrap gap-4">
                    <button onClick={() => setActiveTab('PRODUCTS')} className="px-4 py-2 bg-urban-900 text-white rounded-lg text-sm font-medium hover:bg-urban-800 transition-colors">
                        Manage Inventory
                    </button>
                     <button onClick={() => setActiveTab('ORDERS')} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        View Orders
                    </button>
                     <button onClick={() => setActiveTab('CONTENT')} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        Edit Homepage
                    </button>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'ORDERS' && (
          <div className="space-y-6 animate-fade-in">
            {orders.length === 0 ? (
              <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                 <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                   <Truck size={40} className="text-gray-400" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900">No orders yet</h3>
                 <p className="text-gray-500 mt-2">When customers checkout, their orders will appear here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-urban-900">
                            {order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.date).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mt-0.5">
                                <User size={16} className="text-gray-400" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{order.customer.name}</p>
                                <p className="text-xs text-gray-500">{order.customer.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            R {order.total.toFixed(0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative inline-block text-left">
                              <select 
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className={`appearance-none cursor-pointer pl-3 pr-8 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-urban-900 transition-all ${getStatusColor(order.status)}`}
                              >
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none opacity-50" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'PRODUCTS' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8 animate-fade-in">
              <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative max-w-md w-full">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                   <input 
                      type="text" 
                      placeholder="Search products..." 
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-urban-900 focus:border-transparent text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="flex items-center justify-center px-4 py-2 bg-urban-900 text-white rounded-lg hover:bg-urban-800 transition-colors text-sm font-medium shadow-sm"
                >
                  <Plus size={18} className="mr-2" /> Add Product
                </button>
              </div>

              {isAdding && (
                <div className="border-b border-gray-100 bg-gray-50/50 p-6 animate-slide-down">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-gray-800">Add New Product</h3>
                    <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={20} />
                    </button>
                  </div>
                  <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div className="md:col-span-2 flex items-center space-x-4 bg-white p-4 rounded-lg border border-gray-200 border-dashed">
                        <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative flex-shrink-0">
                            {newProduct.image ? (
                                <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                            <div className="flex gap-2">
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={(e) => handleImageUpload(e, (base64) => setNewProduct({...newProduct, image: base64}))}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                                >
                                    <Upload size={14} className="mr-2" /> Upload File
                                </button>
                                <input 
                                    type="text"
                                    placeholder="Or paste image URL"
                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-xs"
                                    value={newProduct.image.startsWith('data:') ? '' : newProduct.image}
                                    onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Supported: JPG, PNG, WebP</p>
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                        <input className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (R)</label>
                            <input type="number" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} required />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock</label>
                            <input type="number" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} required />
                         </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                        <select className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                            <option value="Men">Men</option>
                            <option value="Women">Women</option>
                            <option value="Unisex">Unisex</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Footwear">Footwear</option>
                        </select>
                     </div>
                     <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                        <textarea className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" rows={2} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                     </div>
                     <div className="md:col-span-2 flex justify-end">
                        <button type="submit" className="px-6 py-2 bg-urban-900 text-white rounded-lg font-medium hover:bg-urban-800">Save Product</button>
                     </div>
                  </form>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredProducts.map((product) => {
                       const isEditing = editingProduct?.id === product.id;
                       return (
                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                                <div className="flex flex-col gap-2">
                                    <input 
                                      className="w-full p-2 border border-gray-300 rounded text-sm" 
                                      value={editingProduct.name} 
                                      onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                                    />
                                    <div className="flex gap-2 items-center">
                                        <input 
                                            type="file" 
                                            id={`edit-file-${product.id}`}
                                            className="hidden"
                                            onChange={(e) => handleImageUpload(e, (base64) => setEditingProduct({...editingProduct, image: base64}))}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => document.getElementById(`edit-file-${product.id}`)?.click()}
                                            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border border-gray-300"
                                        >
                                            Upload
                                        </button>
                                        <input 
                                          className="w-full p-1 border border-gray-300 rounded text-xs" 
                                          value={editingProduct.image.substring(0, 30) + '...'} 
                                          placeholder="Image URL"
                                          readOnly
                                        />
                                    </div>
                                </div>
                            ) : (
                              <div className="flex items-center">
                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100">
                                  <img className="h-full w-full object-cover" src={product.image} alt="" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                                  <div className="text-xs text-gray-400 truncate max-w-[150px]">{product.description}</div>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                             {isEditing ? (
                               <select 
                                 className="p-1 border border-gray-300 rounded text-sm"
                                 value={editingProduct.category}
                                 onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                               >
                                  <option value="Men">Men</option>
                                  <option value="Women">Women</option>
                                  <option value="Unisex">Unisex</option>
                                  <option value="Accessories">Accessories</option>
                                  <option value="Footwear">Footwear</option>
                               </select>
                             ) : (
                                <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-100 text-gray-600">
                                    {product.category}
                                </span>
                             )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                             {isEditing ? (
                                <input 
                                  type="number" 
                                  className="w-20 p-1 border border-gray-300 rounded text-sm" 
                                  value={editingProduct.stock} 
                                  onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                                />
                             ) : (
                                <div className="flex items-center">
                                    <div className={`h-2 w-2 rounded-full mr-2 ${(product.stock || 0) < 5 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                    <span className={`text-sm font-medium ${(product.stock || 0) < 5 ? 'text-red-600' : 'text-gray-700'}`}>
                                        {product.stock || 0} in stock
                                    </span>
                                </div>
                             )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                             {isEditing ? (
                                <input 
                                  type="number" 
                                  className="w-24 p-1 border border-gray-300 rounded text-sm" 
                                  value={editingProduct.price} 
                                  onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                                />
                             ) : (
                                `R ${product.price}`
                             )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {isEditing ? (
                              <div className="flex justify-end space-x-2">
                                <button onClick={() => handleUpdateProduct(product.id, editingProduct)} className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded"><Save size={16} /></button>
                                <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-1.5 rounded"><X size={16} /></button>
                              </div>
                            ) : (
                              <div className="flex justify-end space-x-3">
                                <button onClick={() => setEditingProduct(product)} className="text-urban-900 hover:text-urban-accent"><Edit size={18} /></button>
                                <button onClick={() => handleDeleteProduct(product.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'CONTENT' && (
           <div className="space-y-6 max-w-4xl animate-fade-in">
              <div className="flex justify-between items-center">
                  <div>
                      <h2 className="text-xl font-bold text-gray-900">Home Page Customization</h2>
                      <p className="text-sm text-gray-500">Update the main banner and collection highlights.</p>
                  </div>
                  <button 
                    onClick={handleSaveContent}
                    className={`flex items-center px-6 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all ${contentSaved ? 'bg-green-600' : 'bg-urban-900 hover:bg-urban-800'}`}
                  >
                    {contentSaved ? <><CheckCircle size={18} className="mr-2" /> Saved!</> : 'Save Changes'}
                  </button>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center"><LayoutTemplate size={20} className="mr-2 text-urban-900" /> Hero Section</h3>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Headline Line 1</label>
                            <input 
                                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-urban-900" 
                                value={editableContent.hero.headlinePart1} 
                                onChange={e => updateHero('headlinePart1', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Headline Line 2</label>
                            <input 
                                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-urban-900" 
                                value={editableContent.hero.headlinePart2} 
                                onChange={e => updateHero('headlinePart2', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Subtext</label>
                            <textarea 
                                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-urban-900" 
                                rows={3}
                                value={editableContent.hero.subheadline} 
                                onChange={e => updateHero('subheadline', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Button Label</label>
                            <input 
                                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-urban-900" 
                                value={editableContent.hero.buttonText} 
                                onChange={e => updateHero('buttonText', e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Hero Image</label>
                        <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-200 group hover:border-urban-900 transition-colors">
                            <img src={editableContent.hero.image} alt="Hero Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                <input 
                                    type="file" 
                                    ref={heroFileRef}
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(e, (base64) => updateHero('image', base64))}
                                />
                                <button 
                                    onClick={() => heroFileRef.current?.click()}
                                    className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium text-sm flex items-center mb-2"
                                >
                                    <Upload size={16} className="mr-2" /> Change Image
                                </button>
                                <p className="text-white text-xs">or paste URL below</p>
                            </div>
                        </div>
                        <input 
                            className="w-full p-2 mt-3 border border-gray-200 rounded-lg text-xs text-gray-500" 
                            value={editableContent.hero.image.substring(0, 50) + (editableContent.hero.image.length > 50 ? '...' : '')}
                            onChange={e => updateHero('image', e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center"><LayoutTemplate size={20} className="mr-2 text-urban-900" /> Collections</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {editableContent.collections.map((col, idx) => (
                        <div key={col.id} className="border border-gray-100 p-4 rounded-lg hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-sm text-gray-700 mb-3">Collection {idx + 1}</h4>
                            <div className="aspect-square bg-gray-100 rounded-md overflow-hidden mb-3 relative group">
                                <img src={col.image} alt="Col Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <input 
                                        type="file" 
                                        id={`col-file-${idx}`}
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e, (base64) => updateCollection(idx, 'image', base64))}
                                    />
                                    <button 
                                        onClick={() => document.getElementById(`col-file-${idx}`)?.click()}
                                        className="bg-white/90 p-2 rounded-full"
                                    >
                                        <Upload size={16} className="text-gray-900" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <input 
                                    className="w-full p-2 border border-gray-200 rounded text-sm" 
                                    value={col.name} 
                                    onChange={e => updateCollection(idx, 'name', e.target.value)}
                                    placeholder="Collection Name"
                                />
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
