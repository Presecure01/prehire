import React from 'react';
import { FiBell, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const UnlockPrompt = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePayment = () => {
    navigate('/profile-unlock');
  };

  const handleCheckMore = () => {
    navigate('/recruiter');
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
        <div style={styles.userSection}>
          <FiBell style={styles.notification} size={20} color="#374151" />
          <FiSearch style={styles.search} size={20} color="#374151" />
          <div style={styles.avatar}>
            {user?.photo ? (
              <img src={user.photo} alt="Profile" style={styles.avatarImg} />
            ) : (
              <div style={styles.avatarPlaceholder}>
                {user?.name?.charAt(0) || 'R'}
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>
            Unlock Full Profile of your designer for just ₹500?
          </h1>
          
          <p style={styles.subtitle}>
            Email, phone number, and full resume of <span style={styles.candidateName}>Ananya Mehra</span> will be sent to your mail hr@company.com
          </p>

          <div style={styles.buttons}>
            <button onClick={handlePayment} style={styles.payButton}>
              Pay 500
            </button>
            <button onClick={handleCheckMore} style={styles.checkButton}>
              Check more candidates
            </button>
          </div>

          <div style={styles.offer}>
            <span style={styles.offerText}>
              <span style={styles.specialOffer}>Special offer:</span>{' '}
              <span style={styles.unlockText}>Unlock 5 profiles,</span>{' '}
              <span style={styles.payText}>pay for only 4!</span>
            </span>
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
    backgroundColor: 'white',
    borderBottom: '1px solid #E5E7EB'
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
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  notification: {
    fontSize: '1.2rem',
    cursor: 'pointer'
  },
  search: {
    fontSize: '1.2rem',
    cursor: 'pointer'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    overflow: 'hidden'
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3B82F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '1.1rem'
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
    marginBottom: '2rem',
    lineHeight: '1.3'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#6B7280',
    marginBottom: '3rem',
    lineHeight: '1.6'
  },
  candidateName: {
    color: '#60A5FA',
    fontWeight: '500'
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '3rem'
  },
  payButton: {
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    minWidth: '120px'
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
  },
  offer: {
    textAlign: 'center'
  },
  offerText: {
    fontSize: '1.2rem',
    lineHeight: '1.5'
  },
  specialOffer: {
    color: '#60A5FA'
  },
  unlockText: {
    color: '#8B5CF6'
  },
  payText: {
    color: '#8B5CF6'
  }
};

export default UnlockPrompt;