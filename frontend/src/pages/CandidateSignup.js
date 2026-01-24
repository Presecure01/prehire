import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { setSignupData, mergeSignupData, getSignupData, setResumeFile } from '../utils/candidateSignupStore';
import axios from 'axios';

const CandidateSignup = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const fileInputRef = useRef(null);

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
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    currentRole: '',
    experience: '',
    skills: '',
    education: '',
    linkedIn: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    // Store form data and navigate to next step
    setSignupData(formData);
    // Skip resume upload step if resume was already uploaded in step 1
    const signupData = getSignupData();
    if (signupData.resumeUploadedInStep1 || resumeUploaded) {
      navigate('/candidate/complete');
    } else {
    navigate('/candidate/resume-upload');
    }
  };

  const handleLinkedInFill = () => {
    window.location.href = 'http://localhost:5001/api/auth/linkedin';
  };

  const handleResumeUpload = async (file) => {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && 
        !file.name.toLowerCase().endsWith('.pdf') && 
        !file.name.toLowerCase().endsWith('.doc') && 
        !file.name.toLowerCase().endsWith('.docx')) {
      setUploadStatus('Please upload a PDF, DOC, or DOCX file.');
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus('File size must be less than 5MB.');
      return;
    }

    setUploading(true);
    setUploadStatus('Parsing resume...');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await axios.post('http://localhost:3001/api/parse-resume-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const parsedData = response.data.data || {};
      
      // Auto-fill form with parsed data
      const nameParts = (parsedData.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Map experience years to experience range
      const experienceYears = parsedData.experienceYears || 0;
      let experienceRange = '';
      if (experienceYears === 0) experienceRange = '0-1 years';
      else if (experienceYears <= 3) experienceRange = '1-3 years';
      else if (experienceYears <= 5) experienceRange = '3-5 years';
      else if (experienceYears <= 8) experienceRange = '5-8 years';
      else experienceRange = '8+ years';

      // Map education to dropdown options
      let educationValue = '';
      const edu = (parsedData.education || '').toLowerCase();
      if (edu.includes('bachelor') || edu.includes('b.') || edu.includes('b.e') || edu.includes('b.tech')) {
        educationValue = "Bachelor's Degree";
      } else if (edu.includes('master') || edu.includes('m.') || edu.includes('m.e') || edu.includes('m.tech') || edu.includes('mba')) {
        educationValue = "Master's Degree";
      } else if (edu.includes('phd') || edu.includes('doctorate')) {
        educationValue = 'PhD';
      } else if (edu.includes('diploma')) {
        educationValue = 'Diploma';
      } else if (edu.includes('certificate')) {
        educationValue = 'Certification';
      }

      setFormData(prev => ({
        ...prev,
        name: firstName && lastName ? `${firstName} ${lastName}` : (parsedData.name || prev.name),
        phone: parsedData.phone || prev.phone,
        email: parsedData.email || prev.email,
        currentRole: parsedData.currentRole || prev.currentRole,
        experience: experienceRange || prev.experience,
        skills: Array.isArray(parsedData.skills) ? parsedData.skills.join(', ') : (parsedData.skills || prev.skills),
        education: educationValue || prev.education,
        linkedIn: parsedData.linkedin || prev.linkedIn
      }));

      setUploadStatus('Resume parsed successfully! Form fields have been filled.');
      setResumeUploaded(true);
      // Store that resume was uploaded and save the file for later upload
      setResumeFile(file);
      mergeSignupData({ resumeUploadedInStep1: true });
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Resume parsing error:', error);
      setUploadStatus('Failed to parse resume. Please fill the form manually.');
      setTimeout(() => setUploadStatus(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleResumeUpload(file);
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
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
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
              disabled={uploading}
            />
            <button 
              type="button"
              style={{...styles.uploadButton, ...(uploading ? styles.uploadButtonDisabled : {})}}
              onClick={handleUploadButtonClick}
              disabled={uploading}
            >
              {uploading ? 'Parsing...' : 'Upload Resume 📎'}
            </button>
            <button style={styles.linkedinButton} onClick={handleLinkedInFill} disabled={uploading}>
              Fill with Linkedin
            </button>
          </div>
          {uploadStatus && (
            <div style={uploadStatus.includes('successfully') ? styles.successMessage : styles.errorMessage}>
              {uploadStatus}
            </div>
          )}

          <form style={styles.form} onSubmit={handleNext}>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Phone Number*</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Preferred Location*</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  style={styles.select}
                  required
                >
                  <option value="">Select location</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Current Role*</label>
                <input
                  type="text"
                  name="currentRole"
                  value={formData.currentRole}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g. Software Engineer, Product Manager"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Experience*</label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  style={styles.select}
                  required
                >
                  <option value="">Select experience</option>
                  <option value="0-1 years">0-1 years</option>
                  <option value="1-3 years">1-3 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5-8 years">5-8 years</option>
                  <option value="8+ years">8+ years</option>
                </select>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Skills*</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g. JavaScript, React, Python, AWS"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Education*</label>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  style={styles.select}
                  required
                >
                  <option value="">Select education</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Certification">Certification</option>
                </select>
              </div>
            </div>

            <div style={styles.singleRow}>
              <div style={styles.field}>
                <label style={styles.label}>LinkedIn Profile (Optional)</label>
                <input
                  type="url"
                  name="linkedIn"
                  value={formData.linkedIn}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
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
  row: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  field: {
    flex: 1
  },
  label: {
    display: 'block',
    fontSize: '0.95rem',
    color: '#6B7280',
    marginBottom: '0.5rem',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: 'none',
    backgroundColor: '#F3F4F6',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: 'none',
    backgroundColor: '#F3F4F6',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    cursor: 'pointer'
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
  },
  singleRow: {
    marginBottom: '1.5rem'
  },
  uploadButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  successMessage: {
    marginTop: '1rem',
    padding: '0.75rem',
    borderRadius: '8px',
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    textAlign: 'center',
    fontSize: '0.9rem'
  },
  errorMessage: {
    marginTop: '1rem',
    padding: '0.75rem',
    borderRadius: '8px',
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    textAlign: 'center',
    fontSize: '0.9rem'
  }
};

export default CandidateSignup;
