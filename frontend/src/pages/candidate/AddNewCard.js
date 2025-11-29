import React, { useEffect, useState } from 'react';
import { FaCcVisa, FaCcMastercard, FaCreditCard } from 'react-icons/fa';
import { FiBell, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

const CandidateAddNewCard = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    number: '',
    expiry: '',
    cvv: '',
    country: 'India',
    postalCode: ''
  });
  const [saving, setSaving] = useState(false);
  const [isNarrow, setIsNarrow] = useState(typeof window !== 'undefined' ? window.innerWidth < 640 : false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => {
      setIsNarrow(window.innerWidth < 640);
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    const id = 'card_' + Date.now();
    const masked = form.number.replace(/\s+/g, '').slice(-4);
    const newCard = {
      id,
      brand: form.number.startsWith('4') ? 'Visa' : form.number.startsWith('5') ? 'MasterCard' : 'Card',
      last4: masked,
      holder: form.firstName + ' ' + form.lastName,
      expiry: form.expiry,
      country: form.country,
      postalCode: form.postalCode
    };

    const existing = user?.paymentCards || [];
    const nextCards = [newCard, ...existing];
    const primaryCardId = user?.primaryCardId || id; // Set as primary if none
    updateUser({ paymentCards: nextCards, primaryCardId });
    setSaving(false);
    navigate('/candidate/add-balance');
  };

  return (
    <div style={styles.container}>
      <header style={{
        ...styles.header,
        padding: isMobile ? '12px 16px' : '16px 32px'
      }}>
        <div style={styles.brand}>PreHire</div>
        
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
              <div style={styles.avatarFallback}>{user?.name?.[0] || 'U'}</div>
            )}
          </div>
        </div>
      </header>

      <main style={{
        ...styles.main,
        padding: isMobile ? 16 : 24,
        paddingTop: isMobile ? 80 : 88
      }}>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <h2 style={{ margin: 0 }}>Add Card</h2>
          <div style={{ color: '#6B7280', marginTop: 8 }}>Funds are used for unlocking premium features & job applications</div>
        </div>

        <form onSubmit={handleSave} style={styles.formShell}>
          <div style={styles.cardHeaderRow}>
            <div style={styles.cardHeaderTitle}>Credit/Debit card</div>
            <div style={styles.networks}>
              <FaCcMastercard size={28} color="#eb001b" title="Mastercard" />
              <FaCcVisa size={28} color="#1a1f71" title="Visa" />
              <FaCreditCard size={28} color="#0EA5E9" title="RuPay" />
            </div>
          </div>

          <div style={{ ...styles.grid2col, gridTemplateColumns: isNarrow ? '1fr' : '1fr 1fr' }}>
            <div style={styles.fieldCol}>
              <label style={styles.label}>First Name*</label>
              <input name="firstName" value={form.firstName} onChange={onChange} style={styles.input} required />
            </div>
            <div style={styles.fieldCol}>
              <label style={styles.label}>Last Name*</label>
              <input name="lastName" value={form.lastName} onChange={onChange} style={styles.input} required />
            </div>
          </div>

          <div style={styles.fieldCol}>
            <label style={styles.label}>Credit or debit card number*</label>
            <input name="number" value={form.number} onChange={onChange} style={styles.input} required inputMode="numeric" maxLength={19} placeholder="1234 5678 9012 3456" />
          </div>

          <div style={{ ...styles.grid2col, gridTemplateColumns: isNarrow ? '1fr' : '1fr 1fr' }}>
            <div style={styles.fieldCol}>
              <label style={styles.label}>Expiration date*</label>
              <input name="expiry" value={form.expiry} onChange={onChange} style={styles.input} required placeholder="MM/YY" />
            </div>
            <div style={styles.fieldCol}>
              <label style={styles.label}>Security code*</label>
              <input name="cvv" value={form.cvv} onChange={onChange} style={styles.input} required inputMode="numeric" maxLength={4} />
            </div>
          </div>

          <div style={{ ...styles.grid2col, gridTemplateColumns: isNarrow ? '1fr' : '1fr 1fr' }}>
            <div style={styles.fieldCol}>
              <label style={styles.label}>Country</label>
              <select name="country" value={form.country} onChange={onChange} style={styles.select}>
                <option>India</option>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Singapore</option>
              </select>
            </div>
            <div style={styles.fieldCol}>
              <label style={styles.label}>Postal Code*</label>
              <input name="postalCode" value={form.postalCode} onChange={onChange} style={styles.input} required />
            </div>
          </div>

          <button type="submit" disabled={saving} style={styles.primaryBtn}>{saving ? 'Saving...' : 'Add & Save Card'}</button>
          <button type="button" onClick={() => navigate(-1)} style={styles.secondaryBtn}>Cancel</button>

          <div style={styles.disclaimer}>By clicking "Add card" you are consenting to PreHire managing your card details in accordance with the Reserve Bank of India regulations. <a href="#" style={{ color: '#2563EB', textDecoration: 'none' }}>Learn More</a></div>
        </form>

        <div style={styles.accountCard}>
          <div style={{ fontWeight: 700 }}>Account Information</div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>💳</span>
            <span>Balance : ₹ {(user?.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
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
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    height: 64
  },
  brand: {
    fontSize: 22,
    fontWeight: 700,
    color: '#7C3AED'
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
    fontWeight: 600
  },
  main: {
    padding: 24
  },
  formShell: {
    marginTop: 24,
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: 20,
    width: 'min(680px, 92%)',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
  },
  cardHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827'
  },
  networks: {
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  grid2col: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12
  },
  fieldCol: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 10
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: 8,
    width: '100%',
    background: '#F9FAFB',
    fontSize: 14,
    boxSizing: 'border-box'
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: 8,
    width: '100%',
    background: '#F9FAFB',
    fontSize: 14,
    boxSizing: 'border-box'
  },
  primaryBtn: {
    width: '100%',
    background: '#3B82F6',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px 16px',
    cursor: 'pointer',
    fontWeight: 600,
    marginTop: 6
  },
  secondaryBtn: {
    width: '100%',
    background: '#fff',
    color: '#111827',
    border: '1px solid #9CA3AF',
    borderRadius: 8,
    padding: '12px 16px',
    cursor: 'pointer',
    fontWeight: 600,
    marginTop: 10
  },
  disclaimer: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 12
  },
  accountCard: {
    marginTop: 24,
    background: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: 16,
    width: 'min(760px, 92%)',
    marginLeft: 'auto',
    marginRight: 'auto'
  }
};

export default CandidateAddNewCard;

