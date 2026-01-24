import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });

        // TODO: Send error to logging service (e.g., Sentry)
        // logErrorToService(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={styles.container}>
                    <div style={styles.content}>
                        <h1 style={styles.title}>Oops! Something went wrong</h1>
                        <p style={styles.message}>
                            We're sorry for the inconvenience. The application encountered an unexpected error.
                        </p>

                        <button
                            style={styles.button}
                            onClick={() => window.location.reload()}
                        >
                            Reload Page
                        </button>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={styles.details}>
                                <summary style={styles.summary}>Error Details (Development Only)</summary>
                                <pre style={styles.errorStack}>
                                    {this.state.error.toString()}
                                    {'\n\n'}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F9FAFB',
        padding: '20px'
    },
    content: {
        maxWidth: '600px',
        background: 'white',
        padding: '48px 32px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center'
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '16px'
    },
    message: {
        fontSize: '16px',
        color: '#6B7280',
        marginBottom: '32px',
        lineHeight: '1.6'
    },
    button: {
        background: '#3B82F6',
        color: 'white',
        border: 'none',
        padding: '12px 32px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background 0.2s'
    },
    details: {
        marginTop: '32px',
        textAlign: 'left',
        background: '#F9FAFB',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #E5E7EB'
    },
    summary: {
        cursor: 'pointer',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '12px'
    },
    errorStack: {
        fontSize: '12px',
        color: '#6B7280',
        overflow: 'auto',
        maxHeight: '300px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
    }
};

export default ErrorBoundary;
