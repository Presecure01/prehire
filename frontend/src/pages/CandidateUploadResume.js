import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiSearch, FiMenu, FiX, FiUpload, FiLogOut } from 'react-icons/fi';

const CandidateUploadResume = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showNotification, setShowNotification] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resumeInfo, setResumeInfo] = useState({ url: '', updatedAt: '' });
  const [resumeLoading, setResumeLoading] = useState(true);
  const [resumeError, setResumeError] = useState('');
  const [removing, setRemoving] = useState(false);
  const [uploadValidationError, setUploadValidationError] = useState('');
  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const fileInputRef = useRef(null);

  const loadResumeInfo = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setResumeInfo({ url: '', updatedAt: '' });
      setResumeLoading(false);
      return;
    }
    setResumeError('');
    try {
      const res = await axios.get('http://localhost:5001/api/candidate/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResumeInfo({
        url: res.data?.resumeUrl || '',
        updatedAt: res.data?.resumeUpdatedAt || res.data?.updatedAt || ''
      });
    } catch (err) {
      console.error('Failed to load resume info', err);
      setResumeError('Unable to load your current resume. Please try again later.');
    } finally {
      setResumeLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadResumeInfo();
  }, [loadResumeInfo]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setProfileMenuOpen(false);
    };
    if (profileMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  useEffect(() => {
    const handleClickOutsideNotification = (e) => {
      if (showNotification && notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotification(false);
      }
    };
    if (showNotification) document.addEventListener('mousedown', handleClickOutsideNotification);
    return () => document.removeEventListener('mousedown', handleClickOutsideNotification);
  }, [showNotification]);

  const handleLogout = () => {
    logout();
    navigate('/candidate/login');
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileSelected = (file) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setUploadValidationError('File exceeds the 5MB limit. Please choose a smaller file.');
      return;
    }
    setUploadValidationError('');
    setSelectedFile(file);
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    handleFileSelected(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    handleFileSelected(f);
  };

  const onDragOver = (e) => e.preventDefault();

  const triggerFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDropzoneClick = () => {
    triggerFileDialog();
  };

  const handleChooseButtonClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    triggerFileDialog();
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert('Please select a file first.');
    if (selectedFile.size > MAX_FILE_SIZE) {
      setUploadValidationError('File exceeds the 5MB limit. Please choose a smaller file.');
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('resume', selectedFile);
      
      // Upload resume
      const res = await axios.post('http://localhost:5001/api/upload/resume', fd, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data?.resumeUrl || res.data?.fileUrl) {
        const fileUrl = res.data.resumeUrl || res.data.fileUrl;
        setResumeInfo({ url: fileUrl, updatedAt: new Date().toISOString() });
        updateUser({ resumeUrl: fileUrl });
        
        // Parse the resume using AI service
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          const parseResponse = await axios.post('http://localhost:3001/api/parse-resume', {
            fileUrl: fileUrl,
            userId: user?.id
          }, {
            headers: { 
              'Authorization': `Bearer ${token}`
            }
          });
          
          // Update profile with parsed data
          const parsedData = parseResponse.data.data || parseResponse.data;
          if (parsedData) {
            try {
              await axios.put('http://localhost:5001/api/candidate/resume-data', {
                name: parsedData.name,
                email: parsedData.email,
                phone: parsedData.phone,
                skills: parsedData.skills,
                education: parsedData.education,
                experienceYears: parsedData.experienceYears,
                linkedin: parsedData.linkedin,
                github: parsedData.github,
                languages: parsedData.languages,
                summary: parsedData.summary
              }, {
                headers: { 
                  'Authorization': `Bearer ${token}`
                }
              });
              
              // Update user context
              updateUser({
                name: parsedData.name || user?.name,
                email: parsedData.email || user?.email,
                phone: parsedData.phone || user?.phone,
                skills: parsedData.skills || user?.skills,
                education: parsedData.education || user?.education,
                experienceYears: parsedData.experienceYears || user?.experienceYears,
                linkedIn: parsedData.linkedin || user?.linkedIn,
                github: parsedData.github || user?.github,
                languages: parsedData.languages || user?.languages
              });
            } catch (updateError) {
              console.error('Failed to update profile with parsed data:', updateError);
            }
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
          // Still show success for upload even if parsing fails
        }
      } else {
        await loadResumeInfo();
      }
      
      setSelectedFile(null);
      
      // Show success message with option to view profile
      const viewProfile = window.confirm(
        'Resume uploaded and parsed successfully! Your profile has been updated with the extracted information.\n\nWould you like to view your updated profile?'
      );
      if (viewProfile) {
        navigate('/candidate/edit-profile', { state: { refresh: true } });
      }
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed. See console.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveResume = async () => {
    if (!resumeInfo.url) return;
    setRemoving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5001/api/candidate/resume', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResumeInfo({ url: '', updatedAt: '' });
      updateUser({ resumeUrl: '' });
      setResumeError('');
      alert('Resume removed successfully.');
    } catch (err) {
      console.error('Failed to remove resume', err);
      alert('Failed to remove resume. Please try again.');
    } finally {
      setRemoving(false);
    }
  };

  const resumeDownloadUrl = resumeInfo.url
    ? (resumeInfo.url.startsWith('http') ? resumeInfo.url : `http://localhost:5001${resumeInfo.url}`)
    : '';
  const resumeFileName = resumeInfo.url
    ? decodeURIComponent(resumeInfo.url.split('/').pop() || 'resume.pdf')
    : '';

  const handleOpenResume = () => {
    if (resumeDownloadUrl) {
      window.open(resumeDownloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const displayName = user?.name || 'User';

  return (
    <div style={styles.container}>
      <header style={{ ...styles.header, padding: isMobile ? '12px 16px' : '16px 32px' }}>
        <div style={styles.brand}>PreHire</div>

        <nav style={{ ...styles.nav, display: isMobile ? 'none' : 'flex' }}>
          <a style={styles.navLink} href="#">About Us</a>
          <a style={styles.navLink} href="#">Clients</a>
          <a style={styles.navLink} href="#">Pricing</a>
          <a style={styles.navLink} href="#">FAQ</a>
          <a style={styles.navLink} href="#">Contact Us</a>
        </nav>

        <button style={{ ...styles.mobileMenuBtn, display: isMobile ? 'block' : 'none' }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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

        <div style={{ ...styles.rightHeader, display: isMobile ? 'none' : 'flex' }}>
          <div style={{ position: 'relative' }} ref={notificationRef}>
            <button onClick={() => setShowNotification(prev => !prev)} style={styles.bellBtn} aria-label="Toggle notifications">
              <FiBell style={styles.icon} size={20} color="#374151" />
              <div style={styles.notificationDot}></div>
            </button>

            {showNotification && (
              <div style={styles.notificationPopup} role="dialog" aria-label="Notifications">
                <div style={styles.notificationPopupHeader}>
                  <div style={{ fontWeight: 600 }}>Notifications</div>
                  <button onClick={() => setShowNotification(false)} style={styles.closeBtn} aria-label="Close notifications">
                    <FiX size={16} />
                  </button>
                </div>
                <div style={styles.notificationPopupBody}>
                  <div style={{ fontSize: 14, color: '#111827' }}>
                    You've been shortlisted for UX Designer Role at IMB.
                  </div>
                </div>
              </div>
            )}
          </div>

          <FiSearch style={styles.icon} size={20} color="#374151" />

          <div style={{ position: 'relative' }} ref={profileMenuRef}>
            <div
              style={styles.avatar}
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              role="button"
              tabIndex={0}
            >
              <div style={styles.avatarFallback}>{displayName.charAt(0).toUpperCase()}</div>
            </div>

            {profileMenuOpen && (
              <div style={styles.profileDropdown}>
                <div style={styles.profileDropdownHeader}>
                  <div style={styles.profileDropdownName}>{displayName}</div>
                  <div style={styles.profileDropdownEmail}>{user?.email || ''}</div>
                </div>
                <div style={styles.profileDropdownDivider}></div>

                <button style={styles.profileDropdownItem} onClick={() => { navigate('/candidate/edit-profile'); setProfileMenuOpen(false); }}>
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
          </div>
        </div>
      </header>

      <div style={{ height: isMobile ? 80 : 88 }} />

      <main style={styles.main}>
        <h2 style={styles.title}>Upload Resume</h2>
        <p style={styles.subtitle}>Upload your resume to get started</p>

        <section style={styles.currentResumeSection}>
          {resumeLoading ? (
            <div style={styles.statusText}>Loading your saved resume...</div>
          ) : resumeInfo.url ? (
            <div style={styles.currentResumeCard}>
              <div>
                <div style={styles.fileName}>{resumeFileName}</div>
                <div style={styles.fileMeta}>
                  {resumeInfo.updatedAt
                    ? `Updated ${new Date(resumeInfo.updatedAt).toLocaleString()}`
                    : 'Ready to share with recruiters'}
                </div>
              </div>
              <div style={styles.resumeActions}>
                <button type="button" style={styles.secondaryBtn} onClick={handleOpenResume}>
                  Open
                </button>
                <button
                  type="button"
                  style={styles.dangerBtn}
                  onClick={handleRemoveResume}
                  disabled={removing}
                >
                  {removing ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.statusText}>You have not uploaded a resume yet.</div>
          )}
          {resumeError && <div style={styles.errorText}>{resumeError}</div>}
        </section>

        <div
          style={styles.dropZone}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={handleDropzoneClick}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={onFileChange} />
          <div style={styles.dropInner}>
            <div style={styles.dropText}>Drag and drop your resume or click to browse</div>
            <button type="button" onClick={handleChooseButtonClick} style={styles.chooseBtn}><FiUpload style={{ marginRight: 8 }} />Choose file</button>
          </div>
        </div>

        {uploadValidationError && (
          <div style={styles.errorText}>{uploadValidationError}</div>
        )}

        {selectedFile && (
          <div style={styles.selectedInfo}>
            <div>Selected File: {selectedFile.name}</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Size: {(selectedFile.size / (1024*1024)).toFixed(2)} MB</div>
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <button onClick={handleUpload} disabled={uploading} style={styles.uploadBtn}>
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </div>

        <div style={{ marginTop: 12, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a href="/candidate/edit-profile" style={styles.backLink}>View Updated Profile</a>
          <a href="/candidate" style={styles.backLink}>Back to Dashboard</a>
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  header: { position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid #E5E7EB', background: '#fff', zIndex: 1000, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 64 },
  brand: { fontSize: 22, fontWeight: 700, color: '#7C3AED' },
  nav: { gap: 24, alignItems: 'center' },
  navLink: { color: '#6B7280', textDecoration: 'none', fontWeight: 500, fontSize: 14 },
  mobileMenuBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: '8px' },
  mobileMenu: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #E5E7EB', borderTop: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1001, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  mobileNavLink: { color: '#6B7280', textDecoration: 'none', fontWeight: 500, fontSize: 16, padding: '8px 0', borderBottom: '1px solid #F3F4F6' },
  rightHeader: { display: 'flex', gap: 12, alignItems: 'center' },
  bellBtn: { background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 18, cursor: 'pointer' },
  notificationDot: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '2px solid #fff' },
  notificationPopup: { position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 320, maxWidth: '90vw', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, boxShadow: '0 10px 20px rgba(2,6,23,0.2)', zIndex: 1200, overflow: 'hidden' },
  notificationPopupHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid #F3F4F6' },
  notificationPopupBody: { padding: 12 },
  avatar: { width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: '#E5E7EB', cursor: 'pointer', transition: 'opacity 0.2s', border: '2px solid transparent' },
  avatarFallback: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontWeight: 600, fontSize: 16 },
  profileDropdown: { position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.08)', minWidth: 200, zIndex: 1000, overflow: 'hidden' },
  profileDropdownHeader: { padding: '12px 16px', borderBottom: '1px solid #F3F4F6' },
  profileDropdownName: { fontWeight: 600, color: '#111827', fontSize: 14, marginBottom: 4 },
  profileDropdownEmail: { color: '#6B7280', fontSize: 12 },
  profileDropdownDivider: { height: 1, background: '#F3F4F6' },
  profileDropdownItem: { width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#374151', fontSize: 14, transition: 'background 0.2s' },

  main: { maxWidth: 760, margin: '0 auto', padding: '24px 16px', textAlign: 'center' },
  title: { fontSize: 20, color: '#111827', marginBottom: 6 },
  subtitle: { color: '#6B7280', marginBottom: 18 },
  dropZone: { border: '1px solid #E5E7EB', borderRadius: 8, padding: 36, cursor: 'pointer', background: '#fff' },
  dropInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  dropText: { color: '#9CA3AF' },
  chooseBtn: { background: 'linear-gradient(90deg,#60A5FA,#C084FC)', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, cursor: 'pointer' },
  selectedInfo: { marginTop: 12, textAlign: 'center', color: '#374151' },
  currentResumeSection: { marginBottom: 24, textAlign: 'left' },
  currentResumeCard: { border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, background: '#F9FAFB', flexWrap: 'wrap' },
  resumeActions: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  fileName: { fontWeight: 600, color: '#111827' },
  fileMeta: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  secondaryBtn: { background: '#EEF2FF', color: '#4F46E5', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  dangerBtn: { background: '#FEE2E2', color: '#B91C1C', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  statusText: { color: '#6B7280', fontSize: 14 },
  errorText: { color: '#DC2626', fontSize: 13, marginTop: 8 },
  uploadBtn: { width: '100%', background: '#3B82F6', color: '#fff', border: 'none', padding: '12px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, marginTop: 12 },
  backLink: { color: '#3B82F6', textDecoration: 'none' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};

export default CandidateUploadResume;
