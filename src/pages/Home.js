import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Hero images
  const heroImages = [
    {
      image: '/product-images/slice-juice-1.jpg',
      title: 'Refreshing Slice Mango Juice',
      description: 'Start your day with the taste of fresh mangoes',
      cta: 'Shop Beverages'
    },
    {
      image: '/product-images/olper-milk-1.jpg',
      title: 'Pure & Fresh Olper Milk',
      description: 'Healthy and nutritious for the whole family',
      cta: 'Shop Dairy'
    },
    {
      image: '/product-images/dalda-oil-1.jpg',
      title: 'Premium Dalda Cooking Oil',
      description: 'For delicious and healthy cooking',
      cta: 'Shop Essentials'
    }
  ];
  
  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const allProducts = await import('../data/products.json')
          .then(module => module.default);
        
        setProducts(allProducts);
        
        // Select featured products (first 6)
        setFeaturedProducts(allProducts.slice(0, 6));
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, []);
  
  // Auto-change hero image every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex(prevIndex => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [heroImages.length]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-neon-accent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading amazing products...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden">
        {heroImages.map((hero, index) => (
          <motion.div
            key={index}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: currentHeroIndex === index ? 1 : 0,
              transition: { duration: 1 }
            }}
          >
            <div 
              className="w-full h-full bg-cover bg-center relative"
              style={{ 
                backgroundImage: `url(${hero.image})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <motion.h1 
                    className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ 
                      y: currentHeroIndex === index ? 0 : 20, 
                      opacity: currentHeroIndex === index ? 1 : 0 
                    }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  >
                    {hero.title}
                  </motion.h1>
                  
                  <motion.p 
                    className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ 
                      y: currentHeroIndex === index ? 0 : 20, 
                      opacity: currentHeroIndex === index ? 1 : 0 
                    }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  >
                    {hero.description}
                  </motion.p>
                  
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ 
                      y: currentHeroIndex === index ? 0 : 20, 
                      opacity: currentHeroIndex === index ? 1 : 0 
                    }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="space-x-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link 
                        to="/products" 
                        className="bg-gradient-to-r from-neon-accent to-green-400 text-black px-8 py-4 rounded-full text-lg font-bold hover:from-white hover:to-gray-100 transition-all duration-300 inline-block shadow-lg hover:shadow-xl"
                      >
                        {hero.cta}
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link 
                      to="/products" 
                      className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-white hover:text-black transition-all duration-300 inline-block"
                    >
                      View All
                    </Link>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Hero Navigation Dots */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-center space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentHeroIndex === index 
                  ? 'bg-neon-accent scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>
      
      {/* Featured Products Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Featured Products</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover our handpicked selection of premium Pakistani grocery items
            </p>
          </motion.div>
          
          {/* Infinite Scroll Ribbon */}
          <div className="relative overflow-hidden py-8 mb-16">
            <motion.div
              className="flex space-x-6"
              animate={{ x: ["-10%", "-60%"] }}
              transition={{ 
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear"
                }
              }}
            >
              {/* Double the products to create seamless loop */}
              {[...products, ...products].map((product, index) => (
                <motion.div 
                  key={`${product.id}-${index}`} 
                  className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  whileHover={{ y: -5 }}
                >
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/product-images/placeholder.jpg';
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                    <p className="text-neon-accent font-bold text-lg">PKR {product.price.toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* Top Products Grid */}
          <div className="mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Top Products</h2>
              <p className="text-gray-600 text-lg">
                Most popular items loved by our customers
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, staggerChildren: 0.1 }}
              viewport={{ once: true }}
            >
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
            
            <div className="text-center mt-10">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/products" 
                  className="bg-gradient-to-r from-gray-900 to-black text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-neon-accent hover:to-green-400 hover:text-black transition-all duration-300 inline-block shadow-lg hover:shadow-xl"
                >
                  View All Products
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Shop by Category</h2>
            <p className="text-gray-600 text-lg">
              Browse our wide range of product categories
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            {[
              { name: 'Dairy', image: '/product-images/olper-milk-1.jpg' },
              { name: 'Beverages', image: '/product-images/slice-juice-1.jpg' },
              { name: 'Snacks & Biscuits', image: '/product-images/sooper-biscuits-1.jpg' },
              { name: 'Cooking Essentials', image: '/product-images/dalda-oil-1.jpg' },
              { name: 'Toiletries', image: '/product-images/lifebuoy-soap-1.jpg' },
              { name: 'Cleaning', image: '/product-images/surf-excel-1.jpg' },
              { name: 'Spices', image: '/product-images/shan-biryani-1.jpg' },
              { name: 'Grains & Staples', image: '/product-images/guard-rice-1.jpg' },
            ].map((category, index) => (
              <motion.div
                key={index}
                className="relative rounded-xl overflow-hidden h-48 group shadow-lg hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/product-images/placeholder.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-center pb-6">
                  <Link 
                    to={`/products?category=${category.name}`}
                    className="text-white text-xl font-bold hover:text-neon-accent transition-all duration-300 transform group-hover:scale-110"
                  >
                    {category.name}
                  </Link>
                </div>
                <div className="absolute inset-0 bg-neon-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;