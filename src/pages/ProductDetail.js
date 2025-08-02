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
  
  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        
        const allProducts = await import('../data/products.json')
          .then(module => module.default);
        
        const foundProduct = allProducts.find(p => p.id === id);
        
        if (foundProduct) {
          setProduct(foundProduct);
          
          // Generate multiple images for carousel (in a real app, products would have multiple images)
          foundProduct.images = [
            foundProduct.image,
            foundProduct.image.replace('.jpg', '-2.jpg'),
            foundProduct.image.replace('.jpg', '-3.jpg')
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
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
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Product Images Carousel */}
            <div className="md:w-1/2 p-6">
              <div className="relative h-80 md:h-96 overflow-hidden rounded-lg">
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
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/product-images/placeholder.jpg';
                      }}
                    />
                  </motion.div>
                ))}
                
                {/* Navigation Arrows */}
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-neon-accent hover:text-black transition-colors duration-300"
                  aria-label="Previous image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-neon-accent hover:text-black transition-colors duration-300"
                  aria-label="Next image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {/* Thumbnail Navigation */}
              <div className="flex justify-center mt-4 space-x-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 ${currentImageIndex === index ? 'border-neon-accent' : 'border-transparent'}`}
                  >
                    <img 
                      src={image} 
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/product-images/placeholder.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Product Info */}
            <div className="md:w-1/2 p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
              
              <div className="flex items-center mb-4">
                <span className="text-gray-600 mr-2">Brand:</span>
                <Link 
                  to={`/products?brand=${product.brand}`}
                  className="text-neon-accent hover:underline"
                >
                  {product.brand}
                </Link>
              </div>
              
              <div className="text-2xl font-bold text-gray-900 mb-6">
                PKR {product.price}
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="quantity" className="block text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center">
                  <button 
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-l-md hover:bg-gray-300 transition-colors duration-300"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    id="quantity" 
                    value={quantity} 
                    onChange={handleQuantityChange}
                    min="1"
                    className="w-16 text-center border-t border-b border-gray-300 py-1"
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-r-md hover:bg-gray-300 transition-colors duration-300"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <motion.button
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-3 rounded-full text-lg font-semibold hover:bg-neon-accent hover:text-black transition-colors duration-300 mb-4"
                whileTap={{ scale: 0.95 }}
              >
                Add to Cart
              </motion.button>
              
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex items-center mb-2">
                  <span className="text-gray-600 mr-2">Category:</span>
                  <Link 
                    to={`/products?category=${product.category}`}
                    className="text-neon-accent hover:underline"
                  >
                    {product.category}
                  </Link>
                </div>
                
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">Product ID:</span>
                  <span className="text-gray-800">{product.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;