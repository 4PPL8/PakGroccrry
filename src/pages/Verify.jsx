import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import toast from 'react-hot-toast';
import Breadcrumb from '../components/Breadcrumb';

const Verify = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [error, setError] = useState('');
  const [networkStatus, setNetworkStatus] = useState('online');
  const { verifyCode, pendingUser, resendCode } = useAuth();
  const navigate = useNavigate();

  const inputRefs = useRef([]);
  if (inputRefs.current.length !== 6) {
    inputRefs.current = Array(6).fill().map(() => React.createRef());
  }

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].current.focus();
    }
  }, []);

  // Redirect if no pending verification
  useEffect(() => {
    if (!pendingUser) {
      navigate('/login');
      toast.error('No verification in progress. Please login or register first.');
    }
  }, [pendingUser, navigate]);
  
  // Check network status
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus('online');
      toast.success('You are back online');
    };
    
    const handleOffline = () => {
      setNetworkStatus('offline');
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
  }, []);
  
  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle input change
  const handleChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].current.focus();
    }
  };
  
  // Handle key down
  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].current.focus();
    }
  };
  
  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setCode(digits);
      
      // Focus the last input
      inputRefs.current[5].current.focus();
    }
  };
  
  // Clear error when code changes
  useEffect(() => {
    if (error) setError('');
  }, [code]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check network status
    if (networkStatus === 'offline') {
      setError('You are offline. Please check your internet connection and try again.');
      toast.error('You are offline. Please check your internet connection.');
      return;
    }
    
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      toast.error('Please enter the complete 6-digit code');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Set timeout for verification process
      const verificationPromise = new Promise((resolve, reject) => {
        // Simulate API call delay
        setTimeout(async () => {
          try {
            const success = verifyCode(verificationCode);
            resolve(success);
          } catch (err) {
            reject(err);
          }
        }, 1000);
      });
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Verification request timed out. Please try again.'));
        }, 10000); // 10 seconds timeout
      });
      
      // Race between verification and timeout
      const success = await Promise.race([verificationPromise, timeoutPromise]);
      
      if (success) {
        toast.success('Verification successful!');
        navigate('/');
      } else {
        setError('Invalid verification code. Please check and try again.');
        toast.error('Invalid verification code. Please check and try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      const errorMessage = error.message || 'Something went wrong. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle resend code
  const handleResendCode = async () => {
    if (timeLeft > 0 || isResending) return;
    
    // Check network status
    if (networkStatus === 'offline') {
      setError('You are offline. Please check your internet connection and try again.');
      toast.error('You are offline. Please check your internet connection.');
      return;
    }
    
    setIsResending(true);
    setError('');
    
    try {
      // Set timeout for resend process
      const resendPromise = new Promise((resolve, reject) => {
        // Simulate API call delay
        setTimeout(async () => {
          try {
            // Generate a new random 6-digit code
            const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            const success = resendCode(newVerificationCode);
            
            if (success) {
              // Reset timer
              setTimeLeft(120);
              // Clear input fields
              setCode(['', '', '', '', '', '']);
              // Focus first input
              if (inputRefs.current[0]) {
                inputRefs.current[0].current.focus();
              }
              resolve(true);
            } else {
              reject(new Error('Failed to resend verification code. Please try again.'));
            }
          } catch (err) {
            reject(err);
          }
        }, 1500);
      });
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timed out. Please try again.'));
        }, 10000); // 10 seconds timeout
      });
      
      // Race between resend and timeout
      await Promise.race([resendPromise, timeoutPromise]);
      
      toast.success('New verification code sent to your email');
    } catch (error) {
      console.error('Resend error:', error);
      const errorMessage = error.message || 'Failed to resend code. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };
  
  if (!pendingUser) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto mb-8">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Home', path: '/' },
            { label: 'Register', path: '/register' },
            { label: 'Verify' }
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
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Verify Your Email</h2>
          
          <p className="text-center text-gray-600 mb-3">
            We've sent a 6-digit verification code to<br />
            <span className="font-medium text-black">{pendingUser?.email || 'your email'}</span>
          </p>
          
          <p className="text-center text-sm text-gray-500 mb-6">
            Please check your inbox and spam folder. If you don't receive the code within a few minutes, you can request a new one.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
              {error}
            </div>
          )}
          
          {networkStatus === 'offline' && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-md">
              You are currently offline. Please check your internet connection.
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-3 text-center">Enter Verification Code</label>
              
              <div className="flex justify-center space-x-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neon-accent focus:border-transparent"
                    disabled={isSubmitting}
                  />
                ))}
              </div>
              
              <p className="text-center text-sm text-gray-500 mt-3">
                {timeLeft > 0 ? (
                  <>Code expires in {formatTime(timeLeft)}</>
                ) : (
                  <>Code expired</>
                )}
              </p>
            </div>
            
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
                  Verifying...
                </span>
              ) : 'Verify Code'}
            </motion.button>
          </form>
          
          <div className="text-center mt-6">
            <button 
              onClick={handleResendCode}
              className={`text-neon-accent font-medium ${timeLeft > 0 || isResending || networkStatus === 'offline' ? 'opacity-50 cursor-not-allowed' : 'hover:underline'}`}
              disabled={timeLeft > 0 || isResending || networkStatus === 'offline'}
            >
              {isResending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-neon-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : 'Resend Code'}
            </button>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Having trouble? <Link to="/login" className="text-neon-accent hover:underline">Return to login</Link></p>
            </div>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default Verify;