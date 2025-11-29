import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

const Landing = () => {
  const [activeTab, setActiveTab] = useState('candidate');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const handleSocialLogin = (provider) => {
    const role = activeTab; // 'candidate' or 'employer'
    const baseUrl = 'http://localhost:5001/api/auth';
    
    // Store the intended role in localStorage for after OAuth callback
    localStorage.setItem('pendingRole', role);
    
    switch (provider) {
      case 'google':
        window.location.href = `${baseUrl}/google?role=${role}`;
        break;
      case 'facebook':
        window.location.href = `${baseUrl}/facebook?role=${role}`;
        break;
      case 'linkedin':
        window.location.href = `${baseUrl}/linkedin?role=${role}`;
        break;
      default:
        console.error('Unknown provider:', provider);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={styles.container}>
      <Navbar />

      <main style={{
        ...styles.main,
        padding: isMobile ? '2rem 1rem' : '4rem 3rem 2rem',
        marginTop: isMobile ? 70 : 80
      }}>
        <div style={{
          ...styles.hero,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '2rem' : '0'
        }}>
          <div style={styles.heroContent}>
            <h1 style={styles.title}>
              Discover one-in-a-million talent, <span style={styles.highlight}>effortlessly</span>
            </h1>
            <p style={styles.subtitle}>
              AI-powered filtering, instant access, and smarter hiring designed for busy recruiters and best jobs for candidates
            </p>
          </div>
          
          <div style={styles.notification}>
            <div style={styles.avatar}>👤</div>
            <div style={styles.notificationText}>
              John we found 14 candidates found for your SDE-I role
            </div>
          </div>
        </div>

        <div style={styles.bottomSection}>
          <div style={styles.tabs}>
            <button 
              style={{...styles.tab, ...(activeTab === 'candidate' ? styles.activeTab : {})}}
              onClick={() => setActiveTab('candidate')}
            >
              For Candidate
            </button>
            <button 
              style={{...styles.tab, ...(activeTab === 'employer' ? styles.activeTab : {})}}
              onClick={() => setActiveTab('employer')}
            >
              For Employer
            </button>
          </div>
          
          <p style={styles.question}>
            {activeTab === 'candidate' ? 'How can I help you find job today ?' : 'How can I help you hire today ?'}
          </p>
          
          {activeTab === 'candidate' ? (
            <div style={styles.actions}>
              <Link to="/candidate-signup" style={styles.joinButton}>Join Now</Link>
              <Link to="/candidate/login" style={styles.loginButtonBottom}>Login</Link>
            </div>
          ) : (
            <>
              <div style={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="I want to hire a Java Developer with 5+ years of experience in Bangalore"
                  style={styles.searchInput}
                />
                <button style={styles.searchButton}><span aria-hidden>🔍</span></button>
              </div>
              
              <div style={styles.actions}>
                <Link to="/employer-signup" style={styles.joinButton}>Sign Up</Link>
                <Link to="/employer/login" style={styles.loginButtonBottom}>Login</Link>
              </div>
            </>
          )}
          
          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>OR</span>
            <div style={styles.dividerLine}></div>
          </div>
          
          <div style={styles.socialButtons}>
            <button 
              style={{...styles.socialButton, ...styles.googleButton}}
              onClick={() => handleSocialLogin('google')}
              title="Continue with Google"
            >
              <i className="bi bi-google"></i>
            </button>
            <button 
              style={{...styles.socialButton, ...styles.facebookButton}}
              onClick={() => handleSocialLogin('facebook')}
              title="Continue with Facebook"
            >
              <i className="bi bi-facebook"></i>
            </button>
            <button 
              style={{...styles.socialButton, ...styles.linkedinButton}}
              onClick={() => handleSocialLogin('linkedin')}
              title="Continue with LinkedIn"
            >
              <i className="bi bi-linkedin"></i>
            </button>
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
    padding: '4rem 3rem 2rem',
    marginTop: 80
  },
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    maxWidth: '1200px',
    margin: '0 auto',
    marginBottom: '6rem'
  },
  heroContent: {
    flex: 1,
    maxWidth: '500px'
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: '1.1',
    marginBottom: '1.5rem'
  },
  highlight: {
    color: '#60A5FA',
    fontStyle: 'italic'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#6B7280',
    lineHeight: '1.6',
    marginBottom: '2rem'
  },
  notification: {
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    maxWidth: '350px',
    marginTop: '2rem'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem'
  },
  notificationText: {
    fontSize: '0.95rem',
    color: '#374151',
    lineHeight: '1.4'
  },
  bottomSection: {
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#F8FAFC',
    padding: '3rem 2rem',
    borderRadius: '20px'
  },
  tabs: {
    display: 'inline-flex',
    backgroundColor: '#F3F4F6',
    borderRadius: '30px',
    padding: '4px',
    marginBottom: '2rem',
    border: '1px solid #E5E7EB'
  },
  tab: {
    padding: '12px 24px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '26px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    color: '#6B7280',
    transition: 'all 0.2s ease',
    minWidth: '140px'
  },
  activeTab: {
    backgroundColor: '#60A5FA',
    color: 'white',
    boxShadow: '0 2px 4px rgba(96, 165, 250, 0.3)'
  },
  question: {
    fontSize: '1.1rem',
    color: '#374151',
    marginBottom: '2rem',
    fontWeight: '500'
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '2rem'
  },
  joinButton: {
    textDecoration: 'none',
    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
    color: 'white',
    padding: '1rem 2rem',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: '600'
  },
  loginButtonBottom: {
    textDecoration: 'none',
    backgroundColor: 'white',
    color: '#374151',
    padding: '1rem 2rem',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: '500',
    border: '1px solid #D1D5DB'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '2rem 0',
    width: '100%'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#D1D5DB'
  },
  dividerText: {
    padding: '0 1rem',
    color: '#9CA3AF',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  socialButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem'
  },
  socialButton: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: '1px solid #D1D5DB',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      transform: 'scale(1.05)'
    }
  },
  googleButton: {
    color: '#DB4437',
    ':hover': {
      backgroundColor: '#DB4437',
      color: 'white',
      borderColor: '#DB4437'
    }
  },
  facebookButton: {
    color: '#4267B2',
    ':hover': {
      backgroundColor: '#4267B2',
      color: 'white',
      borderColor: '#4267B2'
    }
  },
  linkedinButton: {
    color: '#0077B5',
    ':hover': {
      backgroundColor: '#0077B5',
      color: 'white',
      borderColor: '#0077B5'
    }
  },
  searchContainer: {
    display: 'flex',
    marginBottom: '2rem',
    border: '1px solid #D1D5DB',
    borderRadius: '25px',
    overflow: 'hidden',
    backgroundColor: 'white'
  },
  searchInput: {
    flex: 1,
    padding: '1rem 1.5rem',
    border: 'none',
    fontSize: '1rem',
    outline: 'none',
    color: '#374151'
  },
  searchButton: {
    padding: '1rem 1.5rem',
    border: 'none',
    backgroundColor: '#3B82F6',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1.2rem'
  }
};

export default Landing;
