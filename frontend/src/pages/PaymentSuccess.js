import React, { useState, useEffect } from 'react';
import { FiBell, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const PaymentSuccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFindNewRole = () => {
    navigate('/job-posting');
  };

  const handleCheckMore = () => {
    navigate('/recruiter');
  };

  return (
    <div style={styles.container}>
      <header style={{
        ...styles.header,
        padding: isMobile ? '12px 16px' : '16px 32px'
      }}>
        <div
          style={styles.brand}
          role="button"
          tabIndex={0}
          onClick={() => navigate('/recruiter')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/recruiter');
            }
          }}
        >
          PreHire
        </div>
        
        {/* Desktop Navigation */}
        <nav style={{...styles.nav, display: isMobile ? 'none' : 'flex'}}>
          <a href="#" style={styles.navLink}>About Us</a>
          <a href="#" style={styles.navLink}>Clients</a>
          <a href="#" style={styles.navLink}>Pricing</a>
          <a href="#" style={styles.navLink}>FAQ</a>
          <a href="#" style={styles.navLink}>Contact Us</a>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          style={{...styles.mobileMenuBtn, display: isMobile ? 'block' : 'none'}}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div style={styles.mobileMenu}>
            <a style={styles.mobileNavLink} href="#" onClick={() => setMobileMenuOpen(false)}>About Us</a>
            <a style={styles.mobileNavLink} href="#" onClick={() => setMobileMenuOpen(false)}>Clients</a>
            <a style={styles.mobileNavLink} href="#" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a style={styles.mobileNavLink} href="#" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <a style={styles.mobileNavLink} href="#" onClick={() => setMobileMenuOpen(false)}>Contact Us</a>
          </div>
        )}

        <div style={{
          ...styles.rightHeader,
          display: isMobile ? 'none' : 'flex'
        }}>
          <div style={{ position: 'relative' }}>
            <FiBell style={styles.icon} size={20} color="#374151" />
            <div style={styles.notificationDot}></div>
          </div>
          <FiSearch style={styles.icon} size={20} color="#374151" />
          <div style={styles.avatar}>
            {user?.photo ? (
              <img src={user.photo} alt="avatar" style={styles.avatarImg} />
            ) : (
              <div style={styles.avatarFallback}>
                {user?.name?.charAt(0) || 'R'}
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{
        ...styles.main,
        padding: isMobile ? '2rem 1rem' : '4rem 2rem',
        paddingTop: isMobile ? 100 : 120
      }}>
        <div style={styles.content}>
          <h1 style={styles.title}>
            Payment Successful ✓
          </h1>
          
          <p style={styles.subtitle}>
            You've unlocked 1 candidate profile. Details have been sent to your email hr@company.com
          </p>

          <div style={styles.summaryCard}>
            <div style={styles.summaryRow}>
              <div style={styles.iconContainer}>
                <span style={styles.icon}>🔧</span>
              </div>
              <div style={styles.label}>Job Title</div>
              <div style={styles.value}>Web Designer</div>
            </div>
            
            <div style={styles.summaryRow}>
              <div style={styles.iconContainer}>
                <span style={styles.icon}>👥</span>
              </div>
              <div style={styles.label}>Number of Candidates</div>
              <div style={styles.value}>1 (One)</div>
            </div>
            
            <div style={styles.summaryRow}>
              <div style={styles.iconContainer}>
                <span style={styles.icon}>💰</span>
              </div>
              <div style={styles.label}>Total amount</div>
              <div style={styles.value}>₹500 X 1 = ₹500</div>
            </div>
          </div>

          <div style={styles.buttons}>
            <button onClick={handleFindNewRole} style={styles.findButton}>
              Find for New Role
            </button>
            <button onClick={handleCheckMore} style={styles.checkButton}>
              Check more candidates
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
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 32px',
    borderBottom: '1px solid #E5E7EB',
    background: '#fff',
    zIndex: 1000,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    height: 64
  },
  brand: {
    fontSize: 22,
    fontWeight: 700,
    color: '#7C3AED',
    cursor: 'pointer',
    userSelect: 'none'
  },
  nav: {
    gap: 24,
    alignItems: 'center'
  },
  mobileMenuBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#374151',
    padding: '8px'
  },
  mobileMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderTop: 'none',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    zIndex: 1001,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  mobileNavLink: {
    color: '#6B7280',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: 16,
    padding: '8px 0',
    borderBottom: '1px solid #F3F4F6'
  },
  navLink: {
    color: '#6B7280',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: 14
  },
  rightHeader: {
    display: 'flex',
    gap: 12,
    alignItems: 'center'
  },
  icon: {
    fontSize: 18,
    cursor: 'pointer'
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#EF4444',
    border: '2px solid #fff'
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#E5E7EB'
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#374151',
    fontWeight: 600,
    fontSize: 16
  },
  main: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 100px)',
    padding: '4rem 2rem'
  },
  content: {
    textAlign: 'center',
    maxWidth: '600px'
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '1.5rem',
    lineHeight: '1.3'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#6B7280',
    marginBottom: '3rem',
    lineHeight: '1.6'
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '3rem',
    textAlign: 'left'
  },
  summaryRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  iconContainer: {
    width: '40px',
    display: 'flex',
    justifyContent: 'center'
  },
  icon: {
    fontSize: '1.2rem'
  },
  label: {
    flex: 1,
    fontSize: '1rem',
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: '1rem'
  },
  value: {
    fontSize: '1rem',
    color: '#1F2937',
    fontWeight: '600'
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center'
  },
  findButton: {
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  checkButton: {
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #D1D5DB',
    padding: '1rem 2rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer'
  }
};

export default PaymentSuccess;
