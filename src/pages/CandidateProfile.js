import React, { useState, useEffect } from 'react';
import { FiBell, FiSearch } from 'react-icons/fi';
import { useAuth } from '../utils/AuthContext';
import ResumeUpload from '../components/ResumeUpload';
import axios from 'axios';

const CandidateProfile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    photo: '',
    linkedIn: '',
    phone: '',
    skills: []
  });
  const [resumeScore, setResumeScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/candidate/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data;
      setProfile({
        name: userData.name || '',
        photo: userData.photo || '',
        linkedIn: userData.linkedIn || '',
        phone: userData.phone || '',
        skills: userData.skills || [],
        experience: userData.experience || '',
        currentRole: userData.currentRole || '',
        education: userData.education || '',
        location: userData.location || ''
      });
      setResumeScore(userData.resumeScore || 0);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5001/api/candidate/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Profile updated successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'skills') {
      setProfile({ ...profile, skills: value.split(',').map(s => s.trim()) });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleUploadSuccess = (uploadData) => {
    if (uploadData.parsedData) {
      const parsed = uploadData.parsedData;
      setProfile(prev => ({
        ...prev,
        name: parsed.name || prev.name,
        phone: parsed.phone || prev.phone,
        skills: parsed.skills || prev.skills,
        experience: parsed.experience || prev.experience,
        currentRole: parsed.currentRole || prev.currentRole,
        education: parsed.education || prev.education,
        location: parsed.location || prev.location
      }));
      
      if (parsed.resumeScore) {
        setResumeScore(parsed.resumeScore);
      }
    }
    
    setTimeout(() => {
      fetchProfile();
    }, 1000);
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

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
          <FiBell style={styles.notification} size={20} color="#374151" />
          <FiSearch style={styles.search} size={20} color="#374151" />
          <div style={styles.avatar}>
            {profile.photo ? (
              <img src={profile.photo.startsWith('http') ? profile.photo : `http://localhost:5001${profile.photo}`} alt="Profile" style={styles.avatarImg} />
            ) : (
              <div style={styles.avatarPlaceholder}>
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.section}>
          <ResumeUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {resumeScore > 0 && (
          <div style={styles.section}>
            <h3>Resume Score</h3>
            <div style={styles.scoreContainer}>
              <div style={styles.scoreCircle}>
                <span style={styles.scoreText}>{resumeScore}/100</span>
              </div>
            </div>
          </div>
        )}

        <div style={styles.section}>
          <h3>Profile Information</h3>
          {profile.photo && (
            <div style={styles.photoContainer}>
              <img src={profile.photo.startsWith('http') ? profile.photo : `http://localhost:5001${profile.photo}`} alt="Profile" style={styles.profilePhoto} />
            </div>
          )}
          <form onSubmit={handleProfileUpdate} style={styles.form}>
            <div style={styles.formRow}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={profile.name}
                onChange={handleInputChange}
                style={styles.input}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={profile.phone}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            <input
              type="url"
              name="photo"
              placeholder="Photo URL"
              value={profile.photo}
              onChange={handleInputChange}
              style={styles.input}
            />

            <input
              type="url"
              name="linkedIn"
              placeholder="LinkedIn Profile URL"
              value={profile.linkedIn}
              onChange={handleInputChange}
              style={styles.input}
            />

            <input
              type="text"
              name="skills"
              placeholder="Skills (comma separated)"
              value={profile.skills.join(', ')}
              onChange={handleInputChange}
              style={styles.input}
            />
            
            <input
              type="text"
              name="experience"
              placeholder="Experience"
              value={profile.experience}
              onChange={handleInputChange}
              style={styles.input}
            />
            
            <input
              type="text"
              name="currentRole"
              placeholder="Current Role"
              value={profile.currentRole}
              onChange={handleInputChange}
              style={styles.input}
            />
            
            <input
              type="text"
              name="education"
              placeholder="Education"
              value={profile.education}
              onChange={handleInputChange}
              style={styles.input}
            />

            <button type="submit" style={styles.button}>
              Update Profile
            </button>
          </form>
        </div>

        {profile.skills.length > 0 && (
          <div style={styles.section}>
            <h3>Your Skills</h3>
            <div style={styles.skillsContainer}>
              {profile.skills.map((skill, index) => (
                <span key={index} style={styles.skillTag}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
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
    color: '#8B5CF6'
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
  notification: {
    fontSize: '1.2rem',
    cursor: 'pointer'
  },
  search: {
    fontSize: '1.2rem',
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
  logoutBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  content: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto'
  },
  section: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formRow: {
    display: 'flex',
    gap: '1rem'
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    flex: 1
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  scoreContainer: {
    display: 'flex',
    justifyContent: 'center',
    margin: '1rem 0'
  },
  scoreCircle: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scoreText: {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  skillTag: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem'
  },
  photoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1rem'
  },
  profilePhoto: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #007bff'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem'
  }
};

export default CandidateProfile;