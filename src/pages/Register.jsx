import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import toast from 'react-hot-toast';
import Breadcrumb from '../components/Breadcrumb';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('online');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Check network status
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus('online');
      if (error) setError('');
      toast.success('You are back online');
    };
    
    const handleOffline = () => {
      setNetworkStatus('offline');
      setError('You are offline. Please check your internet connection before proceeding.');
      toast.error('You are offline. Please check your internet connection.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial status
    setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Check network status
    if (networkStatus === 'offline') {
      setError('You are offline. Please check your internet connection and try again.');
      return;
    }
    
    // Validate form
    if (!formData.name.trim()) {
      setError('Please enter your name');
      toast.error('Please enter your name');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      toast.error('Please enter your email address');
      return;
    }
    
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate a random 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Call login function from AuthContext with additional user data (now async)
      const emailSent = await login(formData.email, verificationCode, {
        name: formData.name,
        phone: formData.phone,
        isNewUser: true
      });
      
      if (emailSent) {
        toast.success('Account created! Verification code sent to your email');
      } else {
        // Email wasn't sent but we still created the pending user
        toast.warning('Account created! We had trouble sending the verification email, but you can still proceed with verification. If you don\'t receive the code, you can request a new one on the next screen.');
      }
      
      navigate('/verify');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto mb-8">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Home', path: '/' },
            { label: 'Register' }
          ]}
        />
      </div>
      
      <div className="flex items-center justify-center">
        <motion.div 
          className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="px-6 py-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create an Account</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Full Name</label>
              <input 
                type="text" 
                id="name" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neon-accent focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neon-accent focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Phone Number (Optional)</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neon-accent focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                {error}
              </div>
            )}
            
            {networkStatus === 'offline' && !error && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-md">
                You are currently offline. Please check your internet connection before proceeding.
              </div>
            )}
            
            <motion.button
              type="submit"
              className={`w-full py-3 rounded-full text-lg font-semibold transition-colors duration-300 mb-4 ${networkStatus === 'offline' ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-black text-white hover:bg-neon-accent hover:text-black'}`}
              whileTap={{ scale: networkStatus === 'offline' ? 1 : 0.95 }}
              disabled={isSubmitting || networkStatus === 'offline'}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : 'Create Account'}
            </motion.button>
          </form>
          
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-neon-accent font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t">
          <p className="text-sm text-gray-600 text-center">
            By creating an account, you agree to WahabStore's Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default Register;