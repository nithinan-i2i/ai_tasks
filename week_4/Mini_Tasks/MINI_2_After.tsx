// --- Mock Data ---
interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  roles: { name: string; groupName: string }[];
  organizations?: { tenantId: string }[];
}

const form: any = {
  change: (field: string, value: any) =>
    console.log(`form.change: ${field} = ${JSON.stringify(value)}`),
  batch: (fn: () => void) => fn(),
};

// --- Original Function with Security Fix ---
function processUserForForm(user: IUser, index: number): void {
  const blockedRoles = ['SUPER_ADMIN', 'REPORT_ADMIN'];
  const targetGroup = 'SPICE';

  const log = (msg: string) => console.log(`[processUserForForm]: ${msg}`);

  // 1. Role validation
  const rolesToUse = user.roles.filter((r) => r.groupName === targetGroup);
  for (const role of rolesToUse) {
    if (blockedRoles.includes(role.name)) {
      log(`Blocked role: ${role.name}`);
    }
  }

  // 2. Redundant transformation
  const emailHash = `hashed_${user.email}`;
  const hasPhone = user.phoneNumber !== null && user.phoneNumber !== undefined;

  // 3. Unsafe org access
  const org = user.organizations && user.organizations[0];
  const tenantId = org?.tenantId;

  // 4. Overuse of form.change
  for (let i = 0; i < 5; i++) {
    form.change(`users[${index}].debugField${i}`, `${user.firstName}-${i}`);
  }

  // 5. Complex nested mutation block
  form.batch(() => {
    form.change(`users[${index}].firstName`, user.firstName);
    form.change(`users[${index}].lastName`, user.lastName);
    form.change(`users[${index}].emailHash`, emailHash);
    form.change(`users[${index}].hasPhone`, hasPhone);
    form.change(`users[${index}].tenantId`, tenantId);
    form.change(`users[${index}].roles`, rolesToUse);
  });

  // 6. Side-effect after state change
  fetch(`https://api.example.com/users/${encodeURIComponent(user.id)}`)
    .then((res) => res.json())
    .then((details) => {
      log(`Fetched server-side data for ${user.id}`);
      form.change(`users[${index}].fetchedDetails`, details);
    })
    .catch((e) => {
      // Securely log the error
      log(`Error fetching user ${user.id}. See server logs for details.`);
      // In a real application, send the full error to a secure logging service
      // Example: secureLogger.error('Failed to fetch user', { userId: user.id, error: e });
    });
} 