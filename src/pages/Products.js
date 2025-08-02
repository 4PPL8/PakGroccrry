import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import Breadcrumb from '../components/Breadcrumb';

const Products = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || '';
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await import('../data/products.json')
          .then(module => module.default);
        
        setProducts(allProducts);
        
        // Extract unique categories and brands
        const uniqueCategories = [...new Set(allProducts.map(p => p.category))];
        const uniqueBrands = [...new Set(allProducts.map(p => p.brand))];
        
        setCategories(uniqueCategories);
        setBrands(uniqueBrands);
        
        // Find max price for range slider
        const maxPrice = Math.max(...allProducts.map(p => p.price));
        setPriceRange({ min: 0, max: maxPrice });
        
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    
    loadProducts();
  }, []);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    // Apply brand filter
    if (selectedBrand) {
      result = result.filter(p => p.brand === selectedBrand);
    }
    
    // Apply price filter
    result = result.filter(p => 
      p.price >= priceRange.min && p.price <= priceRange.max
    );
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Default sorting (by id or featured)
        break;
    }
    
    setFilteredProducts(result);
  }, [products, selectedCategory, selectedBrand, priceRange, sortBy, searchQuery]);
  
  // Reset filters
  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange({ min: 0, max: Math.max(...products.map(p => p.price)) });
    setSortBy('default');
    setSearchQuery('');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Home', path: '/' },
            { label: selectedCategory || 'All Products' }
          ]}
        />
        
        <h1 className="text-3xl font-bold mb-8 text-center">All Products</h1>
        
        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-neon-accent focus:border-transparent"
            />
            <button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-neon-accent"
              onClick={() => setSearchQuery('')}
            >
              {searchQuery ? 'Clear' : 'Search'}
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 bg-white p-4 rounded-lg shadow-md">
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Categories</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="category-all"
                    name="category"
                    checked={selectedCategory === ''}
                    onChange={() => setSelectedCategory('')}
                    className="mr-2"
                  />
                  <label htmlFor="category-all">All Categories</label>
                </div>
                
                {categories.map(category => (
                  <div key={category} className="flex items-center">
                    <input
                      type="radio"
                      id={`category-${category}`}
                      name="category"
                      checked={selectedCategory === category}
                      onChange={() => setSelectedCategory(category)}
                      className="mr-2"
                    />
                    <label htmlFor={`category-${category}`}>{category}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Brands</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="brand-all"
                    name="brand"
                    checked={selectedBrand === ''}
                    onChange={() => setSelectedBrand('')}
                    className="mr-2"
                  />
                  <label htmlFor="brand-all">All Brands</label>
                </div>
                
                {brands.map(brand => (
                  <div key={brand} className="flex items-center">
                    <input
                      type="radio"
                      id={`brand-${brand}`}
                      name="brand"
                      checked={selectedBrand === brand}
                      onChange={() => setSelectedBrand(brand)}
                      className="mr-2"
                    />
                    <label htmlFor={`brand-${brand}`}>{brand}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Price Range</h3>
              <div className="px-2">
                <div className="flex justify-between mb-2">
                  <span>PKR {priceRange.min}</span>
                  <span>PKR {priceRange.max}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(...products.map(p => p.price))}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
            
            <button
              onClick={resetFilters}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-md transition-colors duration-300"
            >
              Reset Filters
            </button>
          </div>
          
          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort Controls */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </p>
              
              <div className="flex items-center">
                <label htmlFor="sort" className="mr-2 text-gray-600">Sort by:</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-neon-accent focus:border-transparent"
                >
                  <option value="default">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>
            
            {/* Products */}
            <AnimatePresence>
              {filteredProducts.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-xl text-gray-600">No products found matching your criteria.</p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 bg-neon-accent text-black px-4 py-2 rounded-md hover:bg-black hover:text-white transition-colors duration-300"
                  >
                    Reset Filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;