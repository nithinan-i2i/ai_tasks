import React from 'react';
import UnsafeUserDisplay from './components/UnsafeUserDisplay';
import { mockUserAdvanced, mockUserSimple } from './mocks';
import { autoPopulateUserData } from './utils';

// =================== Main Component ===================
/**
 * @component AuditSample
 * @description The main component of the module, serving as an entry point to
 * demonstrate the functionality and issues within this file.
 * @returns {React.ReactElement} The rendered component for the user audit test.
 */
export default function AuditSample() {
  React.useEffect(() => {
    autoPopulateUserData(mockUserSimple, 0);
    autoPopulateUserData(mockUserAdvanced, 1, { skipValidation: true });
  }, []);

  return (
    <div>
      <h2>User Audit Test</h2>
      <UnsafeUserDisplay html={`<img src=x onerror=alert('XSS') />`} />
      <p>Loaded mock user data.</p>
    </div>
  );
} 