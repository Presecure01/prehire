import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import Navbar from '../../components/common/Navbar';

const CandidateLogin = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log('Login successful, user:', user);
      // Force a page reload to ensure proper authentication state
      window.location.href = user.role === 'candidate' ? '/candidate' : '/recruiter';
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={styles.container}>
      <Navbar />

      <main style={{
        ...styles.main,
        padding: isMobile ? '2rem 1rem' : '4rem 3rem',
        marginTop: isMobile ? 70 : 80
      }}>
        <div style={styles.content}>
          <h1 style={styles.title}>Welcome Back!</h1>
          <p style={styles.subtitle}>Your dream job starts here.</p>

          
          {error && <div style={styles.error}>{error}</div>}
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="email"
              name="email"
              placeholder="Email*"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
            
            <input
              type="password"
              name="password"
              placeholder="Password*"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
            
            <button 
              type="submit" 
              disabled={loading}
              style={styles.button}
            >
              {loading ? 'Logging in...' : 'Submit'}
            </button>
          </form>
          
          <div style={styles.links}>
            <Link to="/employer/login" style={styles.registerLink}>Login with OTP</Link>
            <Link to="/forgot-password" style={styles.registerLink}>Forgot Password?</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  main: {
    padding: '4rem 3rem',
    display: 'flex',
    justifyContent: 'center',
    marginTop: 80
  },
  content: {
    maxWidth: '400px',
    textAlign: 'center'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '0.5rem'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#6B7280',
    marginBottom: '2rem'
  },
  form: {
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'left',
    marginBottom: '1rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: 'none',
    backgroundColor: '#F3F4F6',
    borderRadius: '8px',
    fontSize: '1rem',
    marginBottom: '1rem',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  error: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.9rem'
  },
  links: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: '#6B7280'
  },
  registerLink: {
    color: '#3B82F6',
    textDecoration: 'none'
  }
};

export default CandidateLogin;
