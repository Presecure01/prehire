import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import Navbar from '../components/common/Navbar';

const CandidateWelcome = () => {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <Navbar />



      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>Welcome back, {user?.name || 'User'}!</h1>
          
          <div style={styles.message}>
            <p style={styles.messageText}>
              Your resume has been shared with the recruiter.
            </p>
            <p style={styles.messageSubtext}>
              Now sit back and relax, they'll reach out if it's a match.
            </p>
          </div>

          <div style={styles.actions}>
            <Link to="/candidate" style={styles.viewProfileBtn}>
              View Your Profile
            </Link>
            <button style={styles.referBtn}>
              Refer a Friend
            </button>
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 80px)',
    padding: '2rem',
    marginTop: 80
  },
  content: {
    textAlign: 'center',
    maxWidth: '600px'
  },
  title: {
    fontSize: '3rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '2rem'
  },
  message: {
    marginBottom: '3rem'
  },
  messageText: {
    fontSize: '1.2rem',
    color: '#374151',
    marginBottom: '0.5rem',
    fontWeight: '500'
  },
  messageSubtext: {
    fontSize: '1.2rem',
    color: '#6B7280',
    margin: 0
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  viewProfileBtn: {
    textDecoration: 'none',
    backgroundColor: '#3B82F6',
    color: 'white',
    padding: '1rem 2rem',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    minWidth: '200px',
    display: 'inline-block'
  },
  referBtn: {
    backgroundColor: 'transparent',
    color: '#374151',
    border: '2px solid #D1D5DB',
    padding: '1rem 2rem',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    minWidth: '200px'
  }
};

export default CandidateWelcome;
