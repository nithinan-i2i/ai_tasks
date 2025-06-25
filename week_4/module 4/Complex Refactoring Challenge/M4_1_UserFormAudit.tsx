// --- Mocks for demonstration ---
interface IRole {
  name: string;
  groupName: string;
}
interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  roles: IRole[];
  organizations?: { tenantId: number }[];
}
const form = {
  change: (path: string, value: any) => console.log(`form.change: ${path}`, value),
  batch: (fn: () => void) => {
    console.log('form.batch: START');
    fn();
    console.log('form.batch: END');
  }
};
// --------------------------------

/**
 * Validates user roles and filters them based on predefined criteria.
 * @returns The filtered list of roles.
 */
function validateAndFilterRoles(roles: IRole[]): IRole[] {
  const BLOCKED_ROLES = ['SUPER_ADMIN', 'REPORT_ADMIN'];
  const TARGET_GROUP = 'SPICE';

  return roles.filter((role) => {
    if (role.groupName !== TARGET_GROUP) {
      return false;
    }
    if (BLOCKED_ROLES.includes(role.name)) {
      console.log(`[validateAndFilterRoles]: Blocked role: ${role.name}`);
      return true; // Keep the role for logging, but it could be filtered out
    }
    return true;
  });
}

/**
 * Prepares a payload object from the user data for the form.
 * This function isolates data transformation logic.
 */
function prepareFormPayload(user: IUser, validRoles: IRole[]) {
  const org = user.organizations?.[0]; // Safer access, but still potentially undefined

  return {
    firstName: user.firstName,
    lastName: user.lastName,
    emailHash: `hashed_${user.email}`,
    hasPhone: user.phoneNumber != null,
    tenantId: org?.tenantId, // Safely pass undefined if not present
    roles: validRoles
  };
}

/**
 * Updates the form with a prepared payload and debug fields in a single batch.
 */
function updateUserForm(form: any, index: number, payload: object, debugData: object) {
  form.batch(() => {
    // Populate main user data
    for (const [key, value] of Object.entries(payload)) {
      form.change(`users[${index}].${key}`, value);
    }
    // Populate debug fields
    for (const [key, value] of Object.entries(debugData)) {
      form.change(`users[${index}].${key}`, value);
    }
  });
}

/**
 * Fetches additional user details and updates the form.
 */
async function fetchAndPopulateUserDetails(form: any, userId: string, index: number) {
  const log = (msg: string) => console.log(`[fetchAndPopulateUserDetails]: ${msg}`);
  try {
    const response = await fetch(`https://api.example.com/users/${encodeURIComponent(userId)}`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const details = await response.json();
    log(`Fetched server-side data for ${userId}`);
    form.change(`users[${index}].fetchedDetails`, details);
  } catch (error) {
    log(`Error fetching user: ${error}`);
  }
}

/**
 * REFACTORED Main orchestrator function.
 * Each step is delegated to a specialized function.
 */
function processUserForForm(user: IUser, index: number): void {
  // 1. Validate and filter data first
  const validRoles = validateAndFilterRoles(user.roles);
  const payload = prepareFormPayload(user, validRoles);

  // 2. Prepare any other data (e.g., debug fields)
  const debugData = {
    [`debugField0`]: `${user.firstName}-0`,
    [`debugField1`]: `${user.firstName}-1`
    // ... and so on
  };

  // 3. Perform all synchronous state updates together
  updateUserForm(form, index, payload, debugData);

  // 4. Handle asynchronous side-effects last
  fetchAndPopulateUserDetails(form, user.id, index);
}
