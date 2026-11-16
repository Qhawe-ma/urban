import React from 'react';
import { ShoppingBag, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  // Missing stock is zero, which disables add-to-cart.
  const stockCount = product.stock ?? 0;
  const isOutOfStock = stockCount <= 0;

  return (
    <div className="group relative flex flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className={`h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
          loading="lazy"
        />
        
        {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
                <span className="bg-white/90 backdrop-blur-sm px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-900 shadow-sm border border-gray-200">
                    Sold Out
                </span>
            </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0 z-20">
           {isOutOfStock ? (
             <button 
              disabled
              className="w-full bg-gray-100/95 backdrop-blur-sm text-gray-400 py-3 px-4 shadow-sm text-sm font-medium tracking-wide cursor-not-allowed uppercase flex items-center justify-center border border-gray-200"
             >
               <AlertCircle size={16} className="mr-2" /> Out of Stock
             </button>
           ) : (
             <button 
              onClick={(e) => {
                  e.stopPropagation();
                  onAdd(product);
              }}
              className="w-full bg-white/95 backdrop-blur-sm text-urban-900 py-3 px-4 shadow-lg text-sm font-medium tracking-wide hover:bg-urban-900 hover:text-white transition-colors uppercase flex items-center justify-center"
             >
               <ShoppingBag size={16} className="mr-2" /> Add to Cart
             </button>
           )}
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-start space-x-4">
        <div>
          <h3 className="text-base font-medium text-gray-900">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500">{product.category}</p>
        </div>
        <div className="text-right">
            <p className="text-base font-semibold text-urban-900 whitespace-nowrap">
            R {product.price.toFixed(0)}
            </p>
            {!isOutOfStock && stockCount <= 5 && (
                <p className="text-xs text-red-500 mt-1 font-medium">Only {stockCount} left</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
