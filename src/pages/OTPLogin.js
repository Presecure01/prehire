import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const OTPLogin = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      setTimeout(() => {
        const userData = {
          id: '1',
          email: email,
          name: 'John Doe',
          role: 'recruiter'
        };
        
        login(userData);
        navigate('/recruiter');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Login failed');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>PreHire</div>
        <nav style={styles.nav}>
          <a href="#" style={styles.navLink}>About Us</a>
          <a href="#" style={styles.navLink}>Clients</a>
          <a href="#" style={styles.navLink}>Pricing</a>
          <a href="#" style={styles.navLink}>FAQ</a>
          <a href="#" style={styles.navLink}>Contact Us</a>
        </nav>
        <div style={styles.loginButton}>
          <span style={styles.loginText}>Login</span>
          <div style={styles.arrow}>→</div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>Welcome Back!</h1>
          <p style={styles.subtitle}>Find your next perfect hire today.</p>

          <div style={styles.formCard}>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email*</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>OTP*</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={styles.input}
                  placeholder="Enter OTP"
                  required
                />
              </div>

              {error && <div style={styles.error}>{error}</div>}

              <button 
                type="submit" 
                style={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>

            <div style={styles.footer}>
              <Link to="/login" style={styles.link}>
                Login with Password
              </Link>
            </div>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 3rem',
    backgroundColor: 'white'
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#8B5CF6'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem'
  },
  navLink: {
    textDecoration: 'none',
    color: '#6B7280',
    fontSize: '0.95rem',
    fontWeight: '500'
  },
  loginButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    gap: '0.5rem',
    cursor: 'pointer'
  },
  loginText: {
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  arrow: {
    backgroundColor: '#1F2937',
    color: 'white',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem'
  },
  main: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 100px)',
    padding: '2rem'
  },
  content: {
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%'
  },
  title: {
    fontSize: '3rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '1rem'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#6B7280',
    marginBottom: '3rem'
  },
  formCard: {
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '2rem',
    backgroundColor: 'white'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  inputGroup: {
    textAlign: 'left'
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#6B7280',
    marginBottom: '0.5rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '0.9rem',
    backgroundColor: '#F9FAFB',
    outline: 'none'
  },
  submitButton: {
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
    color: '#ef4444',
    fontSize: '0.875rem',
    textAlign: 'center'
  },
  footer: {
    textAlign: 'center',
    marginTop: '2rem'
  },
  link: {
    color: '#1F2937',
    textDecoration: 'none',
    fontSize: '0.9rem'
  }
};

export default OTPLogin;