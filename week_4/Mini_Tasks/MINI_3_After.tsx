// --- Refactored Function ---
/**
 * Processes a user object, transforms its data, and updates a form.
 * This function prepares user data for display or submission by filtering roles,
 * creating a mock email hash, and safely accessing organization data.
 * It performs a batch update on the form to ensure efficiency.
 *
 * @param {IUser} user - The user object to process.
 * @param {number} index - The index of the user in the form's user array.
 *
 * @example
 * const mockUser = {
 *   id: '123',
 *   firstName: 'Jane',
 *   lastName: 'Doe',
 *   email: 'jane.doe@example.com',
 *   roles: [
 *     { name: 'USER', groupName: 'SPICE' },
 *     { name: 'SUPER_ADMIN', groupName: 'SPICE' }
 *   ],
 *   organizations: [{ tenantId: 'acme-corp' }]
 * };
 * processUserForForm(mockUser, 0);
 * // Console will log form changes and the exclusion of SUPER_ADMIN role.
 */
function processUserForForm(user: IUser, index: number): void {
  const blockedRoles = ['SUPER_ADMIN', 'REPORT_ADMIN'];
  const targetGroup = 'SPICE';
// ... existing code ...
} 