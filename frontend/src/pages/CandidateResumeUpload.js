import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FiMenu, FiX } from 'react-icons/fi';
import { mergeSignupData, setResumeFile, getSignupData } from '../utils/candidateSignupStore';

const CandidateResumeUpload = () => {
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
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const navigate = useNavigate();

  // Check if resume was already uploaded in step 1 and skip this step
  useEffect(() => {
    const signupData = getSignupData();
    if (signupData.resumeUploadedInStep1) {
      // Resume was already uploaded in step 1, skip this step
      navigate('/candidate/complete', { replace: true });
    }
  }, [navigate]);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setResumeFile(file);
      setUploadError('');
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024
  });

  const handleNext = (e) => {
    e.preventDefault();
    if (!uploadedFile) {
      setUploadError('Please add your resume to continue.');
      return;
    }

    mergeSignupData({
      resumeName: uploadedFile.name,
      resumeSize: uploadedFile.size
    });

    navigate('/candidate/complete');
  };

  const handleLinkedInFill = () => {
    window.location.href = 'http://localhost:5001/api/auth/linkedin';
  };

  const handleUploadClick = (event) => {
    event.preventDefault();
    open();
  };

  const handleRemoveFile = (event) => {
    event.preventDefault();
    setUploadedFile(null);
    setResumeFile(null);
    setUploadError('');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.brand}>PreHire</div>
        
        {/* Desktop Navigation */}
        <nav style={{...styles.nav, display: isMobile ? 'none' : 'flex'}}>
          <a href="#" style={styles.navLink}>About Us</a>
          <a href="#" style={styles.navLink}>Clients</a>
          <a href="#" style={styles.navLink}>Pricing</a>
          <a href="#" style={styles.navLink}>FAQ</a>
          <a href="#" style={styles.navLink}>Contact Us</a>
          <Link to="/candidate/login" style={styles.loginButton}>
            Login <span style={styles.arrow}>→</span>
          </Link>
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
            <Link 
              to="/candidate/login" 
              style={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        )}
      </header>

      <main style={{
        ...styles.main,
        padding: isMobile ? '2rem 1rem' : '4rem 3rem',
        marginTop: isMobile ? 70 : 80
      }}>
        <div style={styles.content}>
          <h1 style={styles.title}>Get Hired by Top Startups & Companies.</h1>
          <p style={styles.subtitle}>
            Build your profile once and let the right roles find you.<br />
            No endless applications, no cold emails. Just real opportunities.
          </p>
          <div style={styles.buttons}>
            <button 
              style={styles.uploadButton}
              onClick={handleUploadClick}
            >
              Upload Resume
            </button>
            <button style={styles.linkedinButton} onClick={handleLinkedInFill}>
              Fill with Linkedin
            </button>
          </div>

          <form style={styles.form} onSubmit={handleNext}>
            <div style={styles.uploadSection}>
              <label style={styles.label}>Upload Resume*</label>
              <div
                {...getRootProps({
                  onClick: (event) => {
                    event.preventDefault()
                    open()
                  }
                })}
                style={{
                  ...styles.dropzone,
                  ...(isDragActive ? styles.dropzoneActive : {})
                }}
              >
                <input {...getInputProps()} />
                <div style={styles.dropzoneContent}>
                  <div>
                    <div style={styles.dropTitle}>Drag & drop your resume here</div>
                    <div style={styles.dropSubtitle}>PDF, DOC, or DOCX up to 5 MB</div>
                  </div>
                  <button type="button" style={styles.browseButton} onClick={handleUploadClick}>
                    Browse files
                  </button>
                </div>
              </div>
              {uploadedFile && (
                <div style={styles.filePreview}>
                  <div>
                    <div style={styles.fileName}>{uploadedFile.name}</div>
                    <div style={styles.fileMeta}>
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                      {uploadedFile.lastModified ? ' - Updated ' + new Date(uploadedFile.lastModified).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <button style={styles.removeButton} onClick={handleRemoveFile}>
                    Remove
                  </button>
                </div>
              )}
              {uploadError && <div style={styles.error}>{uploadError}</div>}
            </div>

            <button type="submit" style={styles.nextButton}>
              Next
            </button>
          </form>

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
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
  loginButton: {
    textDecoration: 'none',
    backgroundColor: '#3B82F6',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '25px',
    fontSize: '0.95rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  arrow: {
    fontSize: '1rem'
  },
  main: {
    padding: '4rem 3rem',
    display: 'flex',
    justifyContent: 'center',
    marginTop: 80
  },
  content: {
    maxWidth: '600px',
    textAlign: 'center'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '1rem'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#6B7280',
    lineHeight: '1.6',
    marginBottom: '2rem'
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '3rem'
  },
  uploadButton: {
    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  linkedinButton: {
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #D1D5DB',
    padding: '1rem 2rem',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  form: {
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'left'
  },
  label: {
    display: 'block',
    fontSize: '0.95rem',
    color: '#6B7280',
    marginBottom: '0.5rem',
    fontWeight: '500'
  },
  uploadSection: {
    marginBottom: '1.5rem'
  },
  dropzone: {
    width: '100%',
    minHeight: '150px',
    border: '2px dashed #C7D2FE',
    backgroundColor: '#F9FAFB',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  dropzoneActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1'
  },
  dropzoneContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: '1rem',
    padding: '1.5rem'
  },
  dropTitle: {
    fontWeight: 600,
    color: '#1F2937',
    fontSize: '1.05rem'
  },
  dropSubtitle: {
    color: '#6B7280',
    fontSize: '0.9rem'
  },
  browseButton: {
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    border: 'none',
    fontWeight: 600,
    padding: '0.75rem 1.25rem',
    borderRadius: '999px',
    cursor: 'pointer'
  },
  filePreview: {
    marginTop: '1rem',
    padding: '1rem',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    backgroundColor: '#fff'
  },
  fileName: {
    fontWeight: 600,
    color: '#1F2937'
  },
  fileMeta: {
    fontSize: '0.9rem',
    color: '#6B7280'
  },
  removeButton: {
    background: 'none',
    border: 'none',
    color: '#DC2626',
    fontWeight: 600,
    cursor: 'pointer'
  },
  error: {
    marginTop: '0.5rem',
    color: '#DC2626',
    fontSize: '0.9rem'
  },
  nextButton: {
    width: '100%',
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1rem'
  }
};

export default CandidateResumeUpload;
