import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import Breadcrumb from '../components/Breadcrumb';
import { useCart } from '../utils/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // Load product data?
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        
        const allProducts = await import('../data/products.json')
          .then(module => module.default);
        
        const foundProduct = allProducts.find(p => p.id === id);
        
        if (foundProduct) {
          setProduct(foundProduct);
          
          // Use placeholder for all images in carousel since we don't have multiple images
          foundProduct.images = [
            '/product-images/placeholder.svg',
            '/product-images/placeholder.svg',
            '/product-images/placeholder.svg'
          ];
          
          // Find related products (same category)
          const related = allProducts
            .filter(p => p.category === foundProduct.category && p.id !== id)
            .slice(0, 4);
          
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id]);
  
  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };
  
  // Add to cart with selected quantity
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };
  
  // Next image in carousel
  const nextImage = () => {
    if (product) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };
  
  // Previous image in carousel
  const prevImage = () => {
    if (product) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-accent"></div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="mb-6">Sorry, the product you're looking for doesn't exist.</p>
        <Link 
          to="/products" 
          className="bg-black text-white px-6 py-2 rounded-full hover:bg-neon-accent hover:text-black transition-colors duration-300"
        >
          Back to Products
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="container mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Home', path: '/' },
            { label: 'Products', path: '/products' },
            { label: product.category, path: `/products?category=${product.category}` },
            { label: product.name }
          ]}
        />
        
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl mb-12">
          <div className="md:flex">
            {/* Product Images Carousel */}
            <div className="md:w-1/2 p-8">
              <div className="relative h-80 md:h-96 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                {product.images.map((image, index) => (
                  <motion.div
                    key={index}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: currentImageIndex === index ? 1 : 0,
                      transition: { duration: 0.5 }
                    }}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/product-images/placeholder.svg';
                      }}
                    />
                  </motion.div>
                ))}
                
                {/* Navigation Arrows */}
                <button 
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white text-gray-800 w-12 h-12 rounded-full flex items-center justify-center hover:bg-neon-accent hover:text-black transition-all duration-300 shadow-lg hover:scale-110"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button 
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white text-gray-800 w-12 h-12 rounded-full flex items-center justify-center hover:bg-neon-accent hover:text-black transition-all duration-300 shadow-lg hover:scale-110"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {/* Thumbnail Navigation */}
              <div className="flex justify-center mt-6 space-x-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 ${currentImageIndex === index ? 'border-neon-accent shadow-md' : 'border-gray-200'}`}
                  >
                    <img 
                      src={image} 
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/product-images/placeholder.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Product Info */}
            <div className="md:w-1/2 p-8 bg-gray-50 border-l border-gray-100">
              <h1 className="text-3xl font-bold text-gray-800 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">{product.name}</h1>
              
              <div className="flex items-center mb-4">
                <span className="text-gray-600 mr-2 font-medium">Brand:</span>
                <Link 
                  to={`/products?brand=${product.brand}`}
                  className="text-neon-accent hover:underline font-semibold transition-colors duration-300 hover:text-neon-accent-dark"
                >
                  {product.brand}
                </Link>
              </div>
              
              <div className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-neon-accent to-neon-accent-dark">
                ₹ {product.price}
              </div>
              
              <div className="mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
              
              <div className="mb-8">
                <label htmlFor="quantity" className="block text-gray-700 font-medium mb-3">Quantity</label>
                <div className="flex items-center">
                  <button 
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-l-lg hover:bg-neon-accent hover:text-black font-bold text-xl transition-all duration-300 shadow-sm"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    id="quantity" 
                    value={quantity} 
                    onChange={handleQuantityChange}
                    min="1"
                    className="w-20 text-center border-t border-b border-gray-300 py-2 text-lg font-medium"
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-r-lg hover:bg-neon-accent hover:text-black font-bold text-xl transition-all duration-300 shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <motion.button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-neon-accent to-neon-accent-dark text-black py-4 rounded-lg text-lg font-bold hover:shadow-lg hover:scale-105 transform transition-all duration-300 mb-6 flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                Add to Cart
              </motion.button>
              
              <div className="mt-8 border-t border-gray-200 pt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">Product Details</h3>
                <div className="flex items-center mb-3">
                  <span className="text-gray-700 mr-2 font-medium w-24">Category:</span>
                  <Link 
                    to={`/products?category=${product.category}`}
                    className="text-neon-accent hover:underline font-semibold transition-colors duration-300 hover:text-neon-accent-dark"
                  >
                    {product.category}
                  </Link>
                </div>
                
                <div className="flex items-center">
                  <span className="text-gray-700 mr-2 font-medium w-24">Product ID:</span>
                  <span className="text-gray-800 font-medium">{product.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">You May Also Like</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {relatedProducts.map(relatedProduct => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="transform transition-all duration-300 hover:scale-105"
                >
                  <ProductCard product={relatedProduct} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;