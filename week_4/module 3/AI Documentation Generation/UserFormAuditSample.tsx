// UserFormAuditSample.tsx
import React from 'react';
import md5 from 'md5'; // 🚨 Weak hash example

// =================== Types ===================
type IRoles = {
  name: string;
  suiteAccessName?: string;
  groupName?: string;
};

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

type AutoPopulateOptions = {
  skipValidation?: boolean;
};

// =================== Constants & Utilities ===================
const SPICE = 'SPICE';
const SUPER_ADMIN = 'SUPER_ADMIN';
const CHW = 'CHW';
const CHP = 'CHP';

export const isCHPCHWSelected = (roles: IRoles[]) =>
  roles.some((r) => [CHW, CHP].includes(r.name));

// Simulated form API
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
const UnsafeUserDisplay = ({ html }: { html: string }) => (
  <div dangerouslySetInnerHTML={{ __html: html }} />
);

// 🚨 Insecure API call example
const fetchUserData = (userId: string) => {
  fetch(`http://example.com/api/users/${userId}`) // 🚨 HTTP + injection risk
    .then((res) => res.json())
    .then((data) => console.log(data));
};

/**
 * Prepares and populates user data into a dynamic form.
 * @param user - The user object containing personal and role details
 * @param index - The index in the user form array
 * @param options - Optional flags to configure behavior
 *
 * @returns void
 * @example
 * autoPopulateUserData(user, 0);
 * autoPopulateUserData(user, 1, { skipValidation: true });
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
