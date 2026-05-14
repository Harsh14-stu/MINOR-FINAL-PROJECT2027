import { useState, useEffect, useContext, createContext } from 'react';
import { authService } from '../services/api';
import { toast } from 'react-toastify';
import { getFromLocalStorage, removeFromLocalStorage, setToLocalStorage } from '../utils/helpers';
import { USER_ROLES } from '../utils/constants';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = getFromLocalStorage('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
          // Verify token validity
          try {
            const response = await authService.getProfile();
            const validUser = response.data;
            setUser(validUser);
            setIsAdmin(validUser.role === USER_ROLES.ADMIN);
            setToLocalStorage('user', validUser);
          } catch (error) {
            // Invalid token
            removeFromLocalStorage('user');
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      setToLocalStorage('user', userData);
      setUser(userData);
      setIsAdmin(userData.role === USER_ROLES.ADMIN);
      
      toast.success(`Welcome back, ${userData.name}! 👋`);
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAdmin(false);
    toast.info('Logged out successfully 👋');
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      const updatedUser = response.data.user;
      setUser(updatedUser);
      setToLocalStorage('user', updatedUser);
      toast.success('Profile updated! ✅');
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    isAdmin,
    loading,
    login,
    logout,
    updateProfile,
    hasRole: (role) => user?.role === role,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};