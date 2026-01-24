
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';
import { FiBell, FiSearch } from 'react-icons/fi';
import { API_ENDPOINTS, getApiUrl } from '../utils/apiClient';

const CandidateATSCheck = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [fetchingProfile, setFetchingProfile] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(API_ENDPOINTS.CANDIDATE.PROFILE, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfileData(res.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
                alert('Failed to load profile data. Please try again.');
            } finally {
                setFetchingProfile(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!jobDescription.trim()) {
            alert('Please enter a job description');
            return;
        }

        if (!profileData) {
            alert('Profile data not loaded. Please refresh the page.');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // Calculate ATS score
            const atsResponse = await axios.post(API_ENDPOINTS.CANDIDATE.ATS_SCORE, {
                jobDescription
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Construct parsedData from profileData
            const parsedData = {
                name: profileData.name || `${profileData.firstName} ${profileData.lastName}`,
                email: profileData.email,
                phone: profileData.phone,
                skills: profileData.skills || [],
                education: profileData.education,
                experienceYears: profileData.experienceYears
            };

            // Navigate to results page with data
            navigate('/ats-score-results', {
                state: {
                    atsScore: atsResponse.data,
                    parsedData: parsedData,
                    jobDescription
                }
            });
        } catch (error) {
            console.error('Analysis error:', error);
            alert('Failed to analyze profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingProfile) {
        return <div style={styles.loading}>Loading profile...</div>;
    }

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
                            <img src={user.photo.startsWith('http') ? user.photo : getApiUrl(user.photo)} alt="Profile" style={styles.avatarImg} />
                        ) : (
                            <div style={styles.avatarPlaceholder}>
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main style={styles.main}>
                <h1 style={styles.title}>Check ATS Score</h1>
                <p style={styles.subtitle}>Analyze your current profile against a job description</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.profileSummary}>
                        <h3 style={styles.summaryTitle}>Using Profile:</h3>
                        <div style={styles.summaryContent}>
                            <p><strong>Name:</strong> {profileData?.name || `${profileData?.firstName || ''} ${profileData?.lastName || ''}`}</p>
                            <p><strong>Role:</strong> {profileData?.currentRole || 'Not specified'}</p>
                            <p><strong>Skills:</strong> {profileData?.skills?.join(', ') || 'None listed'}</p>
                        </div>
                    </div>

                    <div style={styles.jobDescriptionSection}>
                        <label htmlFor="job-description" style={styles.label}>Job Description</label>
                        <textarea
                            id="job-description"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the job description here to analyze your profile match..."
                            style={styles.textarea}
                            rows={8}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.submitButton,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Analyzing...' : 'Calculate Score'}
                    </button>

                    <a href="/candidate/edit-profile" style={styles.backLink}>Back to Edit Profile</a>
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
    profileSummary: {
        padding: '1.5rem',
        backgroundColor: '#F3F4F6',
        borderRadius: '8px',
        border: '1px solid #E5E7EB'
    },
    summaryTitle: {
        fontSize: '1.1rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: '#374151'
    },
    summaryContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        color: '#4B5563',
        fontSize: '0.95rem'
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
    },
    loading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: '#6B7280'
    }
};

export default CandidateATSCheck;
