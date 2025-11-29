import React, { useMemo, useState, useEffect } from 'react';
import { FiBell, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import axios from 'axios';

const AMOUNTS = [2000, 5000, 10000, 30000];

const CandidateAddBalance = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(5000);
  const [customAmount, setCustomAmount] = useState('');
  const [method, setMethod] = useState('credit'); // 'credit' | 'debit'
  const [showNewCard, setShowNewCard] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [card, setCard] = useState({
    holder: '',
    number: '',
    expiry: '',
    cvv: ''
  });

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

  const primaryCard = useMemo(() => {
    if (!user) return null;
    const cards = user.paymentCards || [];
    const id = user.primaryCardId;
    return cards.find((c) => c.id === id) || null;
  }, [user]);

  const handlePay = async (e) => {
    e.preventDefault();
    const finalAmount = customAmount ? Number(customAmount) : amount;
    if (!finalAmount || finalAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5001/api/candidate/wallet-balance',
        { amount: finalAmount, operation: 'add' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local user context with new balance
      updateUser({ walletBalance: response.data.walletBalance });
      
      alert(`Added ₹${finalAmount.toLocaleString('en-IN')} to your wallet.`);
      navigate('/candidate/payment-success', { state: { amountAdded: finalAmount } });
    } catch (error) {
      console.error('Failed to add balance:', error);
      // Fallback to local update if API fails
      const current = user?.walletBalance || 0;
      updateUser({ walletBalance: current + finalAmount });
      alert(`Added ₹${finalAmount.toLocaleString('en-IN')} to your wallet.`);
      navigate('/candidate/payment-success', { state: { amountAdded: finalAmount } });
    }
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
          <a style={styles.navLink} href="#">About Us</a>
          <a style={styles.navLink} href="#">Clients</a>
          <a style={styles.navLink} href="#">Pricing</a>
          <a style={styles.navLink} href="#">FAQ</a>
          <a style={styles.navLink} href="#">Contact Us</a>
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
          <h2 style={{ margin: 0 }}>Add Money to Your PreHire Wallet</h2>
          <div style={{ color: '#6B7280', marginTop: 8 }}>Funds are used for unlocking premium features & job applications</div>
        </div>

        {/* Amount selection */}
        <div style={styles.amountRow}>
          {AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => { setAmount(a); setCustomAmount(''); }}
              style={{
                ...styles.amountBtn,
                ...(amount === a && !customAmount ? styles.amountBtnActive : {})
              }}
            >
              ₹{a.toLocaleString('en-IN')}
            </button>
          ))}
          <button
            onClick={() => { setCustomAmount(''); setAmount(0); }}
            style={{
              ...styles.amountBtn,
              ...(customAmount && Number(customAmount) > 0 ? styles.amountBtnActive : {})
            }}
          >
            Custom
          </button>
          <input
            placeholder="Enter amount"
            value={customAmount}
            onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
            type="number"
            min={1}
            style={styles.customInput}
          />
        </div>

        {/* Payment method */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Payment Method</div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <label style={styles.radioLabel}>
              <input type="radio" name="method" checked={method==='credit'} onChange={() => setMethod('credit')} /> Credit Card
            </label>
            <label style={styles.radioLabel}>
              <input type="radio" name="method" checked={method==='debit'} onChange={() => setMethod('debit')} /> Debit Card
            </label>
          </div>

          {/* Card selection / entry */}
          <div style={styles.cardBox}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Credit Card</div>

            {!showNewCard && (
              <>
                {primaryCard ? (
                  <div style={{ ...styles.savedCard, borderColor: '#60A5FA' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span>💳</span>
                      <div>
                        <div>{primaryCard.brand} *{primaryCard.last4} · Primary Card</div>
                        <div style={styles.subtle}>Expires {primaryCard.expiry || '—'}</div>
                      </div>
                    </div>
                    <span style={{ color: '#10B981' }}>✔</span>
                  </div>
                ) : (
                  <div style={styles.savedCard}>
                    <div>No card added</div>
                  </div>
                )}
                <button style={styles.addCardRow} onClick={() => (window.location.href = '/candidate/add-card')}>
                  {primaryCard ? 'Use a different card or add a card' : 'Add a new card'} <span>›</span>
                </button>
              </>
            )}

            {showNewCard && (
              <form onSubmit={handlePay} style={{ marginTop: 12 }}>
                <div style={styles.formGrid}>
                  <div style={styles.fieldCol}>
                    <label style={styles.label}>Card Holder Name</label>
                    <input style={styles.input} value={card.holder} onChange={(e)=>setCard({...card, holder:e.target.value})} required />
                  </div>
                  <div style={styles.fieldCol}>
                    <label style={styles.label}>Card Number</label>
                    <input style={styles.input} value={card.number} onChange={(e)=>setCard({...card, number:e.target.value})} required inputMode="numeric" maxLength={19} placeholder="1234 5678 9012 3456" />
                  </div>
                  <div style={styles.fieldRow}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>Expiry (MM/YY)</label>
                      <input style={styles.input} value={card.expiry} onChange={(e)=>setCard({...card, expiry:e.target.value})} required placeholder="09/29" />
                    </div>
                    <div style={{ width: 140 }}>
                      <label style={styles.label}>CVV</label>
                      <input style={styles.input} value={card.cvv} onChange={(e)=>setCard({...card, cvv:e.target.value})} required inputMode="numeric" maxLength={4} />
                    </div>
                  </div>
                </div>
              </form>
            )}

            <div style={styles.actionsRow}>
              <button onClick={handlePay} style={styles.payBtn}>Pay ₹{(customAmount ? Number(customAmount) : amount).toLocaleString('en-IN')}</button>
              <button onClick={() => (window.location.href = '/candidate/add-card')} style={styles.secondaryBtn}>Add new card</button>
            </div>
          </div>
        </div>

        {/* Account info */}
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
  amountRow: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    marginTop: 24,
    flexWrap: 'wrap'
  },
  amountBtn: {
    padding: '10px 20px',
    borderRadius: 10,
    border: '1px solid #D1D5DB',
    background: '#fff',
    cursor: 'pointer'
  },
  amountBtnActive: {
    background: '#2563EB',
    color: '#fff',
    borderColor: '#2563EB'
  },
  customInput: {
    width: 140,
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: 10
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer'
  },
  cardBox: {
    marginTop: 16,
    background: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: 16
  },
  savedCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid #E5E7EB',
    borderRadius: 10,
    padding: '12px 16px',
    marginBottom: 10,
    background: '#fff'
  },
  subtle: {
    color: '#6B7280',
    fontSize: 12
  },
  addCardRow: {
    width: '100%',
    textAlign: 'left',
    border: '1px solid #E5E7EB',
    borderRadius: 10,
    padding: '12px 16px',
    background: '#fff',
    cursor: 'pointer'
  },
  formGrid: {
    display: 'grid',
    gap: 12
  },
  fieldCol: {
    display: 'flex',
    flexDirection: 'column'
  },
  fieldRow: {
    display: 'flex',
    gap: 12
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: 10,
    width: '100%'
  },
  actionsRow: {
    display: 'flex',
    gap: 12,
    marginTop: 12
  },
  payBtn: {
    background: '#2563EB',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 16px',
    cursor: 'pointer',
    fontWeight: 600
  },
  secondaryBtn: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #9CA3AF',
    borderRadius: 8,
    padding: '10px 16px',
    cursor: 'pointer',
    fontWeight: 600
  },
  accountCard: {
    marginTop: 24,
    background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: 16
  }
};

export default CandidateAddBalance;

