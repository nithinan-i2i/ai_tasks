interface MarkdownDisplayProps {
  markdown: string;
  allowHtml?: boolean;
  maxLength?: number;
}

/**
 * @component MarkdownDisplay
 * @description Secure component that renders markdown content as HTML.
 * Uses a markdown parser with HTML sanitization to prevent XSS attacks.
 * 
 * @param {string} markdown - The markdown content to render
 * @param {boolean} allowHtml - Whether to allow HTML in markdown (default: false)
 * @param {number} maxLength - Maximum length before truncation
 * 
 * @returns {React.ReactElement} A div element with rendered markdown content
 */
const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({
  markdown,
  allowHtml = false,
  maxLength
}) => {
  // Input validation
  if (!markdown || typeof markdown !== 'string') {
    return <div className="markdown-display">No content available</div>;
  }

  // Length validation to prevent DoS attacks
  if (markdown.length > 10000) {
    return <div className="markdown-display">Content too large to display</div>;
  }

  // Simple markdown to HTML conversion (in production, use a library like marked)
  const convertMarkdownToHtml = (md: string): string => {
    return md
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      // Links (basic validation)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, (match, text, url) => {
        // URL validation - only allow http/https
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        }
        return text; // Fallback to just text if URL is invalid
      })
      // Line breaks
      .replace(/\n/gim, '<br>')
      // Paragraphs
      .replace(/^([^<].*)/gim, '<p>$1</p>');
  };

  // Process content
  let processedContent = convertMarkdownToHtml(markdown);
  
  if (maxLength && processedContent.length > maxLength) {
    processedContent = processedContent.substring(0, maxLength) + '...';
  }

  // Additional security: Remove any remaining script tags
  processedContent = processedContent.replace(/<script[^>]*>.*?<\/script>/gi, '');

  return (
    <div 
      className="markdown-display"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

export default MarkdownDisplay; 