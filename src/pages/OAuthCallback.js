import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleCallback = () => {
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get('token');
      const userStr = urlParams.get('user');
      const error = urlParams.get('error');

      if (error) {
        alert('Authentication failed. Please try again.');
        navigate('/');
        return;
      }

      if (token && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr));
          
          // Store token and user data
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Set axios default header
          const axios = require('axios');
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Update auth context
          if (setUser) {
            setUser(user);
          }

          // Redirect based on role
          const redirectPath = user.role === 'candidate' ? '/candidate' : '/recruiter';
          navigate(redirectPath);
          
        } catch (error) {
          console.error('Error parsing user data:', error);
          alert('Authentication failed. Please try again.');
          navigate('/');
        }
      } else {
        alert('Authentication failed. Please try again.');
        navigate('/');
      }
    };

    handleCallback();
  }, [location, navigate, setUser]);

  return (
    <div style={styles.container}>
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc'
  },
  loading: {
    textAlign: 'center'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem'
  }
};

// Add CSS animation
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default OAuthCallback;