import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const SwipeableCardStack = ({ products, maxCards = 5 }) => {
  // State to manage the stack of cards
  const [stack, setStack] = useState(() => products.slice(0, maxCards));
  const [direction, setDirection] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTimeout, setDragTimeout] = useState(null);
  
  // Motion values for the top card
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15], { clamp: true });
  const opacity = useTransform(
    x, 
    [-200, -150, 0, 150, 200], 
    [0.5, 1, 1, 1, 0.5],
    { clamp: true }
  );
  
  // Transform for the swipe effect - subtle green border effect regardless of direction
  // Optimize the transform to reduce unnecessary calculations
  const swipeEffectOpacity = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [0.6, 0.3, 0, 0.3, 0.6],
    { clamp: true } // Clamp values to reduce calculations outside the range
  );
  
  // Controls for animations
  const controls = useAnimation();
  
  // Threshold for swipe to be considered a decision
  const SWIPE_THRESHOLD = 100;
  
  // Cleanup function for timeouts
  useEffect(() => {
    // Cleanup function to clear any remaining timeouts when component unmounts
    return () => {
      if (dragTimeout) {
        clearTimeout(dragTimeout);
      }
    };
  }, [dragTimeout]);
  
  // Calculate dynamic card position based on drag amount
  const calculateCardOffset = (index) => {
    if (index === 0) return 0;
    
    // Get the current x value to calculate how much the top card has moved
    const currentX = x.get();
    const dragProgress = Math.min(Math.abs(currentX) / 200, 0.5);
    
    // Increase the offset of cards below based on how far the top card is dragged
    // Use a more efficient calculation that reduces visual complexity
    return index * 10 - (dragProgress * 4 * index);
  };
  
  // Handle card removal
  const removeCard = (direction) => {
    setDirection(direction);
    
    // Pre-load the next card's image to reduce lag
    if (stack.length > 1) {
      const nextCardImage = new Image();
      nextCardImage.src = stack[1].image;
    }
    
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
          const newProduct = availableProducts[randomIndex];
          
          // Pre-load the new product's image
          const newImage = new Image();
          newImage.src = newProduct.image;
          
          newStack.push(newProduct);
        }
      }
      
      return newStack;
    });
    
    // Reset motion values with a slight delay to ensure smooth transitions
    setTimeout(() => {
      x.set(0);
      y.set(0);
    }, 50);
  };
  
  // Handle drag start
  const handleDragStart = () => {
    setIsDragging(true);
    
    // Clear any existing timeout
    if (dragTimeout) {
      clearTimeout(dragTimeout);
      setDragTimeout(null);
    }
  };
  
  // Handle drag end
  const handleDragEnd = (_, info) => {
    setIsDragging(false);
    const offsetX = info.offset.x;
    const velocityX = info.velocity.x;
    
    // Auto-complete swipe if velocity is high enough, even if not past threshold
    if (Math.abs(offsetX) > SWIPE_THRESHOLD || Math.abs(velocityX) > 500) {
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
    } else if (Math.abs(offsetX) > SWIPE_THRESHOLD / 2) {
      // If dragged more than half the threshold, auto-complete the swipe
      const direction = offsetX > 0 ? 'right' : 'left';
      const targetX = direction === 'right' ? 500 : -500;
      
      controls.start({
        x: targetX,
        opacity: 0,
        transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] }
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
            <AnimatePresence mode="popLayout">
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
                    willChange: index < 2 ? 'transform, opacity' : 'auto', // Hardware acceleration for top cards
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
                  onDrag={(_, info) => {
                    if (index === 0) {
                      // Clear any existing timeout
                      if (dragTimeout) {
                        clearTimeout(dragTimeout);
                      }
                      
                      // Set a new timeout to auto-complete the swipe after a short period of inactivity
                      // The timeout duration is proportional to how far the card has been dragged
                      const newTimeout = setTimeout(() => {
                        const currentX = x.get();
                        // Determine auto-swipe behavior based on drag distance
                        if (Math.abs(currentX) > SWIPE_THRESHOLD / 2) {
                          // If dragged more than half the threshold, complete swipe quickly
                          const direction = currentX > 0 ? 'right' : 'left';
                          const targetX = direction === 'right' ? 500 : -500;
                          
                          controls.start({
                            x: targetX,
                            opacity: 0,
                            transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] }
                          }).then(() => {
                            removeCard(direction);
                            setDragTimeout(null);
                          });
                        } else if (Math.abs(currentX) > 20) {
                          // If only moved a little, still auto-complete but with slower animation
                          const direction = currentX > 0 ? 'right' : 'left';
                          const targetX = direction === 'right' ? 500 : -500;
                          
                          controls.start({
                            x: targetX,
                            opacity: 0,
                            transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] }
                          }).then(() => {
                            removeCard(direction);
                            setDragTimeout(null);
                          });
                        }
                      }, Math.max(800, 1500 - Math.abs(x.get()) * 3)); // Shorter timeout for larger drags
                      
                      setDragTimeout(newTimeout);
                    }
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,  // Increased stiffness for snappier animations
                    damping: 40,     // Increased damping to reduce oscillation
                    mass: 0.6,       // Reduced mass for faster movement
                    restDelta: 0.01  // Smaller rest delta for smoother finish
                  }}
                  whileTap={{ scale: index === 0 ? 1.05 : 1 }}
                  exit={{
                    x: direction === 'right' ? 500 : -500,
                    opacity: 0,
                    transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] }
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
                        loading={index < 2 ? "eager" : "lazy"} // Eagerly load top two cards
                        decoding="async" // Use async decoding for better performance
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