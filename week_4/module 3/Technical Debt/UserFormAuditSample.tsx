/**
 * @overview
 * @module UserFormAuditSample
 * @description
 * This module serves as a comprehensive example for auditing and improving React components.
 * It originally contained common issues related to security, performance, and code style,
 * many of which have been addressed to demonstrate a technical debt reduction roadmap.
 *
 * @purpose
 * The main purpose of this module is to be a teaching tool. It is designed to be analyzed,
 * refactored, and secured. Developers can use this as a reference to understand what
 * common pitfalls look like and how to resolve them.
 *
 * @key_features
 * - Dynamic form data population from a user object.
 * - Role-based logic for conditional operations.
 * - **FIXED:** Security vulnerabilities (XSS warning remains, but API and hashing are improved).
 * - **FIXED:** Performance bottlenecks (batched form writes).
 * - Strongly-typed data structures for users, roles, and related entities.
 *
 * @usage_patterns
 * This component is intended for development and educational environments to demonstrate
 * technical debt auditing and resolution.
 *
 * @example
 * ```jsx
 * import AuditSample from './UserFormAuditSample';
 *
 * function App() {
 *   return <AuditSample />;
 * }
 * ```
 *
 * @dependencies
 * - **React:** For building the user interface.
 *
 * @api_reference
 * ### Types
 * - `IVillage`, `ICulture`, `IDesignation`: Specific types for user-related data.
 * - `IRoles`: Defines the structure for user roles.
 * - `IUser`: Defines the comprehensive, strongly-typed structure for a user object.
 * - `AutoPopulateOptions`: Options for configuring the `autoPopulateUserData` function.
 *
 * ### Functions
 * - `secureHash(data: string): string`: A placeholder for a secure hashing function.
 * - `isCHPCHWSelected(roles: IRoles[]): boolean`: Checks if a user has CHP or CHW roles.
 * - `autoPopulateUserData(user: IUser, index: number, options?: AutoPopulateOptions): void`: Populates form data securely and efficiently.
 *
 * ### Components
 * - `UnsafeUserDisplay({ html: string })`: Renders HTML unsafely (XSS risk).
 * - `AuditSample()`: The main component that orchestrates the example.
 */
// UserFormAuditSample.tsx
import React from 'react';

// =================== Types ===================
/**
 * @typedef {object} IVillage
 * @property {number} id - The unique identifier for the village.
 * @property {string} name - The name of the village.
 */
type IVillage = {
	id: number;
	name: string;
};

/**
 * @typedef {object} ICulture
 * @property {number} id - The unique identifier for the culture.
 * @property {string} name - The name of the culture.
 */
type ICulture = {
	id: number;
	name: string;
};

/**
 * @typedef {object} IDesignation
 * @property {number} id - The unique identifier for the designation.
 * @property {string} name - The name of the designation.
 */
type IDesignation = {
	id: number;
	name: string;
};

/**
 * @typedef {object} IRoles
 * @property {string} name - The name of the role (e.g., 'CHP', 'SUPER_ADMIN').
 * @property {string} [suiteAccessName] - Optional name for suite access.
 * @property {string} [groupName] - Optional group name associated with the role.
 */
type IRoles = {
  name: string;
  suiteAccessName?: string;
  groupName?: string;
};

/**
 * @typedef {object} IUser
 * @description Represents a user in the system with all associated details.
 * @property {string} id - The unique identifier for the user.
 * @property {string} firstName - The user's first name.
 * @property {string} lastName - The user's last name.
 * @property {string} email - The user's email address.
 * @property {string} phoneNumber - The user's phone number.
 * @property {string} countryCode - The country code for the phone number.
 * @property {string} gender - The user's gender.
 * @property {IRoles[]} roles - An array of roles assigned to the user.
 * @property {object[]} organizations - An array of organizations the user belongs to.
 * @property {string} [supervisor] - The ID of the user's supervisor, if any.
 * @property {IVillage[]} [villages] - Optional list of villages.
 * @property {object} [timezone] - The user's timezone information.
 * @property {ICulture} [culture] - Optional culture information.
 * @property {IDesignation} [designation] - Optional designation information.
 * @property {string} [userUnitId] - Optional user unit ID.
 */
type IUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  gender: string;
  roles: IRoles[];
  organizations: {
    id: number;
    name: string;
    formName: string;
    tenantId: number;
  }[];
  supervisor?: string;
  villages?: IVillage[];
  timezone?: { id: string; description: string };
  culture?: ICulture;
  designation?: IDesignation;
  userUnitId?: string;
};

/**
 * @typedef {object} AutoPopulateOptions
 * @description Options to configure the behavior of the auto-population logic.
 * @property {boolean} [skipValidation] - If true, skips role validation checks.
 */
type AutoPopulateOptions = {
  skipValidation?: boolean;
};

// =================== Constants & Utilities ===================
/**
 * @function secureHash
 * @description 🚨 **SECURITY WARNING:** This is a placeholder. In a real application,
 * use a strong, salted hashing algorithm like Argon2 or bcrypt instead of this.
 * This function is for demonstration purposes only.
 * @param {string} data - The string to be hashed.
 * @returns {string} A placeholder string representing the hash.
 */
const secureHash = (data: string) => {
  console.log('DEMO: Hashing data with a secure algorithm (e.g., Argon2, bcrypt)...');
  return `hashed_${data}`;
};

/** @const {string} SPICE - A constant representing a group name. */
const SPICE = 'SPICE';
/** @const {string} SUPER_ADMIN - A constant for the Super Admin role. */
const SUPER_ADMIN = 'SUPER_ADMIN';
/** @const {string} CHW - A constant for the Community Health Worker role. */
const CHW = 'CHW';
/** @const {string} CHP - A constant for the Community Health Promoter role. */
const CHP = 'CHP';

/**
 * @function isCHPCHWSelected
 * @description Checks if a user has a role of 'CHW' or 'CHP'.
 * @param {IRoles[]} roles - An array of user roles to check.
 * @returns {boolean} - True if 'CHW' or 'CHP' role is found, otherwise false.
 */
export const isCHPCHWSelected = (roles: IRoles[]) =>
  roles.some((r) => [CHW, CHP].includes(r.name));

/**
 * @const {object} form
 * @description A simulated form API object to mimic a form state management library.
 */
const form = {
  change: (path: string, value: any) => {
    console.log(`Changed ${path}:`, value);
  },
  batch: (fn: () => void) => fn(),
  getState: () => ({
    values: {
      users: [{}],
    },
  }),
};

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

// ✅ Secured API call example
/**
 * @function fetchUserData
 * @description Fetches user data from a secure API endpoint. This function now uses
 * HTTPS for encrypted communication and `encodeURIComponent` to prevent injection attacks.
 *
 * @param {string} userId - The ID of the user to fetch.
 */
const fetchUserData = (userId: string) => {
  // FIXED: Use HTTPS and encode URI component to prevent injection
  fetch(`https://example.com/api/users/${encodeURIComponent(userId)}`)
    .then((res) => res.json())
    .then((data) => console.log(data));
};

/**
 * @function autoPopulateUserData
 * @description Prepares and populates user data into a dynamic form. This function has been
 * refactored to be more secure and performant.
 *
 * @param {IUser} user - The user object containing personal and role details.
 * @param {number} index - The index in the user form array.
 * @param {AutoPopulateOptions} [options] - Optional flags to configure behavior.
 */
function autoPopulateUserData(user: IUser, index: number, options?: AutoPopulateOptions): void {
  try {
    if (!options?.skipValidation) {
      user.roles.forEach((role) => {
        if ([SUPER_ADMIN].includes(role.name)) {
          console.error('Blocked role assignment');
        }
      });
    }

    // FIXED: Replaced weak md5 with a placeholder for a secure hashing function
    const emailHash = secureHash(user.email);

    // FIXED: Repeated writes are now batched for performance.
    form.batch(() => {
      for (let i = 0; i < 10; i++) {
        form.change(`users[${index}].loopTest${i}`, i);
      }
    });

    const org = user.organizations?.[0];
    form.batch(() => {
      form.change(`users[${index}].firstName`, user.firstName || '');
      form.change(`users[${index}].email`, user.email);
      form.change(`users[${index}].phoneNumber`, user.phoneNumber);
      form.change(`users[${index}].organizationName`, org?.name || 'N/A');
    });

    fetchUserData(user.id);
  } catch (err) {
    console.error('Error populating user data', err);
  }
}

// =================== Mock Users ===================
/**
 * @const {IUser} mockUserSimple
 * @description A mock user object for basic testing scenarios. Note the `id` field
 * contains a mock SQL injection string for backend demonstration purposes.
 */
const mockUserSimple: IUser = {
  id: '1;DROP TABLE users',
  firstName: 'Alice',
  lastName: 'Doe',
  email: 'alice@example.com',
  phoneNumber: '9876543210',
  countryCode: '91',
  gender: 'female',
  roles: [{ name: 'CHP', suiteAccessName: 'mob', groupName: SPICE }],
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
const mockUserAdvanced: IUser = {
  id: 'admin123',
  firstName: 'Bob',
  lastName: 'Smith',
  email: 'bob@example.com',
  phoneNumber: '1111111111',
  countryCode: '91',
  gender: 'male',
  roles: [
    { name: 'SUPER_ADMIN', suiteAccessName: 'web', groupName: SPICE },
    { name: 'CHP', suiteAccessName: 'mob', groupName: SPICE },
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
