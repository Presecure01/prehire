
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { API_ENDPOINTS, getApiUrl } from '../utils/apiClient';
import NotificationBell from '../components/NotificationBell';

const CandidateDashboardNew = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    photo: '',
    linkedIn: '',
    location: '',
    currentRole: '',
    experience: '',
    skills: [],
    education: '',
    resumeScore: 0,
    scoreBreakdown: null,
    experienceYears: 0,
    walletBalance: 0
  });
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchProfile();
  }, []);

  // Refresh profile when user context changes (e.g., after balance update)
  useEffect(() => {
    if (user?.walletBalance !== undefined && profile.walletBalance !== user.walletBalance) {
      setProfile(prev => ({ ...prev, walletBalance: user.walletBalance }));
    }
  }, [user?.walletBalance]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);



  const handleLogout = () => {
    logout();
    navigate('/candidate/login');
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_ENDPOINTS.CANDIDATE.PROFILE, {
        headers: { Authorization: `Bearer ${token} ` }
      });
      console.log('Fetched profile data:', response.data);
      const profileData = response.data;
      setProfile(profileData);

      // Update user context with latest walletBalance from backend
      if (profileData.walletBalance !== undefined) {
        updateUser({ walletBalance: profileData.walletBalance });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Use user context as fallback if API fails
      if (user?.walletBalance !== undefined) {
        setProfile(prev => ({
          ...prev,
          walletBalance: user.walletBalance || 0
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const CalendarCell = ({ day, active }) => (
    <div style={{
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      background: active ? '#E8F0FF' : 'transparent',
      color: '#111827',
      fontWeight: active ? 600 : 500,
      fontSize: 14
    }}>
      {day}
    </div>
  );

  const companiesShortlisted = [
    { name: 'Amazon', role: 'UX Designer' },
    { name: 'IBM', role: 'Web Developer' },
    { name: 'Infosys', role: 'Software Developer' },
    { name: 'Deloitte', role: 'Web Developer' },
    { name: 'Microsoft', role: 'Software Developer' },
    { name: 'Amdocs', role: 'Web Developer' }
  ];

  const hiringManagers = [
    { name: 'Himanshu S.', company: 'IMB' },
    { name: 'Sahil M.', company: 'Amdocs' },
    { name: 'Sanya Shah', company: 'Infosys' }
  ];

  if (loading) return <div style={styles.loading}>Loading...</div>;

  const displayName = profile?.name || user?.name || 'User';
  const firstName = displayName.split(' ')[0];

  return (
    <div style={styles.container}>
      <header style={{
        ...styles.header,
        padding: isMobile ? '12px 16px' : '16px 32px'
      }}>
        <div style={styles.brand}>PreHire</div>

        {/* Desktop Navigation */}
        <nav style={{ ...styles.nav, display: isMobile ? 'none' : 'flex' }}>
          <a style={styles.navLink} href="#">About Us</a>
          <a style={styles.navLink} href="#">Clients</a>
          <a style={styles.navLink} href="#">Pricing</a>
          <a style={styles.navLink} href="#">FAQ</a>
          <a style={styles.navLink} href="#">Contact Us</a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          style={{ ...styles.mobileMenuBtn, display: isMobile ? 'block' : 'none' }}
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
          <div style={{ position: 'relative', marginRight: '12px' }}>
            <NotificationBell />
          </div>

          <FiSearch style={styles.icon} size={20} color="#374151" />
          <div style={{ position: 'relative' }} ref={profileMenuRef}>
            <div
              style={styles.avatar}
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setProfileMenuOpen(!profileMenuOpen);
                }
              }}
            >
              {profile?.photo && profile.photo.trim() ? (
                <img
                  src={profile.photo.startsWith('http') ? profile.photo : getApiUrl(profile.photo)}
                  alt="avatar"
                  style={styles.avatarImg}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div style={{
                ...styles.avatarFallback,
                display: (profile?.photo && profile.photo.trim()) ? 'none' : 'flex'
              }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div >
            {profileMenuOpen && (
              <div style={styles.profileDropdown}>
                <div style={styles.profileDropdownHeader}>
                  <div style={styles.profileDropdownName}>{displayName}</div>
                  <div style={styles.profileDropdownEmail}>{profile?.email || user?.email || ''}</div>
                </div>
                <div style={styles.profileDropdownDivider}></div>

                <button
                  style={styles.profileDropdownItem}
                  onClick={() => navigate('/candidate/edit-profile')}
                >
                  Edit user profile
                </button>

                <button
                  style={styles.profileDropdownItem}
                  onClick={handleLogout}
                  onMouseEnter={(e) => e.target.style.background = '#F9FAFB'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  <FiLogOut style={{ marginRight: 8 }} />
                  Logout
                </button>
              </div>
            )}
          </div >
        </div >
      </header >

      {/* notification is now a popup from the bell button (not a sticky banner) */}

      <main style={{
        ...styles.main,
        padding: isMobile ? 16 : 24,
        // fixed top padding to account for fixed header (notification is a popup)
        paddingTop: isMobile ? 80 : 88
      }}>
        <div style={{
          ...styles.gridTop,
          gridTemplateColumns: isMobile
            ? '1fr'
            : window.innerWidth <= 1024
              ? '1fr 1fr'
              : '1.2fr 1fr 0.7fr',
          gridTemplateRows: !isMobile && window.innerWidth <= 1024 ? 'auto auto' : 'auto',
          gap: isMobile ? 12 : 16
        }}>
          {/* Welcome Card */}
          <div style={{
            ...styles.welcomeCard,
            gridColumn: !isMobile && window.innerWidth <= 1024 ? '1 / -1' : 'auto'
          }}>
            <div>
              <div style={styles.welcomeTitle}>Welcome back, {firstName}!</div>
              <div style={styles.welcomeSub}>Ready to get hired smarter?</div>
            </div>
            <div style={styles.chip}>
              <span style={styles.chipNum}>20</span>
              <span>Companies Shortlisted</span>
            </div>
          </div>

          {/* Upcoming Schedule Card */}
          <div style={styles.calendarCard}>
            <div style={styles.cardHeaderRow}>
              <div style={styles.cardTitle}>Upcoming Schedule</div>
              <a href="#" style={styles.linkSm}>See all</a>
            </div>
            <div style={styles.calendarHeaderRow}>
              <button style={styles.calendarNavBtn}>‹</button>
              <div style={styles.calendarHeader}>Aug 2025</div>
              <button style={styles.calendarNavBtn}>›</button>
            </div>
            <div style={styles.calendarDaysRow}>S M T W T F S</div>
            <div style={styles.calendarGrid}>
              {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((d) => (
                <CalendarCell key={d} day={d} active={[2, 6, 11, 13, 17, 20, 24, 27].includes(d)} />
              ))}
            </div>
          </div>

          {/* Applied Jobs Card */}
          <div style={styles.appliedJobsCard}>
            <div style={styles.cardTitle}>Applied Jobs</div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryIcon}>✔️</div>
              <div>
                <div style={styles.summaryNum}>39</div>
                <div style={styles.summaryLabel}>Completed</div>
              </div>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryIcon}>🕒</div>
              <div>
                <div style={styles.summaryNum}>16</div>
                <div style={styles.summaryLabel}>Pending</div>
              </div>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryIcon}>⭐</div>
              <div>
                <div style={styles.summaryNum}>3</div>
                <div style={styles.summaryLabel}>Pending Feedback</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          ...styles.gridBottom,
          gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr',
          gap: isMobile ? 12 : 16
        }}>
          {/* Companies Shortlisted Card */}
          <div style={styles.companiesCard}>
            <div style={styles.cardHeaderRow}>
              <div style={styles.cardTitle}>Companies Shortlisted</div>
              <a href="#" style={styles.linkSm}>See all</a>
            </div>
            <div>
              {companiesShortlisted.map((company, i) => (
                <div key={i} style={styles.companyRow}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span>{i + 1}. {company.name}</span>
                    <span style={{ color: '#6B7280' }}>- {company.role}</span>
                  </div>
                  <a href="#" style={styles.linkXS}>View profile</a>
                </div>
              ))}
            </div>
          </div>

          {/* Hiring Managers Card */}
          <div style={styles.hiringManagersCard}>
            <div style={styles.cardHeaderRow}>
              <div style={styles.cardTitle}>Hiring Managers</div>
              <button style={styles.addMoreBtn}>Add More +</button>
            </div>
            <div>
              {hiringManagers.map((manager, i) => (
                <div key={i} style={styles.managerRow}>
                  <span>{i + 1}. {manager.name}</span>
                  <span style={{ color: '#6B7280' }}>- {manager.company}</span>
                  <a href="#" style={styles.linkXS}>Contact</a>
                </div>
              ))}
            </div>
          </div>

          {/* Account Information Card */}
          <div style={{
            ...styles.accountCard,
            gridColumn: isMobile ? 'auto' : '1 / -1'
          }}>
            <div style={styles.cardTitle}>Account Information</div>
            <div style={styles.accountRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>💳</span>
                <span>Balance : ₹ {(profile?.walletBalance !== undefined ? profile.walletBalance : (user?.walletBalance || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <button onClick={() => window.location.href = '/candidate/add-balance'} style={styles.addBalanceBtn}>Add Balance +</button>
            </div>
          </div>
        </div>
      </main >
    </div >
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
  bellBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
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
  notificationPopup: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: 320,
    maxWidth: '90vw',
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    boxShadow: '0 10px 20px rgba(2,6,23,0.2)',
    zIndex: 1200,
    overflow: 'hidden'
  },
  notificationPopupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderBottom: '1px solid #F3F4F6'
  },
  notificationPopupBody: {
    padding: 12
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#E5E7EB',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    border: '2px solid transparent'
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
  profileDropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    minWidth: 200,
    zIndex: 1000,
    overflow: 'hidden'
  },
  profileDropdownHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid #F3F4F6'
  },
  profileDropdownName: {
    fontWeight: 600,
    color: '#111827',
    fontSize: 14,
    marginBottom: 4
  },
  profileDropdownEmail: {
    color: '#6B7280',
    fontSize: 12
  },
  profileDropdownDivider: {
    height: 1,
    background: '#F3F4F6'
  },
  profileDropdownItem: {
    width: '100%',
    padding: '12px 16px',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    color: '#374151',
    fontSize: 14,
    transition: 'background 0.2s'
  },
  notificationBanner: {
    position: 'fixed',
    top: 64,
    left: 0,
    right: 0,
    background: '#F3F4F6',
    borderBottom: '1px solid #E5E7EB',
    padding: '12px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 999,
    fontSize: 14,
    color: '#374151',
    borderRadius: '0 0 8px 8px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6B7280',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  main: {
    padding: 24
  },
  gridTop: {
    display: 'grid',
    gap: 16,
    alignItems: 'stretch',
    marginBottom: 16
  },
  gridBottom: {
    display: 'grid',
    gap: 16
  },
  welcomeCard: {
    borderRadius: 12,
    padding: 24,
    background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#111827'
  },
  welcomeSub: {
    marginTop: 6,
    color: '#6B7280',
    fontWeight: 500
  },
  chip: {
    marginTop: 20,
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    color: '#374151',
    padding: '10px 14px',
    borderRadius: 22,
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  chipNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    background: '#2563EB',
    color: '#fff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14
  },
  calendarCard: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: 20
  },
  cardHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  cardTitle: {
    fontWeight: 700,
    color: '#111827',
    fontSize: 16
  },
  linkSm: {
    color: '#2563EB',
    textDecoration: 'none',
    fontSize: 14
  },
  calendarHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 10
  },
  calendarNavBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 18,
    color: '#6B7280',
    padding: '4px 8px'
  },
  calendarHeader: {
    color: '#374151',
    fontWeight: 500,
    fontSize: 14
  },
  calendarDaysRow: {
    color: '#9CA3AF',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 8,
    maxWidth: '100%'
  },
  appliedJobsCard: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  summaryIcon: {
    fontSize: 18
  },
  summaryNum: {
    fontWeight: 700,
    color: '#2563EB',
    fontSize: 18
  },
  summaryLabel: {
    color: '#6B7280',
    fontSize: 14
  },
  companiesCard: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: 20
  },
  companyRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #F3F4F6'
  },
  linkXS: {
    color: '#2563EB',
    textDecoration: 'none',
    fontSize: 14
  },
  hiringManagersCard: {
    background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: 20
  },
  managerRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr auto',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #EEF2FF',
    gap: 8
  },
  addMoreBtn: {
    background: '#6366F1',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14
  },
  accountCard: {
    background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: 20
  },
  accountRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12
  },
  addBalanceBtn: {
    background: '#6366F1',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem'
  }
};

export default CandidateDashboardNew;
