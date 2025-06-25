/**
 * @overview
 * @module UserFormAuditSample
 * @description
 * This module serves as a comprehensive example for auditing and improving React components.
 * It intentionally includes common issues related to security, performance, and code style
 * to provide a practical learning ground for developers. The primary component,
 * `AuditSample`, demonstrates how user data is populated into a form, highlighting
 * several anti-patterns along the way.
 *
 * @purpose
 * The main purpose of this module is to be a teaching tool. It is designed to be analyzed,
 * refactored, and secured. Developers can use this as a reference to understand what
 * common pitfalls look like in a real-world scenario and practice their auditing skills.
 *
 * @key_features
 * - Dynamic form data population from a user object.
 * - Role-based logic for conditional operations.
 * - Deliberate inclusion of security vulnerabilities (XSS, weak hashing, insecure API calls).
 * - Deliberate inclusion of performance bottlenecks (e.g., repeated writes in a loop).
 * - Examples of complex data structures for users and organizations.
 *
 * @usage_patterns
 * This component is not intended for production use in its current state. It is meant to be
 * used in development and educational environments for the following purposes:
 * 1. **Security Audits:** Identify and fix vulnerabilities like XSS, insecure API endpoints, and weak hashing.
 * 2. **Performance Optimization:** Analyze and refactor inefficient code, such as the batching of form changes.
 * 3. **Code Refactoring:** Improve code structure, readability, and maintainability.
 * 4. **Documentation Generation:** As a sample for generating comprehensive documentation.
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
 * - **md5:** A library for creating MD5 hashes (Note: MD5 is insecure for password hashing).
 *
 * @api_reference
 * ### Types
 * - `IRoles`: Defines the structure for user roles.
 * - `IUser`: Defines the comprehensive structure for a user object.
 * - `AutoPopulateOptions`: Options for configuring the `autoPopulateUserData` function.
 *
 * ### Functions
 * - `isCHPCHWSelected(roles: IRoles[]): boolean`: Checks if a user has CHP or CHW roles.
 * - `autoPopulateUserData(user: IUser, index: number, options?: AutoPopulateOptions): void`: Populates form data.
 *
 * ### Components
 * - `UnsafeUserDisplay({ html: string })`: Renders HTML unsafely (XSS risk).
 * - `AuditSample()`: The main component that orchestrates the example.
 *
 * @notes
 * The security and performance issues in this file are intentional and for demonstration purposes.
 * Do not replicate these patterns in production applications.
 */
// UserFormAuditSample.tsx
import React from 'react';
import md5 from 'md5'; // 🚨 Weak hash example

// =================== Types ===================
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
 * @property {string} id - The unique identifier for the user. Can be subject to injection if not handled carefully.
 * @property {string} firstName - The user's first name.
 * @property {string} lastName - The user's last name.
 * @property {string} email - The user's email address. Used for generating an MD5 hash.
 * @property {string} phoneNumber - The user's phone number.
 * @property {string} countryCode - The country code for the phone number.
 * @property {string} gender - The user's gender.
 * @property {IRoles[]} roles - An array of roles assigned to the user.
 * @property {object[]} organizations - An array of organizations the user belongs to.
 * @property {number} organizations.id - The organization's ID.
 * @property {string} organizations.name - The organization's name.
 * @property {string} organizations.formName - The form name associated with the organization.
 * @property {number} organizations.tenantId - The tenant ID for the organization.
 * @property {string} [supervisor] - The ID of the user's supervisor, if any.
 * @property {any[]} [villages] - Optional list of villages.
 * @property {object} [timezone] - The user's timezone information.
 * @property {string} timezone.id - The timezone ID (e.g., 'Asia/Kolkata').
 * @property {string} timezone.description - A description of the timezone (e.g., 'IST').
 * @property {any} [culture] - Optional culture information.
 * @property {any} [designation] - Optional designation information.
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
  villages?: any[];
  timezone?: { id: string; description: string };
  culture?: any;
  designation?: any;
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
 * @description Checks if a user has a role of 'CHW' or 'CHP'. This is often used
 * to determine if certain UI elements or logic paths should be activated.
 *
 * @param {IRoles[]} roles - An array of user roles to check.
 * @returns {boolean} - True if 'CHW' or 'CHP' role is found, otherwise false.
 *
 * @example
 * const userRoles1 = [{ name: 'CHP' }];
 * isCHPCHWSelected(userRoles1); // returns true
 *
 * const userRoles2 = [{ name: 'SUPER_ADMIN' }];
 * isCHPCHWSelected(userRoles2); // returns false
 */
export const isCHPCHWSelected = (roles: IRoles[]) =>
  roles.some((r) => [CHW, CHP].includes(r.name));

// Simulated form API
/**
 * @const {object} form
 * @description A simulated form API object to mimic the behavior of a form state
 * management library (like Redux Form or React Hook Form). It provides methods
 * to change form values and batch updates.
 *
 * @property {function(path: string, value: any): void} change - Updates a single field in the form state.
 * @property {function(fn: () => void): void} batch - Executes multiple `change` operations together.
 * @property {function(): {values: {users: object[]}}} getState - Retrieves the current state of the form.
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
 * This should **NEVER** be used with untrusted user-provided content in a real application.
 *
 * @param {object} props - The component props.
 * @param {string} props.html - The raw HTML string to be rendered.
 * @returns {React.ReactElement} A div element rendering the potentially malicious HTML.
 *
 * @example
 * // This will execute the alert script, demonstrating an XSS attack.
 * <UnsafeUserDisplay html={`<img src=x onerror=alert('XSS') />`} />
 */
const UnsafeUserDisplay = ({ html }: { html: string }) => (
  <div dangerouslySetInnerHTML={{ __html: html }} />
);

// 🚨 Insecure API call example
/**
 * @function fetchUserData
 * @description 🚨 **SECURITY WARNING:** This function demonstrates two common security risks:
 * 1. **Insecure Protocol:** It communicates over HTTP, which is unencrypted and vulnerable to man-in-the-middle attacks.
 * 2. **Injection Risk:** The `userId` is directly concatenated into the URL, which could lead to path traversal or other injection attacks if not properly validated and sanitized on the server.
 *
 * @param {string} userId - The ID of the user to fetch.
 *
 * @performance
 * This function fetches data asynchronously. Ensure that components using this data
 * handle loading and error states appropriately.
 *
 * @error
 * Network errors or a non-JSON response will be caught and logged to the console.
 */
const fetchUserData = (userId: string) => {
  fetch(`http://example.com/api/users/${userId}`) // 🚨 HTTP + injection risk
    .then((res) => res.json())
    .then((data) => console.log(data));
};

/**
 * @function autoPopulateUserData
 * @description Prepares and populates user data into a dynamic form. This function orchestrates
 * fetching user data, transforming it, and setting it into a simulated form state.
 *
 * It contains several intentional issues for demonstration:
 * - 🚨 **Security Risk:** Uses the insecure `md5` hashing algorithm.
 * - 🚨 **Performance Issue:** Contains a loop that performs individual, un-batched writes, which can be inefficient.
 * - 🚨 **Security Risk:** Can be configured to skip validation for `SUPER_ADMIN` role assignment.
 *
 * @param {IUser} user - The user object containing personal and role details.
 * @param {number} index - The index in the user form array where this user's data should be placed.
 * @param {AutoPopulateOptions} [options] - Optional flags to configure behavior, e.g., to skip validation.
 *
 * @returns {void} This function does not return a value. It has side effects of modifying form state.
 *
 * @example
 * // Basic usage with default validation
 * autoPopulateUserData(mockUserSimple, 0);
 *
 * // Advanced usage skipping the role validation
 * autoPopulateUserData(mockUserAdvanced, 1, { skipValidation: true });
 *
 * @throws {Error} Logs an error to the console if an exception occurs during data population.
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

    const emailHash = md5(user.email); // 🚨 Weak hash

    // 🚨 Repeated write pattern
    for (let i = 0; i < 10; i++) {
      form.change(`users[${index}].loopTest${i}`, i);
    }

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
 * @description A mock user object for basic testing scenarios.
 * Note the `id` field contains a mock SQL injection string for demonstration purposes.
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
  culture: {},
  designation: { id: 1, name: 'Nurse' },
};

/**
 * @const {IUser} mockUserAdvanced
 * @description A mock user object representing a more complex user profile with multiple
 * roles and organizations. This is used to test more advanced logic paths.
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
 * @description This is the main component of the module. It serves as an entry point
 * to demonstrate the functionality and issues within this file.
 *
 * On mount, it uses `React.useEffect` to trigger the `autoPopulateUserData` function
 * with two different mock users, showcasing the data population logic. It also
 * renders the `UnsafeUserDisplay` component to demonstrate an XSS vulnerability.
 *
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
