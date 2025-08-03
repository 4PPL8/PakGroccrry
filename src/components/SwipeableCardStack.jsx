import { useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const SwipeableCardStack = ({ products, maxCards = 5 }) => {
  // State to manage the stack of cards
  const [stack, setStack] = useState(() => products.slice(0, maxCards));
  const [direction, setDirection] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Motion values for the top card
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(
    x, 
    [-200, -150, 0, 150, 200], 
    [0.5, 1, 1, 1, 0.5]
  );
  
  // Transform for the swipe effect - subtle green border effect regardless of direction
  const swipeEffectOpacity = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [0.6, 0.3, 0, 0.3, 0.6]
  );
  
  // Controls for animations
  const controls = useAnimation();
  
  // Threshold for swipe to be considered a decision
  const SWIPE_THRESHOLD = 100;
  
  // Calculate dynamic card position based on drag amount
  const calculateCardOffset = (index) => {
    if (index === 0) return 0;
    
    // Get the current x value to calculate how much the top card has moved
    const currentX = x.get();
    const dragProgress = Math.min(Math.abs(currentX) / 200, 0.5);
    
    // Increase the offset of cards below based on how far the top card is dragged
    return index * 12 - (dragProgress * 5 * index);
  };
  
  // Handle card removal
  const removeCard = (direction) => {
    setDirection(direction);
    
    // Remove the top card
    setStack((prevStack) => {
      const newStack = [...prevStack];
      newStack.shift();
      
      // If we're running low on cards, add more from the original products
      if (newStack.length < 3 && products.length > maxCards) {
        // Add a product that's not already in the stack
        const existingIds = new Set(newStack.map(p => p.id));
        const availableProducts = products.filter(p => !existingIds.has(p.id));
        
        if (availableProducts.length > 0) {
          // Add a random product from available ones
          const randomIndex = Math.floor(Math.random() * availableProducts.length);
          newStack.push(availableProducts[randomIndex]);
        }
      }
      
      return newStack;
    });
    
    // Reset motion values
    x.set(0);
    y.set(0);
  };
  
  // Handle drag start
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  // Handle drag end
  const handleDragEnd = (_, info) => {
    setIsDragging(false);
    const offsetX = info.offset.x;
    
    if (Math.abs(offsetX) > SWIPE_THRESHOLD) {
      // Determine direction and animate card off screen
      const direction = offsetX > 0 ? 'right' : 'left';
      const targetX = direction === 'right' ? 500 : -500;
      
      controls.start({
        x: targetX,
        opacity: 0,
        transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] }
      }).then(() => {
        removeCard(direction);
      });
    } else {
      // Return to center if not swiped far enough
      controls.start({
        x: 0,
        y: 0,
        transition: { type: 'spring', stiffness: 400, damping: 30 }
      });
    }
  };
  
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
      {stack.length === 0 ? (
        <div className="text-center p-6 bg-white rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No more products!</h3>
          <p className="text-gray-600 mb-4">You've gone through all our featured items.</p>
          <Link 
            to="/products" 
            className="bg-gradient-to-r from-neon-accent to-green-400 text-black px-6 py-3 rounded-full text-base font-bold hover:shadow-lg transition-all duration-300 inline-block"
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        <>
          {/* Stack of cards */}
          <div className="relative w-full max-w-sm mx-auto h-full">
            <AnimatePresence>
              {stack.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="absolute top-0 left-0 right-0 w-full max-w-sm mx-auto"
                  style={{
                    zIndex: stack.length - index,
                    y: calculateCardOffset(index),
                    scale: 1 - index * 0.05,
                    opacity: index === 0 ? 1 : 0.9 - index * 0.08,
                    boxShadow: index === 0 
                      ? isDragging 
                        ? '0 15px 30px rgba(0, 0, 0, 0.2)' 
                        : '0 10px 25px rgba(0, 0, 0, 0.15)' 
                      : '0 5px 15px rgba(0, 0, 0, 0.1)',
                    ...(index === 0 ? {
                      x,
                      y,
                      rotate,
                      opacity
                    } : {})
                  }}
                  animate={index === 0 ? controls : undefined}
                  drag={index === 0 ? true : false}
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.8}
                  onDragStart={index === 0 ? handleDragStart : undefined}
                  onDragEnd={index === 0 ? handleDragEnd : undefined}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                    mass: 0.8
                  }}
                  whileTap={{ scale: index === 0 ? 1.05 : 1 }}
                  exit={{
                    x: direction === 'right' ? 500 : -500,
                    opacity: 0,
                    transition: { duration: 0.3 }
                  }}
                >
                  <div 
                    className={`bg-white rounded-xl overflow-hidden h-[450px] flex flex-col shadow-lg transition-all duration-300 ${index === 0 && isDragging ? 'ring-2 ring-green-300 ring-opacity-50' : ''}`} 
                    style={{ boxShadow: isDragging && index === 0 ? '0 20px 25px rgba(0, 0, 0, 0.18)' : undefined }}
                  >
                    <div className="relative h-60 overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/product-images/placeholder.svg';
                        }}
                      />
                      <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-full text-sm font-semibold text-neon-accent">
                        PKR {product.price.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="p-5 flex-grow flex flex-col">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
                      
                      <div className="mt-auto flex justify-between items-center">
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                          {product.category}
                        </span>
                        
                        <Link 
                          to={`/products/${product.id}`}
                          className="text-neon-accent font-semibold hover:underline"
                          onClick={(e) => {
                            // Prevent triggering card swipe when clicking the link
                            e.stopPropagation();
                          }}
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                    
                    {/* Subtle green effect for any swipe direction - only visible on the top card */}
                    {index === 0 && (
                      <motion.div 
                        className="absolute inset-0 bg-green-400/20 rounded-xl border-2 border-green-400"
                        style={{ opacity: swipeEffectOpacity }}
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {/* Swipe instructions */}
          <div className="absolute bottom-2 left-0 right-0 text-center text-gray-500 text-sm">
            <p>Swipe cards to explore products</p>
            <div className="flex justify-center mt-2 space-x-1">
              {Array(Math.min(5, stack.length)).fill(0).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-green-400' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SwipeableCardStack;