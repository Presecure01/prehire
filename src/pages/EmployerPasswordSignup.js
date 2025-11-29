import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const EmployerPasswordSignup = () => {
  const [formData, setFormData] = useState({
    recruiterName: '',
    companyMail: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    
    // Get previous form data
    const previousData = JSON.parse(localStorage.getItem('employerSignupData') || '{}');
    
    // Combine all data
    const completeData = {
      name: formData.recruiterName,
      email: formData.companyMail,
      password: formData.password,
      role: 'recruiter',
      companyName: previousData.companyName,
      companyLogo: previousData.logo,
      contactInfo: formData.companyMail,
      location: previousData.location,
      employees: previousData.employees
    };

    const result = await register(completeData);
    
    if (result.success) {
      localStorage.removeItem('employerSignupData');
      navigate('/recruiter');
    } else {
      alert(result.message);
    }
    
    setLoading(false);
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
          <Link to="/login" style={styles.loginButton}>
            Login <span style={styles.arrow}>→</span>
          </Link>
        </nav>
      </header>

      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>Just a Few Steps to Your First Great Hire</h1>
          <p style={styles.subtitle}>
            Complete your profile so candidates know who they're applying to.
          </p>

          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Recruiter Name*</label>
                <input
                  type="text"
                  name="recruiterName"
                  value={formData.recruiterName}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Company Mail*</label>
                <input
                  type="email"
                  name="companyMail"
                  value={formData.companyMail}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Enter Password*</label>
                <div style={styles.passwordField}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    style={styles.passwordInput}
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    style={styles.eyeButton}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    👁️
                  </button>
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Confirm Password*</label>
                <div style={styles.passwordField}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={styles.passwordInput}
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    style={styles.eyeButton}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    👁️
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" style={styles.submitButton} disabled={loading}>
              {loading ? 'Creating Account...' : 'Submit'}
            </button>
          </form>

          <div style={styles.divider}>
            <Link to="/employer/complete" style={styles.phoneSignup}>Sign Up with Phone Number</Link>
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              <span style={styles.blueText}>Want smarter, faster hiring?</span>{' '}
              <span style={styles.purpleText}>Try our AI-powered profile-matching tool</span>
            </p>
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
    textDecoration: 'none',
    backgroundColor: '#3B82F6',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '25px',
    fontSize: '0.95rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  arrow: {
    fontSize: '1rem'
  },
  main: {
    padding: '4rem 3rem',
    display: 'flex',
    justifyContent: 'center'
  },
  content: {
    maxWidth: '600px',
    textAlign: 'center'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '1rem'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#6B7280',
    lineHeight: '1.6',
    marginBottom: '3rem'
  },
  form: {
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'left',
    marginBottom: '2rem'
  },
  row: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  field: {
    flex: 1
  },
  label: {
    display: 'block',
    fontSize: '0.95rem',
    color: '#6B7280',
    marginBottom: '0.5rem',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: 'none',
    backgroundColor: '#F3F4F6',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box'
  },
  passwordField: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  passwordInput: {
    width: '100%',
    padding: '0.75rem',
    paddingRight: '3rem',
    border: 'none',
    backgroundColor: '#F3F4F6',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box'
  },
  eyeButton: {
    position: 'absolute',
    right: '0.75rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1rem'
  },
  divider: {
    textAlign: 'center',
    marginBottom: '3rem'
  },
  phoneSignup: {
    textDecoration: 'none',
    color: '#6B7280',
    fontSize: '0.95rem',
    fontWeight: '500'
  },
  footer: {
    textAlign: 'center'
  },
  footerText: {
    fontSize: '1.1rem',
    margin: 0
  },
  blueText: {
    color: '#60A5FA'
  },
  purpleText: {
    color: '#8B5CF6'
  }
};

export default EmployerPasswordSignup;