import React, { useState } from 'react';
import axios from 'axios';

const ProfileUnlock = ({ candidateId, onClose, onUnlock }) => {
  const [loading, setLoading] = useState(false);
  const [unlockedProfile, setUnlockedProfile] = useState(null);

  const handleUnlock = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5001/api/recruiter/unlock-profile/${candidateId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUnlockedProfile(response.data.candidate);
      if (onUnlock) onUnlock(response.data.candidate);
    } catch (error) {
      console.error('Unlock error:', error);
      alert('Failed to unlock profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (unlockedProfile) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2 style={styles.title}>🔓 Profile Unlocked!</h2>
            <button onClick={onClose} style={styles.closeButton}>×</button>
          </div>
          
          <div style={styles.content}>
            <div style={styles.profileSection}>
              <div style={styles.avatar}>
                {unlockedProfile.photo ? (
                  <img src={unlockedProfile.photo} alt={unlockedProfile.name} style={styles.avatarImg} />
                ) : (
                  <div style={styles.avatarPlaceholder}>
                    {unlockedProfile.name?.charAt(0) || 'C'}
                  </div>
                )}
              </div>
              
              <div style={styles.profileInfo}>
                <h3 style={styles.name}>{unlockedProfile.name}</h3>
                <p style={styles.role}>{unlockedProfile.currentRole}</p>
                
                <div style={styles.contactInfo}>
                  <div style={styles.contactItem}>
                    <span style={styles.contactLabel}>📧 Email:</span>
                    <span style={styles.contactValue}>{unlockedProfile.email}</span>
                  </div>
                  <div style={styles.contactItem}>
                    <span style={styles.contactLabel}>📞 Phone:</span>
                    <span style={styles.contactValue}>{unlockedProfile.phone}</span>
                  </div>
                  {unlockedProfile.linkedIn && (
                    <div style={styles.contactItem}>
                      <span style={styles.contactLabel}>💼 LinkedIn:</span>
                      <a href={unlockedProfile.linkedIn} target="_blank" rel="noopener noreferrer" style={styles.linkedinLink}>
                        View Profile
                      </a>
                    </div>
                  )}
                </div>
                
                {unlockedProfile.skills && unlockedProfile.skills.length > 0 && (
                  <div style={styles.skillsSection}>
                    <h4 style={styles.sectionTitle}>Skills</h4>
                    <div style={styles.skillsContainer}>
                      {unlockedProfile.skills.map((skill, index) => (
                        <span key={index} style={styles.skillTag}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {unlockedProfile.experience && (
                  <div style={styles.section}>
                    <h4 style={styles.sectionTitle}>Experience</h4>
                    <p style={styles.sectionContent}>{unlockedProfile.experience}</p>
                  </div>
                )}
                
                {unlockedProfile.education && (
                  <div style={styles.section}>
                    <h4 style={styles.sectionTitle}>Education</h4>
                    <p style={styles.sectionContent}>{unlockedProfile.education}</p>
                  </div>
                )}
                
                {unlockedProfile.resumeUrl && (
                  <div style={styles.resumeSection}>
                    <a 
                      href={`http://localhost:5001${unlockedProfile.resumeUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={styles.resumeButton}
                    >
                      📄 Download Resume
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div style={styles.footer}>
            <button onClick={onClose} style={styles.doneButton}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>🔓 Unlock Candidate Profile</h2>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>
        
        <div style={styles.content}>
          <div style={styles.unlockInfo}>
            <div style={styles.unlockIcon}>🔐</div>
            <h3>Premium Feature</h3>
            <p>Unlock this candidate's full profile to access:</p>
            
            <ul style={styles.featureList}>
              <li>✅ Complete contact information</li>
              <li>✅ Full resume download</li>
              <li>✅ LinkedIn profile access</li>
              <li>✅ Detailed work experience</li>
              <li>✅ Education background</li>
              <li>✅ Skills assessment</li>
            </ul>
            
            <div style={styles.pricing}>
              <div style={styles.priceTag}>
                <span style={styles.price}>$5</span>
                <span style={styles.priceLabel}>per unlock</span>
              </div>
            </div>
          </div>
        </div>
        
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
          <button 
            onClick={handleUnlock} 
            disabled={loading}
            style={styles.unlockButton}
          >
            {loading ? 'Unlocking...' : '🔓 Unlock Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #e2e8f0'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '0',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    padding: '2rem',
    maxHeight: '60vh',
    overflowY: 'auto'
  },
  unlockInfo: {
    textAlign: 'center'
  },
  unlockIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  featureList: {
    textAlign: 'left',
    margin: '1.5rem 0',
    padding: '0 2rem'
  },
  pricing: {
    margin: '2rem 0'
  },
  priceTag: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#eff6ff',
    borderRadius: '12px',
    border: '2px solid #3b82f6'
  },
  price: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1d4ed8'
  },
  priceLabel: {
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  profileSection: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'flex-start'
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '2rem'
  },
  profileInfo: {
    flex: 1
  },
  name: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 0.5rem 0'
  },
  role: {
    fontSize: '1.125rem',
    color: '#6b7280',
    margin: '0 0 1.5rem 0'
  },
  contactInfo: {
    marginBottom: '1.5rem'
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem'
  },
  contactLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    minWidth: '80px'
  },
  contactValue: {
    fontSize: '0.875rem',
    color: '#374151'
  },
  linkedinLink: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '0.875rem'
  },
  skillsSection: {
    marginBottom: '1.5rem'
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 0.75rem 0'
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  skillTag: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '500'
  },
  section: {
    marginBottom: '1.5rem'
  },
  sectionContent: {
    fontSize: '0.875rem',
    color: '#374151',
    lineHeight: '1.5',
    margin: 0
  },
  resumeSection: {
    marginTop: '1.5rem'
  },
  resumeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#10b981',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    padding: '1.5rem',
    borderTop: '1px solid #e2e8f0'
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  unlockButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  doneButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default ProfileUnlock;