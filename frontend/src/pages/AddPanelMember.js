import React, { useEffect, useState } from 'react';
import { FiBell, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';
import { API_ENDPOINTS } from '../utils/apiClient';

const AddPanelMember = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [form, setForm] = useState({
    name: '',
    email: '',
    designation: '',
    role: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login again.');
        setSubmitting(false);
        return;
      }

      const response = await axios.post(
        API_ENDPOINTS.RECRUITER.PANEL_MEMBERS,
        {
          name: form.name.trim(),
          email: form.email.trim(),
          designation: form.designation.trim(),
          role: form.role
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update user context so dashboard reflects immediately
      if (response.data && Array.isArray(response.data)) {
        updateUser({ panelMembers: response.data });
      }

      // Navigate to confirmation page with member name
      navigate('/recruiter/panel-member-confirmation', {
        state: { memberName: form.name.trim() }
      });
    } catch (err) {
      console.error('Error adding panel member:', err);
      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        'Failed to add panel member. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
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
        <form style={styles.card} onSubmit={handleSubmit}>
          <div style={styles.cardTitle}>Add Panel Members</div>
          <div style={styles.cardSubtitle}>Invite colleagues to join your interview panel.</div>

          <div style={{
            ...styles.formGrid,
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr'
          }}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name*</label>
              <input
                style={styles.input}
                type="text"
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Company Mail*</label>
              <input
                style={styles.input}
                type="email"
                name="email"
                placeholder="Enter company email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Designation*</label>
              <input
                style={styles.input}
                type="text"
                name="designation"
                placeholder="Enter designation"
                value={form.designation}
                onChange={handleChange}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Role*</label>
              <select
                style={{ ...styles.input, ...styles.select }}
                name="role"
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select role</option>
                <option>Interviewer</option>
                <option>Hiring Manager</option>
                <option>Recruiter</option>
                <option>Panel Member</option>
              </select>
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add'}
          </button>
          <button
            type="button"
            style={styles.backBtn}
            onClick={() => navigate('/recruiter')}
          >
            Back to Dashboard
          </button>
        </form>
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
    justifyContent: 'center'
  },
  card: {
    width: '100%',
    maxWidth: 900,
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: 32,
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: 24
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#111827',
    textAlign: 'center'
  },
  cardSubtitle: {
    color: '#6B7280',
    textAlign: 'center'
  },
  formGrid: {
    display: 'grid',
    gap: 20
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  label: {
    fontWeight: 600,
    color: '#374151'
  },
  input: {
    border: '1px solid #E5E7EB',
    background: '#F5F6F7',
    borderRadius: 8,
    padding: '12px 14px',
    fontSize: 14,
    color: '#111827',
    outline: 'none'
  },
  select: {
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage:
      'linear-gradient(45deg, transparent 50%, #9CA3AF 50%), linear-gradient(135deg, #9CA3AF 50%, transparent 50%), linear-gradient(to right, #E5E7EB, #E5E7EB)',
    backgroundPosition: 'calc(100% - 18px) calc(50% - 2px), calc(100% - 12px) calc(50% - 2px), calc(100% - 42px) 50%',
    backgroundSize: '6px 6px, 6px 6px, 1px 20px',
    backgroundRepeat: 'no-repeat'
  },
  submitBtn: {
    marginTop: 8,
    background: '#3BA7F5',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px',
    fontWeight: 700,
    fontSize: 16,
    cursor: 'pointer'
  },
  error: {
    background: '#FEF2F2',
    color: '#B91C1C',
    border: '1px solid #FECACA',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14
  },
  backBtn: {
    background: '#F3F4F6',
    color: '#374151',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    padding: '12px',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer'
  }
};

export default AddPanelMember;
