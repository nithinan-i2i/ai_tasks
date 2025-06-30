import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logSecurityEvent } from 'utils/security';

// ✅ ERROR BOUNDARY: Comprehensive error handling for React components

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

/**
 * ✅ ERROR BOUNDARY: ErrorBoundary
 * 
 * A comprehensive error boundary component that catches JavaScript errors
 * anywhere in the child component tree and displays a fallback UI.
 * 
 * Features:
 * - Catches JavaScript errors in child components
 * - Logs errors for debugging and monitoring
 * - Displays user-friendly error messages
 * - Provides error recovery options
 * - Security event logging for suspicious errors
 * - Development mode with detailed error information
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: this.generateErrorId()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // ✅ SECURITY: Log the error for debugging and monitoring
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);
    
    this.setState({ errorInfo });

    // ✅ SECURITY: Log security events for suspicious errors
    this.logSecurityEvent(error, errorInfo);

    // ✅ SECURITY: Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // ✅ SECURITY: In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      console.error('Production error logged:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId
      });
    }
  }

  // ✅ NEW: Generate unique error ID for tracking
  private static generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ✅ NEW: Log security events for suspicious errors
  private logSecurityEvent(error: Error, errorInfo: ErrorInfo): void {
    const errorMessage = error.message.toLowerCase();
    const suspiciousPatterns = [
      'xss',
      'script',
      'javascript',
      'eval',
      'innerhtml',
      'dangerouslysetinnerhtml',
      'sql injection',
      'csrf',
      'authentication',
      'authorization'
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => 
      errorMessage.includes(pattern)
    );

    if (isSuspicious) {
      logSecurityEvent('suspicious_error_detected', {
        errorMessage: error.message,
        errorStack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        timestamp: new Date()
      });
    }
  }

  // ✅ NEW: Handle error recovery
  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  // ✅ NEW: Handle page refresh
  private handleRefresh = (): void => {
    window.location.reload();
  };

  // ✅ NEW: Handle going back
  private handleGoBack = (): void => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      // ✅ SECURITY: Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // ✅ SECURITY: Default error UI
      return (
        <div 
          className="error-boundary"
          style={{
            padding: '20px',
            margin: '20px',
            border: '2px solid #dc3545',
            borderRadius: '8px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            textAlign: 'center'
          }}
          role="alert"
          aria-live="polite"
        >
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>
              ⚠️ Something went wrong
            </h2>
            <p style={{ margin: '0', fontSize: '16px' }}>
              We encountered an unexpected error. Please try one of the options below.
            </p>
          </div>

          {/* ✅ SECURITY: Error recovery options */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              aria-label="Try again"
            >
              🔄 Try Again
            </button>
            
            <button
              onClick={this.handleGoBack}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              aria-label="Go back to previous page"
            >
              ← Go Back
            </button>
            
            <button
              onClick={this.handleRefresh}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              aria-label="Refresh the page"
            >
              🔄 Refresh Page
            </button>
          </div>

          {/* ✅ SECURITY: Development mode error details */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ 
              marginTop: '20px', 
              textAlign: 'left',
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '4px',
              border: '1px solid #dee2e6'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
                🔍 Error Details (Development Mode)
              </summary>
              
              <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Error ID:</strong> {this.state.errorId}
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <strong>Error Message:</strong>
                  <div style={{ 
                    backgroundColor: '#fff', 
                    padding: '8px', 
                    borderRadius: '4px',
                    border: '1px solid #ced4da',
                    marginTop: '5px'
                  }}>
                    {this.state.error.message}
                  </div>
                </div>
                
                {this.state.error.stack && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Error Stack:</strong>
                    <div style={{ 
                      backgroundColor: '#fff', 
                      padding: '8px', 
                      borderRadius: '4px',
                      border: '1px solid #ced4da',
                      marginTop: '5px',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}>
                      <pre style={{ margin: '0', whiteSpace: 'pre-wrap' }}>
                        {this.state.error.stack}
                      </pre>
                    </div>
                  </div>
                )}
                
                {this.state.errorInfo && (
                  <div>
                    <strong>Component Stack:</strong>
                    <div style={{ 
                      backgroundColor: '#fff', 
                      padding: '8px', 
                      borderRadius: '4px',
                      border: '1px solid #ced4da',
                      marginTop: '5px',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}>
                      <pre style={{ margin: '0', whiteSpace: 'pre-wrap' }}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* ✅ SECURITY: Contact support information */}
          <div style={{ 
            marginTop: '20px', 
            fontSize: '14px',
            opacity: 0.8
          }}>
            <p style={{ margin: '0' }}>
              If the problem persists, please contact support with Error ID: 
              <strong> {this.state.errorId}</strong>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 