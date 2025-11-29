import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const LinkedInSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      alert('LinkedIn login failed. Please try again.');
      navigate('/login');
      return;
    }

    if (token) {
      // Store token and decode user info
      localStorage.setItem('token', token);
      
      // Decode JWT to get user info (simplified)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userData = {
          id: payload.userId,
          email: payload.email,
          role: payload.role
        };
        
        login(userData);
        
        // Redirect based on role
        if (payload.role === 'candidate') {
          navigate('/candidate');
        } else {
          navigate('/recruiter');
        }
      } catch (err) {
        console.error('Token decode error:', err);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, login]);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h2>Processing LinkedIn login...</h2>
        <p>Please wait while we set up your account.</p>
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
  content: {
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }
};

export default LinkedInSuccess;