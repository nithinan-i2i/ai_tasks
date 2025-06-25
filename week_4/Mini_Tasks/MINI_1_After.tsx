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

// --- Refactored Function ---
function processUserForForm(user: IUser, index: number): void {
  const blockedRoles = ['SUPER_ADMIN', 'REPORT_ADMIN'];
  const targetGroup = 'SPICE';

  const log = (msg: string) => console.log(`[processUserForForm]: ${msg}`);

  // 1. Role validation
  const rolesToUse = user.roles.filter((r) => {
    const isTargetGroup = r.groupName === targetGroup;
    if (isTargetGroup && blockedRoles.includes(r.name)) {
      log(`Blocked role found and excluded: ${r.name}`);
      return false;
    }
    return isTargetGroup;
  });

  // 2. Redundant transformation
  const emailHash = `hashed_${user.email}`;
  const hasPhone = user.phoneNumber != null;

  // 3. Unsafe org access
  const org = user.organizations?.[0];
  const tenantId = org?.tenantId;

  // 5. Complex nested mutation block
  form.batch(() => {
    form.change(`users[${index}].firstName`, user.firstName);
    form.change(`users[${index}].lastName`, user.lastName);
    form.change(`users[${index}].emailHash`, emailHash);
    form.change(`users[${index}].hasPhone`, hasPhone);
    form.change(`users[${index}].tenantId`, tenantId);
    form.change(`users[${index}].roles`, rolesToUse);
  });

  // 6. Side-effect after state change (REMOVED)
  // The fetch call was removed and should be handled in the component.
} 