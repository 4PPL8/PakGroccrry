import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
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
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchRef = useRef(null);
  
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
  
  // Handle clicks outside of search suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search input changes and generate suggestions
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedSuggestionIndex(-1); // Reset selection when input changes
    
    if (query.trim() === '') {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const suggestions = products.filter(p => 
      p.name.toLowerCase().includes(lowercaseQuery) || 
      p.brand.toLowerCase().includes(lowercaseQuery) ||
      p.category.toLowerCase().includes(lowercaseQuery)
    ).slice(0, 5); // Limit to 5 suggestions
    
    setSearchSuggestions(suggestions);
    setShowSuggestions(true);
  };
  
  // Handle keyboard navigation for search suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions || searchSuggestions.length === 0) return;
    
    // Arrow down - move selection down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prevIndex => 
        prevIndex < searchSuggestions.length - 1 ? prevIndex + 1 : 0
      );
    }
    
    // Arrow up - move selection up
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prevIndex => 
        prevIndex > 0 ? prevIndex - 1 : searchSuggestions.length - 1
      );
    }
    
    // Enter - select the highlighted suggestion
    else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      const selectedProduct = searchSuggestions[selectedSuggestionIndex];
      setSearchQuery(selectedProduct.name);
      setShowSuggestions(false);
      // Navigate to the product page
      window.location.href = `/product/${selectedProduct.id}`;
    }
    
    // Escape - close suggestions
    else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };
  
  // Highlight matching text in search results
  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? <span key={index} className="bg-yellow-100 text-gray-800">{part}</span> : part
    );
  };

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
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb 
          items={[
            { label: 'Home', path: '/' },
            { label: 'Products', path: '/products' },
            selectedCategory ? { label: selectedCategory, path: `/products?category=${selectedCategory}` } : null
          ].filter(Boolean)}
        />
        
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-neon-accent to-neon-accent-dark">Explore Our Products</h1>
        
        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => searchQuery.trim() !== '' && setShowSuggestions(true)}
              placeholder="Search products..."
              className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-neon-accent focus:border-transparent shadow-sm transition-all duration-300 hover:shadow-md"
              aria-expanded={showSuggestions}
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              aria-activedescendant={selectedSuggestionIndex >= 0 ? `suggestion-${selectedSuggestionIndex}` : ''}
            />
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-neon-accent transition-colors duration-300"
              onClick={() => {
                setSearchQuery('');
                setSearchSuggestions([]);
                setShowSuggestions(false);
              }}
            >
              {searchQuery ? 'Clear' : 'Search'}
            </button>
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div 
                className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-h-[80vh] sm:max-h-[60vh] overflow-y-auto"
                id="search-suggestions"
                role="listbox"
                aria-label="Search suggestions"
              >
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-2 bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                      <p className="text-sm font-medium text-gray-700">Suggestions for "{searchQuery}"</p>
                    </div>
                    {searchSuggestions.map((product, index) => (
                      <Link 
                        key={product.id} 
                        id={`suggestion-${index}`}
                        to={`/product/${product.id}`}
                        role="option"
                        aria-selected={selectedSuggestionIndex === index}
                        className={`block transition-colors duration-200 ${selectedSuggestionIndex === index ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        onClick={() => {
                          setSearchQuery(product.name);
                          setShowSuggestions(false);
                        }}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      >
                        <div className="flex items-center p-3 border-b border-gray-100 last:border-b-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/product-images/placeholder.jpg';
                              }}
                            />
                          </div>
                          <div className="ml-2 sm:ml-3 flex-1">
                            <p className="font-medium text-gray-800 line-clamp-1 text-sm sm:text-base">
                              {highlightMatch(product.name, searchQuery)}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {highlightMatch(product.brand, searchQuery)} · ₹{product.price} · {highlightMatch(product.category, searchQuery)}
                            </p>
                          </div>
                          {selectedSuggestionIndex === index && (
                            <div className="ml-2 text-neon-accent">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                              </svg>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                    <div className="p-2 bg-gray-50 border-t border-gray-100 sticky bottom-0 z-10">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{searchSuggestions.length} results</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 hidden sm:inline">Use ↑↓ to navigate, Enter to select</span>
                          <button 
                            className="text-center text-sm font-medium text-neon-accent hover:text-neon-accent-dark transition-colors duration-200 py-1 px-3"
                            onClick={() => setShowSuggestions(false)}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-72 bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
            <div className="mb-8 bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <h3 className="font-semibold text-xl mb-5 text-transparent bg-clip-text bg-gradient-to-r from-neon-accent to-neon-accent-dark pb-2 border-b border-gray-200">Categories</h3>
              <div className="space-y-3 px-2">
                <div className="flex items-center hover:bg-gray-50 p-2 rounded-lg transition-all duration-200">
                  <input
                    type="radio"
                    id="category-all"
                    name="category"
                    checked={selectedCategory === ''}
                    onChange={() => setSelectedCategory('')}
                    className="mr-3 h-4 w-4 accent-neon-accent cursor-pointer"
                  />
                  <label htmlFor="category-all" className="font-medium cursor-pointer select-none">All Categories</label>
                </div>
                
                {categories.map(category => (
                  <div key={category} className="flex items-center hover:bg-gray-50 p-2 rounded-lg transition-all duration-200">
                    <input
                      type="radio"
                      id={`category-${category}`}
                      name="category"
                      checked={selectedCategory === category}
                      onChange={() => setSelectedCategory(category)}
                      className="mr-3 h-4 w-4 accent-neon-accent cursor-pointer"
                    />
                    <label htmlFor={`category-${category}`} className="font-medium cursor-pointer select-none">{category}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-8 bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <h3 className="font-semibold text-xl mb-5 text-transparent bg-clip-text bg-gradient-to-r from-neon-accent to-neon-accent-dark pb-2 border-b border-gray-200">Brands</h3>
              <div className="space-y-3 px-2">
                <div className="flex items-center hover:bg-gray-50 p-2 rounded-lg transition-all duration-200">
                  <input
                    type="radio"
                    id="brand-all"
                    name="brand"
                    checked={selectedBrand === ''}
                    onChange={() => setSelectedBrand('')}
                    className="mr-3 h-4 w-4 accent-neon-accent cursor-pointer"
                  />
                  <label htmlFor="brand-all" className="font-medium cursor-pointer select-none">All Brands</label>
                </div>
                
                {brands.map(brand => (
                  <div key={brand} className="flex items-center hover:bg-gray-50 p-2 rounded-lg transition-all duration-200">
                    <input
                      type="radio"
                      id={`brand-${brand}`}
                      name="brand"
                      checked={selectedBrand === brand}
                      onChange={() => setSelectedBrand(brand)}
                      className="mr-3 h-4 w-4 accent-neon-accent cursor-pointer"
                    />
                    <label htmlFor={`brand-${brand}`} className="font-medium cursor-pointer select-none">{brand}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-8 bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <h3 className="font-semibold text-xl mb-5 text-transparent bg-clip-text bg-gradient-to-r from-neon-accent to-neon-accent-dark pb-2 border-b border-gray-200">Price Range</h3>
              <div className="px-2">
                <div className="flex justify-between mb-4">
                  <span className="font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">₹ {priceRange.min}</span>
                  <span className="font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">₹ {priceRange.max}</span>
                </div>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center px-2">
                    <div className="h-1 w-full bg-gray-200 rounded-full"></div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(...products.map(p => p.price))}
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    className="w-full accent-neon-accent h-2 rounded-lg appearance-none cursor-pointer relative z-10 bg-transparent"
                  />
                </div>
              </div>
            </div>
            
            <button
              onClick={resetFilters}
              className="w-full bg-gradient-to-r from-neon-accent to-neon-accent-dark text-black font-medium py-3.5 rounded-full transition-all duration-300 hover:shadow-neon hover:scale-105 transform flex items-center justify-center gap-2 mt-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Reset Filters
            </button>
          </div>
          
          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-md border border-gray-100">
              <p className="text-gray-700 font-medium mb-3 sm:mb-0">
                Showing <span className="text-neon-accent font-bold">{filteredProducts.length}</span> of <span className="font-bold">{products.length}</span> products
              </p>
              
              <div className="flex items-center relative group">
                <label htmlFor="sort" className="mr-3 text-gray-700 font-medium">Sort by:</label>
                <div className="relative">
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none border-2 border-gray-200 rounded-full px-6 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-neon-accent focus:border-transparent bg-gradient-to-r from-white to-gray-50 text-gray-700 font-medium transition-all duration-300 cursor-pointer hover:border-neon-accent hover:shadow-neon min-w-[180px]"
                  >
                    <option value="default">Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neon-accent">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Products */}
            <AnimatePresence>
              {filteredProducts.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, staggerChildren: 0.1 }}
                >
                  {filteredProducts.map(product => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="transform transition-all duration-300 hover:scale-105"
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-100 p-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="text-2xl font-semibold text-gray-700 mb-4">No products found</p>
                  <p className="text-gray-500 mb-6">We couldn't find any products matching your criteria.</p>
                  <button
                    onClick={resetFilters}
                    className="px-6 py-3 bg-gradient-to-r from-neon-accent to-neon-accent-dark text-black font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 transform"
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