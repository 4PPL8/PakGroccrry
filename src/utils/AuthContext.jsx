import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// Mock email service - in a real app, this would be an API call to a backend service
const mockEmailService = {
  sendVerificationEmail: async (email, code) => {
    // Simulate network delay and potential failures
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() < 0.9) {
          console.log(`Email sent to ${email} with code: ${code}`);
          resolve({ success: true, message: 'Email sent successfully' });
        } else {
          console.error(`Failed to send email to ${email}`);
          reject(new Error('Failed to send verification email. Server error.'));
        }
      }, 1500); // Simulate network delay
    });
  }
};

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load user from localStorage on initial render
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedPendingUser = sessionStorage.getItem('pendingAuth');
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
    
    if (savedPendingUser) {
      try {
        const pending = JSON.parse(savedPendingUser);
        // Check if not expired (10 minutes)
        if (Date.now() - pending.timestamp < 10 * 60 * 1000) {
          setPendingUser(pending);
        } else {
          sessionStorage.removeItem('pendingAuth');
        }
      } catch (error) {
        console.error('Error parsing pending user data:', error);
        sessionStorage.removeItem('pendingAuth');
      }
    }
    
    setIsLoading(false);
  }, []);
  
  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);
  
  // Simulate login process with email verification
  const login = async (email, verificationCode, additionalData = {}) => {
    try {
      // In a real app, this would be an API call to generate and send a verification code
      const pendingAuthData = {
        email,
        verificationCode,
        timestamp: Date.now(),
        emailSent: false, // Track if email was successfully sent
        attempts: 0, // Track number of verification attempts
        ...additionalData
      };
      
      // Attempt to send verification email
      try {
        await mockEmailService.sendVerificationEmail(email, verificationCode);
        pendingAuthData.emailSent = true;
      } catch (error) {
        console.error('Error sending verification email:', error);
        toast.error('There was a problem sending the verification email. Please try again or check your email address.');
        // We still create the pending user but mark email as not sent
      }
      
      // Store email and code in sessionStorage for verification step
      sessionStorage.setItem('pendingAuth', JSON.stringify(pendingAuthData));
      setPendingUser(pendingAuthData);
      
      return pendingAuthData.emailSent;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    }
  };
  
  // Verify OTP code with improved error handling
  const verifyCode = (code) => {
    try {
      const pendingAuth = pendingUser || JSON.parse(sessionStorage.getItem('pendingAuth') || 'null');
      
      if (!pendingAuth) {
        throw new Error('No pending verification found. Please try logging in again.');
      }
      
      // Check if verification code has expired (10 minutes)
      const isExpired = Date.now() - pendingAuth.timestamp > 10 * 60 * 1000;
      
      if (isExpired) {
        // Clean up expired verification
        sessionStorage.removeItem('pendingAuth');
        setPendingUser(null);
        throw new Error('Verification code has expired. Please try logging in again.');
      }
      
      // Track verification attempts
      const updatedPendingAuth = {
        ...pendingAuth,
        attempts: (pendingAuth.attempts || 0) + 1
      };
      
      // Check if too many failed attempts (5 max)
      if (updatedPendingAuth.attempts > 5) {
        sessionStorage.removeItem('pendingAuth');
        setPendingUser(null);
        throw new Error('Too many failed attempts. Please try logging in again.');
      }
      
      // Update attempts in session storage
      sessionStorage.setItem('pendingAuth', JSON.stringify(updatedPendingAuth));
      setPendingUser(updatedPendingAuth);
      
      // Check if the code matches
      if (pendingAuth.verificationCode === code) {
        // Set the user
        const newUser = {
          email: pendingAuth.email,
          name: pendingAuth.name || pendingAuth.email.split('@')[0], // Use provided name or extract from email
          phone: pendingAuth.phone || '',
          isVerified: true,
          loginTime: Date.now()
        };
        
        setUser(newUser);
        sessionStorage.removeItem('pendingAuth');
        setPendingUser(null);
        return true;
      } else {
        // If email wasn't sent successfully before, we might want to be more lenient
        // or provide a different error message
        if (!pendingAuth.emailSent) {
          throw new Error('Invalid code. Note: There was an issue sending your verification email earlier.');
        }
        throw new Error('Invalid verification code. Please check and try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      // Don't show toast here - let the component handle the error display
      throw error;
    }
  };
  
  // Resend verification code with email service integration
  const resendCode = async (newVerificationCode) => {
    try {
      if (!pendingUser) {
        throw new Error('No pending verification found. Please try logging in again.');
      }
      
      // Attempt to send verification email
      await mockEmailService.sendVerificationEmail(pendingUser.email, newVerificationCode);
      
      const updatedPendingUser = {
        ...pendingUser,
        verificationCode: newVerificationCode,
        timestamp: Date.now(),
        emailSent: true,
        attempts: 0 // Reset attempts counter
      };
      
      sessionStorage.setItem('pendingAuth', JSON.stringify(updatedPendingUser));
      setPendingUser(updatedPendingUser);
      return true;
    } catch (error) {
      console.error('Resend code error:', error);
      
      // Still update the code in case the user knows it through other means
      // but mark email as not sent
      if (pendingUser) {
        const updatedPendingUser = {
          ...pendingUser,
          verificationCode: newVerificationCode,
          timestamp: Date.now(),
          emailSent: false
        };
        
        sessionStorage.setItem('pendingAuth', JSON.stringify(updatedPendingUser));
        setPendingUser(updatedPendingUser);
      }
      
      throw error;
    }
  };
  
  // Logout
  const logout = () => {
    setUser(null);
    setPendingUser(null);
    sessionStorage.removeItem('pendingAuth');
    toast.success('Logged out successfully');
  };
  
  const value = {
    user,
    pendingUser,
    isLoading,
    isAuthenticated: !!user,
    login,
    verifyCode,
    resendCode,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};