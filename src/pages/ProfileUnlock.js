import React, { useState } from 'react';
import { FiBell, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const ProfileUnlock = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    cardNumber: '',
    expirationDate: '',
    securityCode: '',
    country: '',
    postalCode: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddCard = () => {
    navigate('/payment-success');
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
            Smart picks! Time to unlock your winning team
          </h1>

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

          <div style={styles.offer}>
            <span style={styles.specialOffer}>Special offer:</span>{' '}
            <span style={styles.unlockText}>Unlock 5 profiles,</span>{' '}
            <span style={styles.payText}>pay for only 4!</span>
          </div>

          <div style={styles.paymentCard}>
            <div style={styles.paymentHeader}>
              <span style={styles.paymentTitle}>Credit/Debit card</span>
              <div style={styles.paymentLogos}>
                <span style={styles.mastercard}>●●</span>
                <span style={styles.rupay}>RuPay</span>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>First Name*</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name*</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Credit or debit card number*</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Expiration date*</label>
                <input
                  type="text"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Security code*</label>
                <input
                  type="text"
                  name="securityCode"
                  value={formData.securityCode}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                style={styles.select}
              >
                <option value="">Select Country</option>
                <option value="IN">India</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Postal Code*</label>
              <select
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                style={styles.select}
              >
                <option value="">Select Postal Code</option>
                <option value="110001">110001</option>
                <option value="400001">400001</option>
                <option value="560001">560001</option>
              </select>
            </div>

            <button onClick={handleAddCard} style={styles.addCardButton}>
              Add Card
            </button>

            <div style={styles.disclaimer}>
              By clicking "Add card" you are consenting to PreHire managing your card details in accordance with the Reserve Bank of India regulations.{' '}
              <a href="#" style={styles.learnMore}>Learn More</a>
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
    padding: '2rem'
  },
  content: {
    maxWidth: '600px',
    width: '100%'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '2rem',
    textAlign: 'center'
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem'
  },
  summaryRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem'
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
    fontSize: '0.9rem',
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: '1rem'
  },
  value: {
    fontSize: '0.9rem',
    color: '#1F2937',
    fontWeight: '600'
  },
  offer: {
    textAlign: 'center',
    marginBottom: '2rem',
    fontSize: '1.1rem'
  },
  specialOffer: {
    color: '#60A5FA'
  },
  unlockText: {
    color: '#8B5CF6'
  },
  payText: {
    color: '#8B5CF6'
  },
  paymentCard: {
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '2rem'
  },
  paymentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  paymentTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1F2937'
  },
  paymentLogos: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  mastercard: {
    color: '#EB001B',
    fontSize: '1.2rem'
  },
  rupay: {
    color: '#0066CC',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  formRow: {
    display: 'flex',
    gap: '1rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '0.9rem',
    backgroundColor: '#F9FAFB'
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '0.9rem',
    backgroundColor: '#F9FAFB'
  },
  addCardButton: {
    width: '100%',
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '1rem'
  },
  disclaimer: {
    fontSize: '0.8rem',
    color: '#6B7280',
    lineHeight: '1.4'
  },
  learnMore: {
    color: '#3B82F6',
    textDecoration: 'none'
  }
};

export default ProfileUnlock;