// UserFormAuditSample.tsx
import React from 'react';

// CRYPTO: Weak hash example
import md5 from 'md5'; // 🚨 Deprecated and insecure

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

const SPICE = 'SPICE';
const SUPER_ADMIN = 'SUPER_ADMIN';
const CHW = 'CHW';
const CHP = 'CHP';

// ✅ Hardcoded secret (demo)
const API_KEY = '12345-plain-secret-key'; // 🚨 Should be in env

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

const isCHPCHWSelected = (roles: IRoles[]) =>
  roles.some((r) => [CHW, CHP].includes(r.name));

// 🚨 Vulnerable function: Insecure fetch, unsanitized user input used in endpoint
const fetchUserData = (userId: string) => {
  fetch(`http://example.com/api/users/${userId}`) // 🚨 HTTP + direct injection
    .then((res) => res.json())
    .then((data) => console.log(data));
};

// 🚨 Insecure component: XSS via dangerouslySetInnerHTML
const UnsafeUserDisplay = ({ html }: { html: string }) => (
  <div dangerouslySetInnerHTML={{ __html: html }} />
);

function autoPopulateUserData(user: IUser, index: number) {
  const emailHash = md5(user.email); // 🚨 Weak hash

  user.roles.forEach((role) => {
    if ([SUPER_ADMIN].includes(role.name)) {
      console.error('Blocked role assignment'); // 🚨 No logging framework / audit
    }
  });

  // 🚨 Input validation gap
  const org = user.organizations[0]; // No fallback or length check

  // 🚨 Repeated calls (could trigger rate-limit warning)
  for (let i = 0; i < 10; i++) {
    form.change(`users[${index}].loopTest${i}`, i);
  }

  form.batch(() => {
    form.change(`users[${index}].firstName`, user.firstName || '');
    form.change(`users[${index}].email`, user.email); // 🚨 PII exposed directly
    form.change(`users[${index}].phoneNumber`, user.phoneNumber); // 🚨 PII
    form.change(`users[${index}].organizationName`, org?.name); // No validation
  });

  fetchUserData(user.id); // 🚨 Direct API call using unsanitized ID
}

const mockUser: IUser = {
  id: '1;DROP TABLE users', // 🚨 Simulated injection
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

export default function AuditSample() {
  React.useEffect(() => {
    autoPopulateUserData(mockUser, 0);
  }, []);

  return (
    <div>
      <UnsafeUserDisplay html={`<img src=x onerror=alert('XSS') />`} />
      <p>User data loaded</p>
    </div>
  );
}
