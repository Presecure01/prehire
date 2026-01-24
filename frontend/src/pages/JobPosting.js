import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import API_ENDPOINTS from '../config/api';

const JobPosting = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workplaceType: '',
    location: '',
    requirements: {
      skills: [],
      experienceYears: { min: '', max: '' },
      education: []
    },
    salaryRange: { min: '', max: '', currency: 'INR' }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Prepare job data
      const jobData = {
        title: formData.title,
        description: formData.description || `${formData.title} position`,
        location: formData.location,
        workplaceType: formData.workplaceType,
        requirements: {
          skills: formData.requirements.skills.length > 0 
            ? formData.requirements.skills 
            : formData.title.toLowerCase().includes('engineer') 
              ? ['JavaScript', 'React', 'Node.js'] 
              : [],
          experienceYears: {
            min: formData.requirements.experienceYears.min ? parseInt(formData.requirements.experienceYears.min) : undefined,
            max: formData.requirements.experienceYears.max ? parseInt(formData.requirements.experienceYears.max) : undefined
          }
        },
        salaryRange: {
          min: formData.salaryRange.min ? parseInt(formData.salaryRange.min) : undefined,
          max: formData.salaryRange.max ? parseInt(formData.salaryRange.max) : undefined,
          currency: 'INR'
        },
        status: 'active'
      };

      const response = await axios.post(API_ENDPOINTS.JOBS.CREATE, jobData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert('Job posted successfully! We will start matching candidates.');
        navigate('/recruiter');
      }
    } catch (err) {
      console.error('Job posting error:', err);
      setError(err.response?.data?.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>PreHire</div>
        <nav style={styles.nav}>
          <button type="button" style={styles.navLink}>About Us</button>
          <button type="button" style={styles.navLink}>Clients</button>
          <button type="button" style={styles.navLink}>Pricing</button>
          <button type="button" style={styles.navLink}>FAQ</button>
          <button type="button" style={styles.navLink}>Contact Us</button>
          <Link to="/login" style={styles.loginButton}>
            Login <span style={styles.arrow}>→</span>
          </Link>
        </nav>
      </header>

      <main style={styles.main}>
        <div style={styles.content}>
          <div style={styles.greeting}>Hi {user?.name || 'Ritu'}</div>
          <h1 style={styles.title}>Let's Find Your Perfect Hire</h1>
          <p style={styles.subtitle}>
            76% of companies get a qualified candidate in just one day
          </p>

          <form style={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div style={styles.error}>
                {error}
              </div>
            )}
            
            <div style={styles.field}>
              <label style={styles.label}>Job Title*</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Job Description*</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={{...styles.input, minHeight: '100px', resize: 'vertical'}}
                placeholder="Describe the role, responsibilities, and requirements..."
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Workplace Type*</label>
              <select
                name="workplaceType"
                value={formData.workplaceType}
                onChange={handleChange}
                style={styles.select}
                required
              >
                <option value="">Select workplace type</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Job Location*</label>
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

            <button 
              type="submit" 
              style={{
                ...styles.submitButton,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }} 
              disabled={loading}
            >
              {loading ? 'Posting Job...' : 'Submit'}
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 3rem',
    backgroundColor: 'white'
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#8B5CF6'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem'
  },
  navLink: {
    background: 'none',
    border: 'none',
    textDecoration: 'none',
    color: '#6B7280',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    padding: 0
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
    justifyContent: 'center'
  },
  content: {
    maxWidth: '500px',
    textAlign: 'center'
  },
  greeting: {
    fontSize: '1.5rem',
    color: '#60A5FA',
    marginBottom: '1rem',
    fontWeight: '500'
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
  field: {
    marginBottom: '1.5rem'
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
  submitButton: {
    width: '100%',
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '1rem'
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '0.9rem'
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

export default JobPosting;