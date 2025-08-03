import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

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
  
  // Simulate login process
  const login = (email, verificationCode, additionalData = {}) => {
    // In a real app, this would be an API call
    const pendingAuthData = {
      email,
      verificationCode,
      timestamp: Date.now(),
      ...additionalData
    };
    
    // Store email and code in sessionStorage for verification step
    sessionStorage.setItem('pendingAuth', JSON.stringify(pendingAuthData));
    setPendingUser(pendingAuthData);
  };
  
  // Verify OTP code
  const verifyCode = (code) => {
    const pendingAuth = pendingUser || JSON.parse(sessionStorage.getItem('pendingAuth') || 'null');
    
    if (!pendingAuth) {
      toast.error('No pending verification found. Please try logging in again.');
      return false;
    }
    
    // Check if verification code has expired (10 minutes)
    const isExpired = Date.now() - pendingAuth.timestamp > 10 * 60 * 1000;
    
    if (isExpired) {
      toast.error('Verification code has expired. Please try logging in again.');
      sessionStorage.removeItem('pendingAuth');
      setPendingUser(null);
      return false;
    }
    
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
      toast.success('Login successful!');
      return true;
    } else {
      toast.error('Invalid verification code. Please try again.');
      return false;
    }
  };
  
  // Resend verification code
  const resendCode = (newVerificationCode) => {
    if (!pendingUser) return false;
    
    const updatedPendingUser = {
      ...pendingUser,
      verificationCode: newVerificationCode,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem('pendingAuth', JSON.stringify(updatedPendingUser));
    setPendingUser(updatedPendingUser);
    return true;
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