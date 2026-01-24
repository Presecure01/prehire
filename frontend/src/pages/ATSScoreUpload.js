import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';
import { FiBell, FiSearch } from 'react-icons/fi';

const ATSScoreUpload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Please upload a PDF or DOCX file');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a resume file');
      return;
    }
    if (!jobDescription.trim()) {
      alert('Please enter a job description');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('resume', file);

      // Upload resume
      const uploadResponse = await axios.post('http://localhost:5001/api/upload/resume', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Parse resume
      const parseResponse = await axios.post('http://localhost:3001/api/parse-resume', {
        fileUrl: uploadResponse.data.fileUrl,
        userId: user.id,
        jobDescription
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Calculate ATS score
      const atsResponse = await axios.post('http://localhost:5001/api/candidate/ats-score', {
        jobDescription
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Navigate to results page with data
      navigate('/ats-score-results', {
        state: {
          atsScore: atsResponse.data,
          parsedData: parseResponse.data.data,
          jobDescription
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload and analyze resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>PreHire</div>
        <nav style={styles.nav}>
          <a href="#" style={styles.navLink}>About Us</a>
          <a href="#" style={styles.navLink}>Clients</a>
          <a href="#" style={styles.navLink}>Pricing</a>
          <a href="#" style={styles.navLink}>FAQ</a>
          <a href="#" style={styles.navLink}>Contact Us</a>
        </nav>
        <div style={styles.userSection}>
          <FiBell style={styles.icon} size={20} color="#374151" />
          <FiSearch style={styles.icon} size={20} color="#374151" />
          <div style={styles.avatar}>
            {user?.photo ? (
              <img src={user.photo.startsWith('http') ? user.photo : `http://localhost:5001${user.photo}`} alt="Profile" style={styles.avatarImg} />
            ) : (
              <div style={styles.avatarPlaceholder}>
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <h1 style={styles.title}>ATS Score Analysis</h1>
        <p style={styles.subtitle}>See how well your profile matches job requirements</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div
            style={{
              ...styles.uploadArea,
              borderColor: dragActive ? '#3B82F6' : '#E5E7EB',
              backgroundColor: dragActive ? '#F3F4F6' : '#fff'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <p style={styles.uploadText}>Drag and drop your resume or click to browse</p>
            <input
              type="file"
              id="file-input"
              accept=".pdf,.doc,.docx"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-input" style={styles.fileButton}>
              Choose file
            </label>
            {file && <p style={styles.fileName}>{file.name}</p>}
          </div>

          <div style={styles.jobDescriptionSection}>
            <label htmlFor="job-description" style={styles.label}>Job Description</label>
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here to analyze your resume match..."
              style={styles.textarea}
              rows={8}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={uploading} 
            style={{
              ...styles.submitButton,
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.6 : 1
            }}
          >
            {uploading ? 'Analyzing...' : 'Upload Resume'}
          </button>

          <a href="/candidate" style={styles.backLink}>Back to Dashboard</a>
        </form>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 3rem',
    backgroundColor: 'white',
    borderBottom: '1px solid #E5E7EB'
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem'
  },
  navLink: {
    textDecoration: 'none',
    color: '#6B7280',
    fontSize: '0.95rem',
    fontWeight: '500'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  icon: {
    cursor: 'pointer'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    overflow: 'hidden'
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3B82F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '1.1rem'
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '3rem 2rem'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: '0.5rem'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: '3rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  uploadArea: {
    border: '2px dashed #E5E7EB',
    borderRadius: '8px',
    padding: '3rem 2rem',
    textAlign: 'center',
    transition: 'all 0.3s ease'
  },
  uploadText: {
    color: '#6B7280',
    fontSize: '1rem',
    marginBottom: '1rem'
  },
  fileButton: {
    display: 'inline-block',
    padding: '0.75rem 2rem',
    background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem'
  },
  fileName: {
    marginTop: '1rem',
    color: '#111827',
    fontWeight: '500'
  },
  jobDescriptionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#374151'
  },
  textarea: {
    padding: '1rem',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '150px'
  },
  submitButton: {
    padding: '0.875rem 2rem',
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600'
  },
  backLink: {
    textAlign: 'center',
    color: '#3B82F6',
    textDecoration: 'none',
    fontSize: '0.95rem',
    marginTop: '0.5rem'
  }
};

export default ATSScoreUpload;
