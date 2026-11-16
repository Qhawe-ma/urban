import React, { useState } from 'react';
import { ShoppingBag, Menu, X, Sparkles } from 'lucide-react';
import { View } from '../types';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onNavClick: (view: View) => void;
  currentView: View;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onCartClick, onNavClick, currentView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNav = (view: View) => {
    onNavClick(view);
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer group"
            onClick={() => handleNav(View.HOME)}
          >
            <div className="bg-urban-900 text-white p-1.5 rounded mr-2 group-hover:bg-urban-accent transition-colors">
              <Sparkles size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-urban-900">URBAN<span className="font-light">THREADS</span></span>
          </div>

          <div className="hidden md:flex space-x-8 items-center">
            <button 
              onClick={() => handleNav(View.HOME)}
              className={`${currentView === View.HOME ? 'text-urban-accent font-semibold' : 'text-gray-600 hover:text-urban-900'} transition-colors`}
            >
              Home
            </button>
            <button 
              onClick={() => handleNav(View.SHOP)}
              className={`${currentView === View.SHOP ? 'text-urban-accent font-semibold' : 'text-gray-600 hover:text-urban-900'} transition-colors`}
            >
              Shop
            </button>
            <button 
              onClick={() => handleNav(View.COLLECTIONS)}
              className={`${currentView === View.COLLECTIONS ? 'text-urban-accent font-semibold' : 'text-gray-600 hover:text-urban-900'} transition-colors`}
            >
              Collections
            </button>
            <button 
              onClick={() => handleNav(View.TRACK_ORDER)}
              className={`flex items-center ${currentView === View.TRACK_ORDER ? 'text-urban-accent font-semibold' : 'text-gray-600 hover:text-urban-900'} transition-colors`}
            >
              Track Order
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={onCartClick} 
              className="relative p-2 text-gray-600 hover:text-urban-accent transition-colors rounded-full hover:bg-gray-100"
            >
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-urban-accent rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            <button 
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button 
              onClick={() => handleNav(View.HOME)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-urban-accent hover:bg-gray-50 w-full text-left"
            >
              Home
            </button>
            <button 
              onClick={() => handleNav(View.SHOP)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-urban-accent hover:bg-gray-50 w-full text-left"
            >
              Shop All
            </button>
            <button 
              onClick={() => handleNav(View.COLLECTIONS)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-urban-accent hover:bg-gray-50 w-full text-left"
            >
              Collections
            </button>
            <button 
              onClick={() => handleNav(View.TRACK_ORDER)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-urban-accent hover:bg-gray-50 w-full text-left"
            >
              Track Order
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
