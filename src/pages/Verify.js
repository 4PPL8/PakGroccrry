import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import toast from 'react-hot-toast';
import Breadcrumb from '../components/Breadcrumb';

const Verify = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const { verifyCode, pendingUser, resendCode } = useAuth();
  const navigate = useNavigate();

  const inputRefs = useRef([]);
  if (inputRefs.current.length !== 6) {
    inputRefs.current = Array(6).fill().map(() => React.createRef());
  }

  // ...rest of your code


  // Redirect if no pending verification
  useEffect(() => {
    if (!pendingUser) {
      navigate('/login');
      toast.error('Please login first');
    }
  }, [pendingUser, navigate]);
  
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
      inputRefs[index + 1].current.focus();
    }
  };
  
  // Handle key down
  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current.focus();
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
      inputRefs[5].current.focus();
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const success = verifyCode(verificationCode);
      
      if (success) {
        toast.success('Verification successful!');
        navigate('/');
      } else {
        toast.error('Invalid verification code. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle resend code
  const handleResendCode = async () => {
    if (timeLeft > 0) return;
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a new random 6-digit code
      const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      resendCode(newVerificationCode);
      
      // Reset timer
      setTimeLeft(120);
      
      toast.success('New verification code sent to your email');
    } catch (error) {
      toast.error('Failed to resend code. Please try again.');
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
          
          <p className="text-center text-gray-600 mb-6">
            We've sent a 6-digit verification code to<br />
            <span className="font-medium text-black">{pendingUser.email}</span>
          </p>
          
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
              className="w-full bg-black text-white py-3 rounded-full text-lg font-semibold hover:bg-neon-accent hover:text-black transition-colors duration-300 mb-4"
              whileTap={{ scale: 0.95 }}
              disabled={isSubmitting}
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
              className={`text-neon-accent font-medium ${timeLeft > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:underline'}`}
              disabled={timeLeft > 0}
            >
              Resend Code
            </button>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default Verify;