import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ProfileUnlock from './ProfileUnlock';
import './SearchCandidates.css';
import { API_ENDPOINTS } from '../utils/apiClient';

const SearchCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [facets, setFacets] = useState({});

  const [filters, setFilters] = useState({
    search: '',
    experience: 'all',
    location: 'all',
    education: 'all',
    minScore: '',
    maxScore: '',
    skills: '',
    sortBy: 'relevance'
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [savedCandidates, setSavedCandidates] = useState(new Set());
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Debounced search function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      if (searchTerm.length > 2) {
        fetchSuggestions(searchTerm);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchFacets();
    handleSearch(1);
  }, []);

  useEffect(() => {
    if (filters.search) {
      debouncedSearch(filters.search);
    }
  }, [filters.search, debouncedSearch]);

  const fetchFacets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_ENDPOINTS.RECRUITER.FACETS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFacets(response.data);
    } catch (error) {
      console.error('Error fetching facets:', error);
    }
  };

  const fetchSuggestions = async (query) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_ENDPOINTS.RECRUITER.SUGGESTIONS}?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSearch = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          queryParams.append(key, value);
        }
      });

      queryParams.append('page', page);
      queryParams.append('limit', 20);

      const response = await axios.get(`${API_ENDPOINTS.RECRUITER.SEARCH}?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCandidates(response.data.candidates || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Search error:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key !== 'search') {
      handleSearch(1);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const text = typeof suggestion === 'object' ? suggestion.text : suggestion;
    setFilters(prev => ({ ...prev, search: text }));
    setShowSuggestions(false);
    setTimeout(() => handleSearch(1), 100);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      experience: 'all',
      location: 'all',
      education: 'all',
      minScore: '',
      maxScore: '',
      skills: '',
      sortBy: 'relevance'
    });
    setTimeout(() => handleSearch(1), 100);
  };

  const toggleSaveCandidate = (candidateId) => {
    const newSaved = new Set(savedCandidates);
    if (newSaved.has(candidateId)) {
      newSaved.delete(candidateId);
    } else {
      newSaved.add(candidateId);
    }
    setSavedCandidates(newSaved);
  };

  const handleUnlockProfile = (candidate) => {
    setSelectedCandidate(candidate);
    setShowUnlockModal(true);
  };

  const handleUnlockSuccess = (unlockedProfile) => {
    // Update the candidate in the list with unlocked data
    setCandidates(prev => prev.map(c =>
      c._id === unlockedProfile._id ? { ...c, ...unlockedProfile, unlocked: true } : c
    ));
  };

  return (
    <div style={styles.container}>
      {/* Search Header */}
      <div style={styles.searchHeader}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by name, skills, role, or keywords..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(1)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            style={styles.searchInput}
          />
          <button onClick={() => handleSearch(1)} style={styles.searchButton}>
            🔍 Search
          </button>

          {showSuggestions && suggestions.length > 0 && (
            <div style={styles.suggestions}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  style={styles.suggestionItem}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span style={styles.suggestionText}>
                    {typeof suggestion === 'object' ? suggestion.text : suggestion}
                  </span>
                  {typeof suggestion === 'object' && (
                    <span style={styles.suggestionType}>{suggestion.type}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={styles.content}>
        {/* Filters Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.filtersHeader}>
            <h3 style={styles.filtersTitle}>Filters</h3>
            <button onClick={resetFilters} style={styles.resetButton}>
              Reset All
            </button>
          </div>

          {/* Experience Filter */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Experience Level</label>
            <select
              value={filters.experience}
              onChange={(e) => handleFilterChange('experience', e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Experience</option>
              <option value="entry">Entry Level (0-2 years)</option>
              <option value="0-2">0-2 years</option>
              <option value="2-4">2-4 years</option>
              <option value="4-6">4-6 years</option>
              <option value="6+">6+ years</option>
            </select>
          </div>

          {/* Location Filter */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Location</label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Locations</option>
              {facets.locations?.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          {/* Education Filter */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Education</label>
            <select
              value={filters.education}
              onChange={(e) => handleFilterChange('education', e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Education</option>
              {facets.educations?.map(education => (
                <option key={education} value={education}>{education}</option>
              ))}
            </select>
          </div>

          {/* Skills Filter */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Skills</label>
            <input
              type="text"
              placeholder="e.g. React, Python, AWS"
              value={filters.skills}
              onChange={(e) => handleFilterChange('skills', e.target.value)}
              style={styles.filterInput}
            />
          </div>

          {/* Resume Score Range */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Resume Score Range</label>
            <div style={styles.scoreRange}>
              <input
                type="number"
                placeholder="Min"
                value={filters.minScore}
                onChange={(e) => handleFilterChange('minScore', e.target.value)}
                style={styles.scoreInput}
                min="0"
                max="100"
              />
              <span style={styles.scoreSeparator}>to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxScore}
                onChange={(e) => handleFilterChange('maxScore', e.target.value)}
                style={styles.scoreInput}
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div style={styles.resultsArea}>
          {/* Results Header */}
          <div style={styles.resultsHeader}>
            <div style={styles.resultsInfo}>
              <h2 style={styles.resultsTitle}>
                {pagination.totalCount || 0} Candidates Found
              </h2>
              {filters.search && (
                <p style={styles.searchQuery}>
                  Results for "{filters.search}"
                </p>
              )}
            </div>

            <div style={styles.sortContainer}>
              <label style={styles.sortLabel}>Sort by:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                style={styles.sortSelect}
              >
                <option value="relevance">Most Relevant</option>
                <option value="score">Resume Score</option>
                <option value="experience">Experience</option>
                <option value="recent">Recently Added</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Candidates List */}
          <div style={styles.candidatesList}>
            {loading ? (
              <div style={styles.loading}>
                <div style={styles.spinner}></div>
                <p>Searching candidates...</p>
              </div>
            ) : candidates.length === 0 ? (
              <div style={styles.noResults}>
                <div style={styles.noResultsIcon}>🔍</div>
                <h3>No candidates found</h3>
                <p>Try adjusting your search criteria or filters</p>
              </div>
            ) : (
              candidates.map((candidate) => (
                <CandidateCard
                  key={candidate._id}
                  candidate={candidate}
                  isSaved={savedCandidates.has(candidate._id)}
                  onToggleSave={() => toggleSaveCandidate(candidate._id)}
                  onUnlock={() => handleUnlockProfile(candidate)}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => handleSearch(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                style={{
                  ...styles.pageButton,
                  ...(pagination.hasPrev ? {} : styles.pageButtonDisabled)
                }}
              >
                Previous
              </button>

              <span style={styles.pageInfo}>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handleSearch(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                style={{
                  ...styles.pageButton,
                  ...(pagination.hasNext ? {} : styles.pageButtonDisabled)
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Unlock Modal */}
      {showUnlockModal && selectedCandidate && (
        <ProfileUnlock
          candidateId={selectedCandidate._id}
          onClose={() => {
            setShowUnlockModal(false);
            setSelectedCandidate(null);
          }}
          onUnlock={handleUnlockSuccess}
        />
      )}
    </div>
  );
};

const CandidateCard = ({ candidate, isSaved, onToggleSave, onUnlock }) => {

  return (
    <div style={styles.candidateCard}>
      <div style={styles.cardHeader}>
        <div style={styles.candidateAvatar}>
          {candidate.photo ? (
            <img src={candidate.photo} alt={candidate.name} style={styles.avatarImg} />
          ) : (
            <div style={styles.avatarPlaceholder}>
              {candidate.name?.charAt(0) || 'C'}
            </div>
          )}
        </div>

        <div style={styles.candidateInfo}>
          <div style={styles.candidateName}>{candidate.name}</div>
          <div style={styles.candidateRole}>{candidate.currentRole || 'Candidate'}</div>

          <div style={styles.candidateDetails}>
            {candidate.location && (
              <span style={styles.detailItem}>
                📍 {candidate.location}
              </span>
            )}
            {candidate.experienceYears && (
              <span style={styles.detailItem}>
                👤 {candidate.experienceYears} years exp
              </span>
            )}
            {candidate.education && (
              <span style={styles.detailItem}>
                🎓 {candidate.education}
              </span>
            )}
          </div>

          {candidate.skills && candidate.skills.length > 0 && (
            <div style={styles.skillsContainer}>
              {candidate.skills.slice(0, 4).map((skill, index) => (
                <span key={index} style={styles.skillTag}>
                  {skill}
                </span>
              ))}
              {candidate.skills.length > 4 && (
                <span style={styles.moreSkills}>
                  +{candidate.skills.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        <div style={styles.cardActions}>
          <button
            onClick={onToggleSave}
            style={{
              ...styles.saveButton,
              ...(isSaved ? styles.savedButton : {})
            }}
            title={isSaved ? 'Remove from saved' : 'Save candidate'}
          >
            {isSaved ? '❤️' : '🤍'}
          </button>

          {candidate.resumeScore && (
            <div style={styles.scoreContainer}>
              <div style={styles.scoreCircle}>
                <span style={styles.scoreText}>{candidate.resumeScore}</span>
              </div>
              <span style={styles.scoreLabel}>Score</span>
            </div>
          )}

          {candidate.matchPercentage && (
            <div style={styles.matchContainer}>
              <span style={styles.matchText}>{candidate.matchPercentage}% match</span>
            </div>
          )}
        </div>
      </div>

      <button onClick={onUnlock} style={styles.unlockButton}>
        {candidate.unlocked ? '✅ Profile Unlocked' : '🔓 Unlock Full Profile & Resume'}
      </button>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  searchHeader: {
    backgroundColor: 'white',
    padding: '2rem 3rem',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  searchContainer: {
    position: 'relative',
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    gap: '1rem'
  },
  searchInput: {
    flex: 1,
    padding: '1rem 1.5rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    ':focus': {
      borderColor: '#3b82f6'
    }
  },
  searchButton: {
    padding: '1rem 2rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#2563eb'
    }
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: '140px',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    zIndex: 1000,
    maxHeight: '300px',
    overflowY: 'auto'
  },
  suggestionItem: {
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ':hover': {
      backgroundColor: '#f8fafc'
    }
  },
  suggestionText: {
    fontSize: '0.95rem',
    color: '#374151'
  },
  suggestionType: {
    fontSize: '0.8rem',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px'
  },
  content: {
    display: 'flex',
    padding: '2rem 3rem',
    gap: '2rem',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  sidebar: {
    width: '320px',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.5rem',
    height: 'fit-content',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  filtersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  filtersTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },
  resetButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    cursor: 'pointer'
  },
  filterGroup: {
    marginBottom: '1.5rem'
  },
  filterLabel: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  filterSelect: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.875rem',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  filterInput: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.875rem',
    boxSizing: 'border-box'
  },
  scoreRange: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  scoreInput: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.875rem'
  },
  scoreSeparator: {
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  resultsArea: {
    flex: 1
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem'
  },
  resultsInfo: {
    flex: 1
  },
  resultsTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 0.5rem 0'
  },
  searchQuery: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0
  },
  sortContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  sortLabel: {
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  sortSelect: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    cursor: 'pointer'
  },
  candidatesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3rem',
    color: '#6b7280'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    marginBottom: '1rem'
  },
  noResults: {
    textAlign: 'center',
    padding: '3rem',
    color: '#6b7280'
  },
  noResultsIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  candidateCard: {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.2s',
    ':hover': {
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }
  },
  cardHeader: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem'
  },
  candidateAvatar: {
    width: '60px',
    height: '60px',
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
    fontSize: '1.5rem'
  },
  candidateInfo: {
    flex: 1
  },
  candidateName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.25rem'
  },
  candidateRole: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '0.75rem'
  },
  candidateDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '0.75rem'
  },
  detailItem: {
    fontSize: '0.875rem',
    color: '#6b7280'
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
  moreSkills: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontStyle: 'italic'
  },
  cardActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.5rem'
  },
  saveButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.25rem'
  },
  savedButton: {
    color: '#ef4444'
  },
  scoreContainer: {
    textAlign: 'center'
  },
  scoreCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.25rem'
  },
  scoreText: {
    color: 'white',
    fontWeight: '600',
    fontSize: '0.875rem'
  },
  scoreLabel: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  matchContainer: {
    textAlign: 'center'
  },
  matchText: {
    fontSize: '0.75rem',
    color: '#059669',
    fontWeight: '500'
  },
  unlockButton: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#2563eb'
    }
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '2rem',
    padding: '1rem'
  },
  pageButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  pageButtonDisabled: {
    backgroundColor: '#d1d5db',
    cursor: 'not-allowed'
  },
  pageInfo: {
    fontSize: '0.875rem',
    color: '#6b7280'
  }
};

export default SearchCandidates;