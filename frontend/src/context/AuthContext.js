import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check if user is logged in by checking local storage
    const checkLoggedIn = async () => {
      if (localStorage.getItem('tabulaxUser')) {
        const userData = JSON.parse(localStorage.getItem('tabulaxUser'));
        setUser(userData);
        setIsAuthenticated(true);
        
        // Set global axios auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      }
      
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    
    try {
      const response = await axios.post('/api/users', userData);
      
      // Save to localStorage
      localStorage.setItem('tabulaxUser', JSON.stringify(response.data));
      
      // Update auth context
      setUser(response.data);
      setIsAuthenticated(true);
      setAuthError(null);
      
      // Set axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      toast.success('Registration successful');
      setLoading(false);
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setAuthError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      return false;
    }
  };

  // Login user
  const login = async (userData) => {
    setLoading(true);
    
    try {
      const response = await axios.post('/api/users/login', userData);
      
      // Save to localStorage
      localStorage.setItem('tabulaxUser', JSON.stringify(response.data));
      
      // Update auth context
      setUser(response.data);
      setIsAuthenticated(true);
      setAuthError(null);
      
      // Set axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      toast.success('Login successful');
      setLoading(false);
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setAuthError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('tabulaxUser');
    setUser(null);
    setIsAuthenticated(false);
    
    // Remove axios auth header
    delete axios.defaults.headers.common['Authorization'];
    
    toast.success('Logged out successfully');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    
    try {
      const response = await axios.put('/api/users/profile', userData);
      
      // Save to localStorage
      localStorage.setItem('tabulaxUser', JSON.stringify(response.data));
      
      // Update auth context
      setUser(response.data);
      
      toast.success('Profile updated successfully');
      setLoading(false);
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed. Please try again.';
      setAuthError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        authError,
        register,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
