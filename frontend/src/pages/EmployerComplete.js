import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import Navbar from '../components/common/Navbar';

const EmployerComplete = () => {
  const [formData, setFormData] = useState({
    recruiterName: '',
    companyMail: '',
    phoneNumber: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateCompanyEmail = (email) => {
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'protonmail.com', 'yandex.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    return !personalDomains.includes(domain);
  };
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'companyMail') {
      if (value && !validateCompanyEmail(value)) {
        setEmailError('Please use a company email address (not personal email like Gmail, Yahoo, etc.)');
      } else {
        setEmailError('');
      }
    }
  };

  const handleSendOTP = async () => {
    if (!formData.phoneNumber) {
      alert('Please enter phone number');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      alert('OTP sent to your phone number');
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCompanyEmail(formData.companyMail)) {
      alert('Please use a company email address (not personal email like Gmail, Yahoo, etc.)');
      return;
    }
    
    if (!otpSent) {
      handleSendOTP();
      return;
    }

    if (!formData.otp) {
      alert('Please enter OTP');
      return;
    }

    setLoading(true);
    
    // Get previous form data
    const previousData = JSON.parse(localStorage.getItem('employerSignupData') || '{}');
    
    // Combine all data
    const completeData = {
      name: formData.recruiterName,
      email: formData.companyMail,
      phone: formData.phoneNumber,
      password: 'temp_password_123', // In real app, would collect password
      role: 'recruiter',
      companyName: previousData.companyName,
      companyLogo: previousData.logo,
      contactInfo: formData.companyMail,
      location: previousData.location,
      employees: previousData.employees
    };

    const result = await register(completeData);
    
    if (result.success) {
      localStorage.removeItem('employerSignupData');
      navigate('/recruiter');
    } else {
      alert(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <Navbar />

      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>Just a Few Steps to Your First Great Hire</h1>
          <p style={styles.subtitle}>
            Complete your profile so candidates know who they're applying to.
          </p>

          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Recruiter Name*</label>
                <input
                  type="text"
                  name="recruiterName"
                  value={formData.recruiterName}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Company Mail*</label>
                <input
                  type="email"
                  name="companyMail"
                  value={formData.companyMail}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(emailError ? styles.inputError : {})
                  }}
                  required
                />
                {emailError && <div style={styles.errorText}>{emailError}</div>}
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Phone Number*</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>OTP*</label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder={otpSent ? "Enter OTP" : "OTP will be sent"}
                  maxLength="4"
                  disabled={!otpSent}
                  required
                />
              </div>
            </div>

            <button type="submit" style={styles.submitButton} disabled={loading}>
              {loading ? 'Processing...' : otpSent ? 'Submit' : 'Send OTP'}
            </button>
          </form>

          <div style={styles.divider}>
            <Link to="/employer/password-signup" style={styles.passwordSignup}>Sign Up with Password</Link>
          </div>

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
    marginBottom: '2rem'
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
  inputError: {
    backgroundColor: '#FEE2E2',
    border: '1px solid #DC2626'
  },
  errorText: {
    color: '#DC2626',
    fontSize: '0.8rem',
    marginTop: '0.25rem'
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
  },
  divider: {
    textAlign: 'center',
    marginBottom: '3rem'
  },
  passwordSignup: {
    textDecoration: 'none',
    color: '#6B7280',
    fontSize: '0.95rem',
    fontWeight: '500'
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

export default EmployerComplete;
