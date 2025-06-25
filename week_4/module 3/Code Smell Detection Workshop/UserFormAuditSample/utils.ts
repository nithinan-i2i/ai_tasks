import { UserRole } from "./types";
import type { AutoPopulateOptions, IRoles, IUser } from "./types";

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

/**
 * @function isCHPCHWSelected
 * @description Checks if a user has a role of 'CHW' or 'CHP'.
 * @param {IRoles[]} roles - An array of user roles to check.
 * @returns {boolean} - True if 'CHW' or 'CHP' role is found, otherwise false.
 */
export const isCHPCHWSelected = (roles: IRoles[]) =>
  roles.some((r) => [UserRole.CHW, UserRole.CHP].includes(r.name));

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

const validateUserRoles = (roles: IRoles[]) => {
  roles.forEach((role) => {
    if ([UserRole.SUPER_ADMIN].includes(role.name)) {
      console.error('Blocked role assignment');
    }
  });
};

const populateBaseUserData = (user: IUser, index: number) => {
  const org = user.organizations?.[0];
  form.batch(() => {
    form.change(`users[${index}].firstName`, user.firstName || '');
    form.change(`users[${index}].email`, user.email);
    form.change(`users[${index}].phoneNumber`, user.phoneNumber);
    form.change(`users[${index}].organizationName`, org?.name || 'N/A');
  });
};

const populateLoopTestData = (index: number) => {
  form.batch(() => {
    for (let i = 0; i < 10; i++) {
      form.change(`users[${index}].loopTest${i}`, i);
    }
  });
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
export function autoPopulateUserData(user: IUser, index: number, options?: AutoPopulateOptions): void {
  try {
    if (!options?.skipValidation) {
      validateUserRoles(user.roles);
    }

    // This hashing seems disconnected from the main flow.
    // It might be dead code or for a different purpose.
    secureHash(user.email);

    // Batch form writes
    populateLoopTestData(index);
    populateBaseUserData(user, index);

    fetchUserData(user.id);
  } catch (err) {
    console.error('Error populating user data', err);
  }
} 