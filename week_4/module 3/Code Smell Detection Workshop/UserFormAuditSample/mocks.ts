import { IUser, UserRole } from "./types";

// =================== Mock Users ===================
/**
 * @const {IUser} mockUserSimple
 * @description A mock user object for basic testing scenarios. Note the `id` field
 * contains a mock SQL injection string for backend demonstration purposes.
 */
export const mockUserSimple: IUser = {
  id: '1;DROP TABLE users',
  firstName: 'Alice',
  lastName: 'Doe',
  email: 'alice@example.com',
  phoneNumber: '9876543210',
  countryCode: '91',
  gender: 'female',
  roles: [{ name: UserRole.CHP, suiteAccessName: 'mob', groupName: UserRole.SPICE }],
  organizations: [{ id: 1, name: 'HF A', formName: 'healthfacility', tenantId: 10 }],
  supervisor: 'spv1',
  villages: [],
  timezone: { id: 'Asia/Kolkata', description: 'IST' },
  culture: { id: 1, name: 'Culture B' }, // Example Culture
  designation: { id: 1, name: 'Nurse' },
};

/**
 * @const {IUser} mockUserAdvanced
 * @description A mock user object representing a more complex user profile.
 */
export const mockUserAdvanced: IUser = {
  id: 'admin123',
  firstName: 'Bob',
  lastName: 'Smith',
  email: 'bob@example.com',
  phoneNumber: '1111111111',
  countryCode: '91',
  gender: 'male',
  roles: [
    { name: UserRole.SUPER_ADMIN, suiteAccessName: 'web', groupName: UserRole.SPICE },
    { name: UserRole.CHP, suiteAccessName: 'mob', groupName: UserRole.SPICE },
  ],
  organizations: [
    { id: 10, name: 'Main Org', formName: 'hf', tenantId: 99 },
    { id: 11, name: 'Secondary Org', formName: 'chp', tenantId: 99 },
  ],
  supervisor: 'supv99',
  villages: [{ id: 1, name: 'Village 1' }, { id: 2, name: 'Village 2' }],
  timezone: { id: 'Asia/Kolkata', description: 'IST' },
  culture: { id: 1, name: 'Culture A' },
  designation: { id: 2, name: 'Supervisor' },
}; 