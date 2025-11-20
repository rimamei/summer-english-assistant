import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component that catches and handles React errors
 * Prevents the entire app from crashing when an error occurs
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // You could also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Reload the extension by re-initializing
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#fff',
            border: '2px solid #ef4444',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '500px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 2147483647,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            pointerEvents: 'auto',
          }}
        >
          <h2
            style={{
              color: '#ef4444',
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '12px',
              marginTop: 0,
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              color: '#6b7280',
              fontSize: '14px',
              marginBottom: '16px',
              lineHeight: '1.5',
            }}
          >
            The Summer English AI extension encountered an error. This could be due to a conflict with
            the page or a temporary issue.
          </p>
          <details
            style={{
              marginBottom: '16px',
              fontSize: '12px',
              color: '#374151',
            }}
          >
            <summary
              style={{
                cursor: 'pointer',
                fontWeight: '500',
                marginBottom: '8px',
              }}
            >
              Error Details
            </summary>
            <pre
              style={{
                backgroundColor: '#f3f4f6',
                padding: '12px',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '200px',
                fontSize: '11px',
                fontFamily: 'monospace',
              }}
            >
              {this.state.error?.toString()}
              {'\n\n'}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button
            onClick={this.handleReset}
            style={{
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseOut={e => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
          >
            Reload Extension
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
