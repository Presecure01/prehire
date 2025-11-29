import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import Navbar from '../components/common/Navbar';

const EmployerSignup = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [formData, setFormData] = useState({
    companyName: '',
    location: '',
    employees: '',
    logo: null
  });
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedLogo(file);
      setFormData({ ...formData, logo: file });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024
  });

  const handleNext = (e) => {
    e.preventDefault();
    localStorage.setItem('employerSignupData', JSON.stringify(formData));
    navigate('/employer/complete');
  };

  return (
    <div style={styles.container}>
      <Navbar />

      <main style={{
        ...styles.main,
        padding: isMobile ? '2rem 1rem' : '4rem 3rem',
        marginTop: isMobile ? 70 : 80
      }}>
        <div style={styles.content}>
          <h1 style={styles.title}>Just a Few Steps to Your First Great Hire</h1>
          <p style={styles.subtitle}>
            Complete your profile so candidates know who they're applying to.
          </p>

          <form style={styles.form} onSubmit={handleNext}>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Company Name*</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Upload Logo</label>
                <div
                  {...getRootProps()}
                  style={{
                    ...styles.dropzone,
                    ...(isDragActive ? styles.dropzoneActive : {})
                  }}
                >
                  <input {...getInputProps()} />
                  {uploadedLogo ? (
                    <div style={styles.uploadedFile}>
                      <span>🖼️ {uploadedLogo.name}</span>
                      <span style={styles.attachIcon}>📎</span>
                    </div>
                  ) : (
                    <div style={styles.dropzoneContent}>
                      <span style={styles.attachIcon}>📎</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Location*</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  style={styles.select}
                  required
                >
                  <option value="">Select location</option>
                  <option value="bangalore">Bangalore</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="delhi">Delhi</option>
                  <option value="hyderabad">Hyderabad</option>
                  <option value="pune">Pune</option>
                  <option value="chennai">Chennai</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Number of Employees</label>
                <select
                  name="employees"
                  value={formData.employees}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>
            </div>

            <button type="submit" style={styles.nextButton}>
              Next
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              <span style={styles.blueText}>Want smarter, faster hiring?</span>{' '}
              <span style={styles.purpleText}>Try our AI-powered profile-matching tool</span>
            </p>
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
    marginBottom: '3rem'
  },
  form: {
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'left',
    marginBottom: '3rem'
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
  dropzone: {
    width: '100%',
    height: '50px',
    border: 'none',
    backgroundColor: '#F3F4F6',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  dropzoneActive: {
    backgroundColor: '#E5E7EB'
  },
  dropzoneContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  uploadedFile: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0 0.5rem',
    fontSize: '0.9rem',
    color: '#374151'
  },
  attachIcon: {
    fontSize: '1.2rem'
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
  footer: {
    textAlign: 'center'
  },
  footerText: {
    fontSize: '1.1rem',
    margin: 0
  },
  blueText: {
    color: '#60A5FA'
  },
  purpleText: {
    color: '#8B5CF6'
  }
};

export default EmployerSignup;
