import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import { clearSignupData, getResumeFile, getSignupData } from '../utils/candidateSignupStore';

const CandidateComplete = () => {
  const [formData, setFormData] = useState({
    photo: null,
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedPhoto(file);
      setFormData({ ...formData, photo: file });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      // Get previous form data
      const previousData = getSignupData();
      if (!previousData.name || !previousData.email) {
        alert('Missing signup details. Please restart the signup process.');
        setLoading(false);
        return;
      }
      const skillList = Array.isArray(previousData.skills)
        ? previousData.skills
        : (previousData.skills || '')
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean);
      
      // First register the user
      const parseExperienceYears = (value) => {
        if (value === undefined || value === null) return undefined;
        if (typeof value === 'number' && !Number.isNaN(value)) return value;
        const str = String(value);
        const plusMatch = str.match(/(\d+)\s*\+/);
        if (plusMatch) return Number(plusMatch[1]);
        const rangeMatch = str.match(/(\d+)\s*-\s*(\d+)/);
        if (rangeMatch) return Number(rangeMatch[2]);
        const numMatch = str.match(/(\d+)/);
        if (numMatch) return Number(numMatch[1] || numMatch[0]);
        return undefined;
      };

      const experienceYearsValue =
        previousData.experienceYears ?? parseExperienceYears(previousData.experience);

      const completeData = {
        name: previousData.name,
        email: previousData.email,
        phone: previousData.phone,
        password: formData.password,
        role: 'candidate',
        location: previousData.location,
        experience: previousData.experience,
        currentRole: previousData.currentRole,
        skills: skillList,
        education: previousData.education || '',
        linkedIn: previousData.linkedIn || '',
        experienceYears: experienceYearsValue
      };

      if (experienceYearsValue === undefined) {
        delete completeData.experienceYears;
      }

      const result = await register(completeData);
      
      if (result.success) {
        // Upload files after successful registration
        const token = localStorage.getItem('token');
        
        // Upload photo if provided
        if (formData.photo) {
          const photoFormData = new FormData();
          photoFormData.append('photo', formData.photo);
          
          try {
            await axios.post('http://localhost:5001/api/upload/photo', photoFormData, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
          } catch (photoError) {
            console.error('Photo upload failed:', photoError);
          }
        }
        
        // Upload resume if provided
        const resumeFile = getResumeFile();
        if (resumeFile) {
          const resumeFormData = new FormData();
          resumeFormData.append('resume', resumeFile);
          
          try {
            await axios.post('http://localhost:5001/api/upload/resume', resumeFormData, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
          } catch (resumeError) {
            console.error('Resume upload failed:', resumeError);
          }
        }
        
        clearSignupData();
        navigate('/candidate/welcome');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
    
    setLoading(false);
  };

  const handleLinkedInFill = () => {
    window.location.href = 'http://localhost:5001/api/auth/linkedin';
  };

  return (
    <div style={styles.container}>
      <Navbar />



      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>Complete Your Profile</h1>
          <p style={styles.subtitle}>
            Upload your photo and create a password to finish setting up your account.
          </p>

          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.singleRow}>
              <div style={styles.field}>
                <label style={styles.label}>Upload Photo*</label>
                <div
                  {...getRootProps()}
                  style={{
                    ...styles.dropzone,
                    ...(isDragActive ? styles.dropzoneActive : {})
                  }}
                >
                  <input {...getInputProps()} />
                  {uploadedPhoto ? (
                    <div style={styles.uploadedFile}>
                      <span>🖼️ {uploadedPhoto.name}</span>
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
                <label style={styles.label}>Enter Password*</label>
                <div style={styles.passwordField}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    style={styles.passwordInput}
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    style={styles.eyeButton}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    👁️
                  </button>
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Confirm Password*</label>
                <div style={styles.passwordField}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={styles.passwordInput}
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    style={styles.eyeButton}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    👁️
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" style={styles.submitButton} disabled={loading}>
              {loading ? 'Creating Account...' : 'Submit'}
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
  singleRow: {
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
  passwordField: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  passwordInput: {
    width: '100%',
    padding: '0.75rem',
    paddingRight: '3rem',
    border: 'none',
    backgroundColor: '#F3F4F6',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box'
  },
  eyeButton: {
    position: 'absolute',
    right: '0.75rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  submitButton: {
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

export default CandidateComplete;
