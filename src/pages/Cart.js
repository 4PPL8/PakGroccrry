import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../utils/CartContext';
import { useAuth } from '../utils/AuthContext';
import Breadcrumb from '../components/Breadcrumb';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  
  const [orderMethod, setOrderMethod] = useState('email');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  
  // Format price with commas
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Handle quantity change
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };
  
  // Place order via email
  const handleEmailOrder = () => {
    if (!user) {
      toast.error('Please login to place an order');
      return;
    }
    
    if (!address.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }
    
    const subject = 'New Order from PakGrocery';
    
    let body = `New order from: ${user.email}\n\n`;
    body += `Delivery Address: ${address}\n\n`;
    body += 'Order Items:\n';
    
    cart.forEach(item => {
      body += `- ${item.name} (${item.quantity} x PKR ${item.price}) = PKR ${item.quantity * item.price}\n`;
    });
    
    body += `\nTotal Amount: PKR ${totalPrice}\n`;
    
    if (note) {
      body += `\nCustomer Note: ${note}\n`;
    }
    
    const mailtoLink = `mailto:orders@pakgrocery.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;
    
    toast.success('Redirecting to email client...');
  };
  
  // Place order via WhatsApp
  const handleWhatsAppOrder = () => {
    if (!user) {
      toast.error('Please login to place an order');
      return;
    }
    
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    
    if (!address.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }
    
    let message = `*New Order from PakGrocery*\n\n`;
    message += `*Customer:* ${user.email}\n`;
    message += `*Phone:* ${phoneNumber}\n`;
    message += `*Delivery Address:* ${address}\n\n`;
    message += '*Order Items:*\n';
    
    cart.forEach(item => {
      message += `- ${item.name} (${item.quantity} x PKR ${item.price}) = PKR ${item.quantity * item.price}\n`;
    });
    
    message += `\n*Total Amount:* PKR ${totalPrice}\n`;
    
    if (note) {
      message += `\n*Customer Note:* ${note}\n`;
    }
    
    // Replace with your actual WhatsApp business number
    const whatsappNumber = '923001234567';
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappLink, '_blank');
    
    toast.success('Redirecting to WhatsApp...');
  };
  
  // Handle order submission
  const handleSubmitOrder = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    if (orderMethod === 'email') {
      handleEmailOrder();
    } else {
      handleWhatsAppOrder();
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Home', path: '/' },
            { label: 'Shopping Cart' }
          ]}
        />
        
        <h1 className="text-3xl font-bold mb-8 text-center">Your Shopping Cart</h1>
        
        {cart.length > 0 ? (
          <div className="lg:flex lg:gap-6">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 lg:mb-0">
                <div className="p-4 border-b">
                  <h2 className="text-xl font-semibold">Cart Items ({cart.length})</h2>
                </div>
                
                <ul className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {cart.map(item => (
                      <motion.li 
                        key={item.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="sm:w-20 h-20 mb-4 sm:mb-0 sm:mr-4">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover rounded-md"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/product-images/placeholder.jpg';
                            }}
                          />
                        </div>
                        
                        <div className="flex-1 sm:mr-4">
                          <Link 
                            to={`/product/${item.id}`}
                            className="text-lg font-medium text-gray-800 hover:text-neon-accent transition-colors duration-300"
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-gray-600">{item.brand}</p>
                          <p className="text-neon-accent font-medium">PKR {formatPrice(item.price)}</p>
                        </div>
                        
                        <div className="flex items-center mt-4 sm:mt-0">
                          <div className="flex items-center mr-4">
                            <button 
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="bg-gray-200 text-gray-700 px-2 py-1 rounded-l-md hover:bg-gray-300 transition-colors duration-300"
                            >
                              -
                            </button>
                            <input 
                              type="number" 
                              value={item.quantity} 
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                              min="1"
                              className="w-12 text-center border-t border-b border-gray-300 py-1"
                            />
                            <button 
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="bg-gray-200 text-gray-700 px-2 py-1 rounded-r-md hover:bg-gray-300 transition-colors duration-300"
                            >
                              +
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors duration-300"
                          >
                            Remove
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                
                <div className="p-4 border-t">
                  <button 
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 transition-colors duration-300"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
                <div className="p-4 border-b">
                  <h2 className="text-xl font-semibold">Order Summary</h2>
                </div>
                
                <div className="p-4">
                  <div className="space-y-3 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between text-gray-600">
                        <span>{item.name} x {item.quantity}</span>
                        <span>PKR {formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-3 mb-6">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-neon-accent">PKR {formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Order Method</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          value="email" 
                          checked={orderMethod === 'email'}
                          onChange={() => setOrderMethod('email')}
                          className="mr-2"
                        />
                        Email
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          value="whatsapp" 
                          checked={orderMethod === 'whatsapp'}
                          onChange={() => setOrderMethod('whatsapp')}
                          className="mr-2"
                        />
                        WhatsApp
                      </label>
                    </div>
                  </div>
                  
                  {orderMethod === 'whatsapp' && (
                    <div className="mb-4">
                      <label htmlFor="phone" className="block text-gray-700 mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g., 03001234567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neon-accent focus:border-transparent"
                      />
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="address" className="block text-gray-700 mb-2">Delivery Address</label>
                    <textarea 
                      id="address" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your full delivery address"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neon-accent focus:border-transparent"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="note" className="block text-gray-700 mb-2">Order Note (Optional)</label>
                    <textarea 
                      id="note" 
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Any special instructions for your order"
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neon-accent focus:border-transparent"
                    />
                  </div>
                  
                  {!user ? (
                    <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-md">
                      <p>Please <Link to="/login" className="text-neon-accent font-medium">login</Link> to place an order.</p>
                    </div>
                  ) : null}
                  
                  <motion.button
                    onClick={handleSubmitOrder}
                    className={`w-full py-3 rounded-full text-lg font-semibold ${user ? 'bg-black text-white hover:bg-neon-accent hover:text-black' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} transition-colors duration-300`}
                    whileTap={user ? { scale: 0.95 } : {}}
                    disabled={!user}
                  >
                    Place Order
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
            <Link 
              to="/products" 
              className="bg-black text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-neon-accent hover:text-black transition-colors duration-300"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;