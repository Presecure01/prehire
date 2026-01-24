import axios from 'axios';
import API_ENDPOINTS from '../config/api';

// Create axios instance with default config
const apiClient = axios.create({
    timeout: 30000, // 30 second timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - add auth token to all requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error status
            const { status } = error.response;

            if (status === 401) {
                // Unauthorized - clear token and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login' && window.location.pathname !== '/candidate/login' && window.location.pathname !== '/employer/login') {
                    window.location.href = '/login';
                }
            } else if (status === 403) {
                // Forbidden
                console.error('Access denied');
            } else if (status >= 500) {
                // Server error
                console.error('Server error:', error.response.data);
            }
        } else if (error.request) {
            // Request made but no response
            console.error('Network error - no response from server');
        } else {
            // Something else happened
            console.error('Request error:', error.message);
        }

        return Promise.reject(error);
    }
);

// Helper function to get full URL
export const getApiUrl = (path) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    return path.startsWith('http') ? path : `${baseUrl}${path}`;
};

export { API_ENDPOINTS };
export default apiClient;
