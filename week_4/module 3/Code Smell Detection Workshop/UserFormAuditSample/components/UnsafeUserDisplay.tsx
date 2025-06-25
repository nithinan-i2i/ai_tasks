import React from 'react';

// 🚨 Insecure component: XSS risk
/**
 * @component UnsafeUserDisplay
 * @description 🚨 **SECURITY WARNING:** This component is intentionally insecure and demonstrates
 * a common Cross-Site Scripting (XSS) vulnerability. It uses `dangerouslySetInnerHTML`
 * to render raw HTML without sanitization.
 *
 * @param {{html: string}} props - The component props.
 * @returns {React.ReactElement} A div element rendering the potentially malicious HTML.
 */
const UnsafeUserDisplay = ({ html }: { html: string }) => (
  <div dangerouslySetInnerHTML={{ __html: html }} />
);

export default UnsafeUserDisplay; 