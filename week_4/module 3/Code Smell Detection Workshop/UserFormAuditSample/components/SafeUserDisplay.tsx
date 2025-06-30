import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

interface SafeUserDisplayProps {
  html: string;
  allowedTags?: string[];
  allowedAttributes?: string[];
  fallbackText?: string;
}

/**
 * @component SafeUserDisplay
 * @description Secure component that sanitizes HTML content before rendering
 * to prevent XSS attacks while allowing safe HTML formatting.
 * 
 * @param {string} html - The HTML string to be sanitized and rendered
 * @param {string[]} allowedTags - Array of allowed HTML tags (default: basic formatting)
 * @param {string[]} allowedAttributes - Array of allowed HTML attributes
 * @param {string} fallbackText - Text to display if sanitization fails
 * 
 * @returns {React.ReactElement} A div element with sanitized HTML content
 */
const SafeUserDisplay: React.FC<SafeUserDisplayProps> = ({
  html,
  allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  allowedAttributes = ['class', 'id'],
  fallbackText = 'Content could not be displayed safely.'
}) => {
  const [sanitizedHtml, setSanitizedHtml] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    try {
      // Input validation - check for basic security concerns
      if (!html || typeof html !== 'string') {
        setHasError(true);
        return;
      }

      // Length validation to prevent DoS attacks
      if (html.length > 10000) {
        setHasError(true);
        return;
      }

      // Configure DOMPurify with strict settings
      const config = {
        ALLOWED_TAGS: allowedTags,
        ALLOWED_ATTR: allowedAttributes,
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
        KEEP_CONTENT: true,
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_TRUSTED_TYPE: false,
      };

      // Sanitize the HTML content
      const clean = DOMPurify.sanitize(html, config);
      
      // Additional validation - ensure no script tags remain
      if (clean.includes('<script') || clean.includes('javascript:')) {
        setHasError(true);
        return;
      }

      setSanitizedHtml(clean);
      setHasError(false);
    } catch (error) {
      console.error('HTML sanitization failed:', error);
      setHasError(true);
    }
  }, [html, allowedTags, allowedAttributes]);

  if (hasError) {
    return (
      <div className="safe-user-display-error">
        <p>{fallbackText}</p>
      </div>
    );
  }

  return (
    <div 
      className="safe-user-display"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default SafeUserDisplay; 