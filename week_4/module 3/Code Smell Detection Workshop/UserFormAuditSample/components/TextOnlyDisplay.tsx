import React from 'react';

interface TextOnlyDisplayProps {
  content: string;
  maxLength?: number;
  showEllipsis?: boolean;
}

/**
 * @component TextOnlyDisplay
 * @description Completely safe component that displays content as plain text only.
 * This is the safest option when HTML rendering is not required.
 * 
 * @param {string} content - The text content to display
 * @param {number} maxLength - Maximum length before truncation
 * @param {boolean} showEllipsis - Whether to show "..." when truncated
 * 
 * @returns {React.ReactElement} A div element with escaped text content
 */
const TextOnlyDisplay: React.FC<TextOnlyDisplayProps> = ({
  content,
  maxLength,
  showEllipsis = true
}) => {
  // Input validation
  if (!content || typeof content !== 'string') {
    return <div className="text-only-display">No content available</div>;
  }

  // Length validation to prevent DoS attacks
  if (content.length > 50000) {
    return <div className="text-only-display">Content too large to display</div>;
  }

  // HTML entity escaping function
  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // Process content
  let processedContent = escapeHtml(content);
  
  if (maxLength && processedContent.length > maxLength) {
    processedContent = processedContent.substring(0, maxLength);
    if (showEllipsis) {
      processedContent += '...';
    }
  }

  return (
    <div 
      className="text-only-display"
      style={{ 
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        lineHeight: '1.5'
      }}
    >
      {processedContent}
    </div>
  );
};

export default TextOnlyDisplay; 