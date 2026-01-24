import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { getApiUrl } from '../utils/apiClient';

const Landing = () => {
  const [activeTab, setActiveTab] = useState('candidate');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const handleSocialLogin = (provider) => {
    const role = activeTab; // 'candidate' or 'employer'
    const baseUrl = getApiUrl('/api/auth');

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

      <main
        style={{
          ...styles.main,
          padding: isMobile ? '1.5rem 1rem 2rem' : '2.5rem 2rem 3rem',
          marginTop: isMobile ? 64 : 72
        }}
      >
        {/* layout wrapper so content is centered and limited in width */}
        <div style={styles.layout}>
          {/* HERO SECTION */}
          <div
            style={{
              ...styles.hero,
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? '1.75rem' : '2.5rem'
            }}
          >
            <div style={styles.heroContent}>
              <h1 style={styles.title}>
                Discover one-in-a-million talent,{' '}
                <span style={styles.highlight}>effortlessly</span>
              </h1>
              <p style={styles.subtitle}>
                AI-powered filtering, instant access, and smarter hiring designed for busy
                recruiters and the best jobs for candidates.
              </p>
            </div>

            <div style={styles.notification}>
              <div style={styles.avatar}>👤</div>
              <div style={styles.notificationText}>
                John, we found 14 candidates for your SDE-I role.
              </div>
            </div>
          </div>

          {/* BOTTOM CARD SECTION */}
          <div style={styles.bottomSection}>
            <div style={styles.tabs}>
              <button
                style={{ ...styles.tab, ...(activeTab === 'candidate' ? styles.activeTab : {}) }}
                onClick={() => setActiveTab('candidate')}
              >
                For Candidate
              </button>
              <button
                style={{ ...styles.tab, ...(activeTab === 'employer' ? styles.activeTab : {}) }}
                onClick={() => setActiveTab('employer')}
              >
                For Employer
              </button>
            </div>

            <p style={styles.question}>
              {activeTab === 'candidate'
                ? 'How can I help you find a job today?'
                : 'How can I help you hire today?'}
            </p>

            {activeTab === 'candidate' ? (
              <div style={styles.actions}>
                <Link to="/candidate-signup" style={styles.joinButton}>
                  Join Now
                </Link>
                <Link to="/candidate/login" style={styles.loginButtonBottom}>
                  Login
                </Link>
              </div>
            ) : (
              <>
                <div style={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="I want to hire a Java Developer with 5+ years of experience in Bangalore"
                    style={styles.searchInput}
                  />
                  <button style={styles.searchButton}>
                    <span aria-hidden>🔍</span>
                  </button>
                </div>

                <div style={styles.actions}>
                  <Link to="/employer-signup" style={styles.joinButton}>
                    Sign Up
                  </Link>
                  <Link to="/employer/login" style={styles.loginButtonBottom}>
                    Login
                  </Link>
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
                style={{ ...styles.socialButton, ...styles.googleButton }}
                onClick={() => handleSocialLogin('google')}
                title="Continue with Google"
              >
                <i className="bi bi-google"></i>
              </button>
              <button
                style={{ ...styles.socialButton, ...styles.facebookButton }}
                onClick={() => handleSocialLogin('facebook')}
                title="Continue with Facebook"
              >
                <i className="bi bi-facebook"></i>
              </button>
              <button
                style={{ ...styles.socialButton, ...styles.linkedinButton }}
                onClick={() => handleSocialLogin('linkedin')}
                title="Continue with LinkedIn"
              >
                <i className="bi bi-linkedin"></i>
              </button>
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
  main: {
    // overall page area below navbar
    minHeight: 'calc(100vh - 72px)',
    display: 'flex',
    justifyContent: 'center'
  },
  layout: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2.5rem'
  },
  heroContent: {
    flex: 1,
    maxWidth: '520px'
  },
  title: {
    // responsive font size: min 2rem, ideal ~3rem, max 3.2rem
    fontSize: 'clamp(2rem, 4vw, 3.2rem)',
    fontWeight: 700,
    color: '#1F2937',
    lineHeight: 1.2,
    marginBottom: '1rem'
  },
  highlight: {
    color: '#60A5FA',
    fontStyle: 'italic'
  },
  subtitle: {
    fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
    color: '#6B7280',
    lineHeight: 1.6,
    marginBottom: '0.75rem'
  },
  notification: {
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.9rem',
    maxWidth: '340px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    color: '#fff'
  },
  notificationText: {
    fontSize: '0.95rem',
    color: '#374151',
    lineHeight: 1.4
  },
  bottomSection: {
    textAlign: 'center',
    maxWidth: '640px',
    margin: '0 auto 1.5rem',
    backgroundColor: '#F8FAFC',
    padding: '2.25rem 2rem',
    borderRadius: '20px',
    boxShadow: '0 6px 20px rgba(15, 23, 42, 0.06)'
  },
  tabs: {
    display: 'inline-flex',
    backgroundColor: '#F3F4F6',
    borderRadius: '30px',
    padding: '4px',
    marginBottom: '1.5rem',
    border: '1px solid #E5E7EB'
  },
  tab: {
    padding: '10px 22px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '26px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    color: '#6B7280',
    transition: 'all 0.2s ease',
    minWidth: '130px'
  },
  activeTab: {
    backgroundColor: '#60A5FA',
    color: '#fff',
    boxShadow: '0 2px 4px rgba(96, 165, 250, 0.3)'
  },
  question: {
    fontSize: '1.05rem',
    color: '#374151',
    marginBottom: '1.75rem',
    fontWeight: 500
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.9rem',
    marginBottom: '1.75rem'
  },
  joinButton: {
    textDecoration: 'none',
    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
    color: '#fff',
    padding: '0.9rem 2rem',
    borderRadius: '25px',
    fontSize: '0.98rem',
    fontWeight: 600
  },
  loginButtonBottom: {
    textDecoration: 'none',
    backgroundColor: '#fff',
    color: '#374151',
    padding: '0.9rem 2rem',
    borderRadius: '25px',
    fontSize: '0.98rem',
    fontWeight: 500,
    border: '1px solid #D1D5DB'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '1.75rem 0',
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
    fontSize: '0.85rem',
    fontWeight: 500
  },
  socialButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.9rem'
  },
  socialButton: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    border: '1px solid #D1D5DB',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  googleButton: {
    color: '#DB4437'
  },
  facebookButton: {
    color: '#4267B2'
  },
  linkedinButton: {
    color: '#0077B5'
  },
  searchContainer: {
    display: 'flex',
    marginBottom: '1.75rem',
    border: '1px solid #D1D5DB',
    borderRadius: '25px',
    overflow: 'hidden',
    backgroundColor: '#fff'
  },
  searchInput: {
    flex: 1,
    padding: '0.9rem 1.4rem',
    border: 'none',
    fontSize: '0.98rem',
    outline: 'none',
    color: '#374151'
  },
  searchButton: {
    padding: '0.9rem 1.4rem',
    border: 'none',
    backgroundColor: '#3B82F6',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1.1rem'
  }
};

export default Landing;
