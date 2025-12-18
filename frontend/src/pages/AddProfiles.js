import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiBell,
  FiSearch,
  FiMenu,
  FiX,
  FiMapPin,
  FiClock,
  FiPhone,
  FiBookmark,
  FiChevronDown,
  FiLogOut,
  FiCheck
} from 'react-icons/fi';
import { useAuth } from '../utils/AuthContext';
import './AddProfiles.css';

const defaultFilters = {
  search: '',
  experience: 'all',
  location: 'all',
  education: 'all',
  availability: 'all',
  sortBy: 'relevance'
};

const experienceOptions = [
  { value: 'all', label: 'Any experience' },
  { value: '0-2', label: '0-2 years' },
  { value: '2-4', label: '2-4 years' },
  { value: '3', label: '3 years' },
  { value: '4-6', label: '4-6 years' },
  { value: '6+', label: '6+ years' }
];

const locationOptions = ['all', 'Jaipur', 'Pune', 'Bengaluru', 'Hyderabad'];
const educationOptions = ['all', 'B.Tech', 'B.Sc Computer Science', 'M.Tech'];
const availabilityOptions = ['all', '7', '15', '30'];

const AddProfiles = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const profileMenuRef = useRef(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [profiles, setProfiles] = useState([]);
  const [shortlistIds, setShortlistIds] = useState(user?.shortlistedProfiles || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
      if (window.innerWidth > 900) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProfiles = async (overrides = {}) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = { ...filters, ...overrides };
      const { data } = await axios.get('http://localhost:5001/api/recruiter/shortlisted-profiles', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfiles(data.profiles || []);
      setShortlistIds(data.shortlistIds || []);
      updateUser({ shortlistedProfiles: data.shortlistIds || [] });
      setError('');
    } catch (err) {
      console.error('Shortlisted profiles load failed:', err?.message || err);
      setError('Unable to load shortlisted profiles right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchProfiles();
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    fetchProfiles(defaultFilters);
  };

  const toggleShortlist = async (profileId) => {
    try {
      const token = localStorage.getItem('token');
      const action = shortlistIds.includes(profileId) ? 'remove' : 'add';
      const { data } = await axios.post(
        `http://localhost:5001/api/recruiter/shortlisted-profiles/${profileId}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedShortlist = data.shortlist || [];
      setShortlistIds(updatedShortlist);
      updateUser({ shortlistedProfiles: updatedShortlist });
      setProfiles((prev) =>
        prev.map((profile) =>
          profile.id === profileId
            ? { ...profile, isShortlisted: updatedShortlist.includes(profileId) }
            : profile
        )
      );
    } catch (err) {
      console.error('Shortlist update failed:', err?.message || err);
      setError('Unable to update shortlist. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/employer/login');
  };

  const handleSchedule = (profile) => {
    window.alert(`Interview request sent to ${profile.name}`);
  };

  const handleResume = (profile) => {
    if (profile.resumeUrl) {
      window.open(profile.resumeUrl, '_blank');
    } else {
      setError('Resume not available for this profile.');
    }
  };

  const renderHeader = () => (
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

      <button
        style={{ ...styles.mobileMenuBtn, display: isMobile ? 'block' : 'none' }}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation"
      >
        {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {mobileMenuOpen && (
        <div style={styles.mobileMenu}>
          <a style={styles.mobileNavLink} href="#" onClick={() => setMobileMenuOpen(false)}>About Us</a>
          <a style={styles.mobileNavLink} href="#" onClick={() => setMobileMenuOpen(false)}>Clients</a>
          <a style={styles.mobileNavLink} href="#" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          <a style={styles.mobileNavLink} href="#" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
          <a style={styles.mobileNavLink} href="#" onClick={() => setMobileMenuOpen(false)}>Contact Us</a>
        </div>
      )}

      <div style={styles.rightHeader}>
        <FiBell style={styles.icon} size={20} color="#374151" />
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
            {user?.photo ? (
              <img src={user.photo} alt="avatar" style={styles.avatarImg} />
            ) : (
              <div style={styles.avatarFallback}>{user?.name?.[0] || 'R'}</div>
            )}
          </div>
          {profileMenuOpen && (
            <div style={styles.profileDropdown}>
              <div style={styles.profileDropdownHeader}>
                <div style={styles.profileDropdownName}>{user?.name || 'Recruiter'}</div>
                <div style={styles.profileDropdownEmail}>{user?.email || ''}</div>
              </div>
              <div style={styles.profileDropdownDivider}></div>
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
        </div>
      </div>
    </header>
  );

  return (
    <div className="ap-page">
      {renderHeader()}
      <main className="ap-main">
        <div className="ap-content">
          <aside className="ap-filters">
            <div className="ap-filters-title">Filters</div>
            <label className="ap-field">
              <span>Keyword</span>
              <input
                type="text"
                placeholder=""
                value={filters.search}
                onChange={(e) => handleInput('search', e.target.value)}
              />
            </label>
            <label className="ap-field">
              <span>Experience</span>
              <div className="ap-select">
                <select
                  value={filters.experience}
                  onChange={(e) => handleInput('experience', e.target.value)}
                >
                  {experienceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="ap-select-icon" />
              </div>
            </label>
            <label className="ap-field">
              <span>Location</span>
              <div className="ap-select">
                <select
                  value={filters.location}
                  onChange={(e) => handleInput('location', e.target.value)}
                >
                  {locationOptions.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc === 'all' ? 'All' : loc}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="ap-select-icon" />
              </div>
            </label>
            <label className="ap-field">
              <span>Highest Education</span>
              <div className="ap-select">
                <select
                  value={filters.education}
                  onChange={(e) => handleInput('education', e.target.value)}
                >
                  {educationOptions.map((edu) => (
                    <option key={edu} value={edu}>
                      {edu === 'all' ? 'Any' : edu}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="ap-select-icon" />
              </div>
            </label>
            <label className="ap-field">
              <span>Availability</span>
              <div className="ap-select">
                <select
                  value={filters.availability}
                  onChange={(e) => handleInput('availability', e.target.value)}
                >
                  {availabilityOptions.map((avail) => (
                    <option key={avail} value={avail}>
                      {avail === 'all' ? 'Any' : `${avail} days`}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="ap-select-icon" />
              </div>
            </label>
            <button className="ap-apply" onClick={handleApplyFilters}>
              Apply
            </button>
            <button className="ap-reset" onClick={handleResetFilters}>
              Reset
            </button>
          </aside>

          <section className="ap-list">
            <div className="ap-list-header">
              <h2>Shortlisted Profiles</h2>
              <div className="ap-sort">
                <span>Sort by</span>
                <div className="ap-select ap-sort-select">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => {
                      handleInput('sortBy', e.target.value);
                      fetchProfiles({ sortBy: e.target.value });
                    }}
                  >
                    <option value="relevance">Most Relevant</option>
                    <option value="experience">Experience</option>
                    <option value="name">Name</option>
                    <option value="location">Location</option>
                  </select>
                  <FiChevronDown className="ap-select-icon" />
                </div>
              </div>
            </div>

            <div className="ap-list-body">
              {error && <div className="ap-error">{error}</div>}
              {loading && <div className="ap-empty">Loading shortlisted profiles...</div>}
              {!loading && profiles.length === 0 && (
                <div className="ap-empty">
                  No profiles match these filters yet.
                </div>
              )}

              {!loading && profiles.map((profile) => (
                <div key={profile.id} className="ap-card">
                  <div className="ap-card-main">
                    <div className="ap-avatar">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt={profile.name} />
                      ) : (
                        <div className="ap-avatar-fallback">{profile.name?.[0] || '?'}</div>
                      )}
                    </div>
                    <div className="ap-card-info">
                      <div className="ap-name">{profile.name}</div>
                      <div className="ap-role">{profile.title}</div>
                      <div className="ap-meta">
                        <span className="ap-meta-item">
                          <FiMapPin />
                          {profile.location}
                        </span>
                        <span className="ap-meta-item">
                          <FiClock />
                          {profile.experienceLabel || `${profile.experienceYears || 0} years`}
                        </span>
                        <span className="ap-meta-item">
                          <FiPhone />
                          {profile.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ap-card-actions">
                    <button className="ap-primary" onClick={() => handleSchedule(profile)}>
                      Schedule Interview
                    </button>
                    <button className="ap-secondary" onClick={() => handleResume(profile)}>
                      View Resume
                    </button>
                    <button
                      className={`ap-bookmark ${profile.isShortlisted ? 'is-active' : ''}`}
                      onClick={() => toggleShortlist(profile.id)}
                      aria-label={profile.isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                      title={profile.isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                    >
                      <FiBookmark />
                      {profile.isShortlisted && <span className="ap-bookmark-badge"><FiCheck size={12} /></span>}
                    </button>
                    {profile.topCandidate && <span className="ap-top-tag">TOP</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const styles = {
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
  }
};

export default AddProfiles;
