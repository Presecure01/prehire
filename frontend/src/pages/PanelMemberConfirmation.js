import React, { useEffect, useState } from 'react';
import { FiBell, FiSearch, FiPlus } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const PanelMemberConfirmation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Get panel member name from location state
  const memberName = location.state?.memberName || 'Panel Member';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleScheduleInterview = () => {
    // Navigate to schedule interview page (you can update this route later)
    navigate('/recruiter');
  };

  const handleAddAnotherMember = () => {
    navigate('/recruiter/add-panel-member');
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
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
        <nav style={{ ...styles.nav, display: isMobile ? 'none' : 'flex' }}>
          <a style={styles.navLink} href="#">About Us</a>
          <a style={styles.navLink} href="#">Clients</a>
          <a style={styles.navLink} href="#">Pricing</a>
          <a style={styles.navLink} href="#">FAQ</a>
          <a style={styles.navLink} href="#">Contact Us</a>
        </nav>
        <div style={styles.rightHeader}>
          <FiBell style={styles.icon} size={20} color="#374151" />
          <FiSearch style={styles.icon} size={20} color="#374151" />
          <div style={styles.avatar}>
            {user?.photo ? (
              <img src={user.photo} alt="avatar" style={styles.avatarImg} />
            ) : (
              <div style={styles.avatarFallback}>{user?.name?.[0] || 'R'}</div>
            )}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.headline}>
            {memberName} has been added to your interview panel!
          </h1>
          <p style={styles.subtitle}>
            An invite has been sent to their email. You can now assign interviews or add more panel members.
          </p>
          
          <div style={styles.buttonGroup}>
            <button 
              style={styles.primaryButton}
              onClick={handleScheduleInterview}
              onMouseEnter={(e) => e.target.style.background = '#2A8FE5'}
              onMouseLeave={(e) => e.target.style.background = '#3BA7F5'}
            >
              Schedule Interview
            </button>
            <button 
              style={styles.secondaryButton}
              onClick={handleAddAnotherMember}
              onMouseEnter={(e) => {
                e.target.style.background = '#F9FAFB';
                e.target.style.borderColor = '#111827';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#fff';
                e.target.style.borderColor = '#111827';
              }}
            >
              <FiPlus style={{ marginRight: 8 }} size={18} />
              Add Another Member
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#fff',
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
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#E5E7EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
    padding: '120px 16px 48px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 80px)'
  },
  content: {
    maxWidth: 700,
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24
  },
  headline: {
    fontSize: 32,
    fontWeight: 700,
    color: '#111827',
    margin: 0,
    lineHeight: 1.2
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    margin: 0,
    lineHeight: 1.5,
    maxWidth: 600
  },
  buttonGroup: {
    display: 'flex',
    gap: 16,
    marginTop: 16,
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  primaryButton: {
    background: '#3BA7F5',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '14px 32px',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
    minWidth: 180
  },
  secondaryButton: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #111827',
    borderRadius: 8,
    padding: '14px 32px',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180
  }
};

export default PanelMemberConfirmation;
