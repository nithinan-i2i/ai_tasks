import React, { useState, useEffect } from 'react';
import { 
  validateProductTitle, 
  validateProductDescription, 
  validateInputLength,
  escapeHtml,
  logSecurityEvent 
} from 'utils/security';

// ✅ SECURE COMPONENT: Safe content display with XSS prevention

interface SecureDisplayProps {
  content: string;
  type: 'title' | 'description' | 'text' | 'html';
  maxLength?: number;
  className?: string;
  fallbackText?: string;
  onValidationError?: (error: string) => void;
}

/**
 * ✅ SECURE COMPONENT: SecureDisplay
 * 
 * A secure React component for displaying user-generated content with comprehensive
 * XSS prevention, input validation, and security monitoring.
 * 
 * Features:
 * - HTML entity escaping to prevent XSS attacks
 * - Input validation and sanitization
 * - Length limits to prevent DoS attacks
 * - Security event logging
 * - Fallback content for invalid input
 * - Type-specific validation rules
 */
const SecureDisplay: React.FC<SecureDisplayProps> = ({
  content,
  type,
  maxLength = 1000,
  className = '',
  fallbackText = 'Content could not be displayed safely.',
  onValidationError
}) => {
  const [displayContent, setDisplayContent] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    try {
      // ✅ SECURITY: Input validation based on content type
      let validationResult;
      
      switch (type) {
        case 'title':
          validationResult = validateProductTitle(content);
          break;
        case 'description':
          validationResult = validateProductDescription(content);
          break;
        case 'text':
          validationResult = validateInputLength(content, maxLength);
          break;
        case 'html':
          // For HTML content, we escape everything for maximum security
          validationResult = validateInputLength(content, maxLength);
          if (validationResult.isValid) {
            validationResult.sanitizedValue = escapeHtml(content);
          }
          break;
        default:
          validationResult = { isValid: false, error: 'Invalid content type' };
      }

      if (validationResult.isValid && validationResult.sanitizedValue) {
        setDisplayContent(validationResult.sanitizedValue);
        setIsValid(true);
        setValidationError('');
        
        // ✅ SECURITY: Log successful validation
        logSecurityEvent('content_validated', {
          type,
          contentLength: content.length,
          timestamp: new Date()
        });
      } else {
        setIsValid(false);
        setValidationError(validationResult.error || 'Content validation failed');
        setDisplayContent('');
        
        // ✅ SECURITY: Log validation failure
        logSecurityEvent('content_validation_failed', {
          type,
          error: validationResult.error,
          contentLength: content.length,
          timestamp: new Date()
        });
        
        // Notify parent component of validation error
        if (onValidationError) {
          onValidationError(validationResult.error || 'Content validation failed');
        }
      }
    } catch (error) {
      // ✅ SECURITY: Handle unexpected errors gracefully
      setIsValid(false);
      setValidationError('An unexpected error occurred while processing content');
      setDisplayContent('');
      
      logSecurityEvent('content_processing_error', {
        type,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      
      if (onValidationError) {
        onValidationError('An unexpected error occurred while processing content');
      }
    }
  }, [content, type, maxLength, onValidationError]);

  // ✅ SECURITY: Render fallback content for invalid input
  if (!isValid) {
    return (
      <div 
        className={`secure-display-error ${className}`}
        style={{
          color: '#dc3545',
          fontStyle: 'italic',
          padding: '8px',
          border: '1px solid #dc3545',
          borderRadius: '4px',
          backgroundColor: '#f8d7da'
        }}
      >
        <span role="alert" aria-live="polite">
          {fallbackText}
        </span>
        {process.env.NODE_ENV === 'development' && (
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            Validation error: {validationError}
          </div>
        )}
      </div>
    );
  }

  // ✅ SECURITY: Render validated content safely
  return (
    <div 
      className={`secure-display ${className}`}
      style={{
        wordBreak: 'break-word',
        lineHeight: '1.5'
      }}
    >
      {type === 'html' ? (
        // ✅ SECURITY: For HTML content, use dangerouslySetInnerHTML with sanitized content
        <div 
          dangerouslySetInnerHTML={{ __html: displayContent }}
          style={{
            // Additional CSS to prevent layout attacks
            maxWidth: '100%',
            overflowWrap: 'break-word'
          }}
        />
      ) : (
        // ✅ SECURITY: For text content, render directly (already escaped)
        <span>{displayContent}</span>
      )}
    </div>
  );
};

export default SecureDisplay; 