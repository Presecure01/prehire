import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_ENDPOINTS from '../config/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        // Ensure wallet and cards defaults exist without mutating original shape unexpectedly
        const userWithDefaults = {
          walletBalance: 0,
          paymentCards: [],
          primaryCardId: null,
          ...parsed
        };
        // Normalize if any of the new defaults were missing in storage
        if (
          parsed.walletBalance === undefined ||
          !Array.isArray(parsed.paymentCards) ||
          parsed.primaryCardId === undefined
        ) {
          localStorage.setItem('user', JSON.stringify(userWithDefaults));
        }
        setUser(userWithDefaults);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email, password: '***' });
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password
      });

      console.log('Login response:', response.data);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);

      return { success: true };
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code
      });

      let message = 'Login failed';

      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        // Mock login for testing when backend is not available
        console.log('Backend not available, using mock login');
        const mockUser = {
          id: '1',
          name: 'Bonumahanthi Chandrasekhar',
          email: email,
          role: 'candidate',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          phone: '6304984975',
          skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
          experience: '3+ years in Full Stack Development',
          currentRole: 'Senior Software Developer',
          education: 'B.Tech Computer Science',
          location: 'Hyderabad, India',
          linkedIn: 'https://linkedin.com/in/bonumahanthi',
          resumeScore: 85,
          walletBalance: 0,
          paymentCards: [],
          primaryCardId: null
        };
        const mockToken = 'mock-jwt-token-' + Date.now();

        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
        setUser(mockUser);

        return { success: true };
      } else if (error.response?.status === 401) {
        message = 'Invalid email or password';
      } else if (error.response?.status === 404) {
        message = 'User not found';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      return {
        success: false,
        message
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Registering user:', userData);
      const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, userData);

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      let message = 'Registration failed';

      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        message = 'Cannot connect to server. Please check if backend is running.';
      } else if (error.response?.status === 409) {
        message = 'User already exists with this email';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.status) {
        message = `Server error (${error.response.status}). Please try again.`;
      }

      return {
        success: false,
        message
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const value = {
    user,
    updateUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};