import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../utils/CartContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };
  
  return (
    <motion.div 
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group border border-gray-100"
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3 }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative h-48 overflow-hidden bg-gray-50">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/product-images/placeholder.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Quick Add Button */}
          <motion.button
            onClick={handleAddToCart}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-neon-accent hover:text-black"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </motion.button>
        </div>
      </Link>
      
      <div className="p-5">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 hover:text-neon-accent transition-colors duration-300 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-500 mb-3 font-medium">{product.brand}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900">PKR {product.price.toLocaleString()}</span>
            <span className="text-xs text-gray-500">Free delivery</span>
          </div>
          
          <motion.button
            onClick={handleAddToCart}
            className="bg-gradient-to-r from-gray-900 to-black text-white px-4 py-2 rounded-full text-sm font-medium hover:from-neon-accent hover:to-neon-accent hover:text-black transition-all duration-300 shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;