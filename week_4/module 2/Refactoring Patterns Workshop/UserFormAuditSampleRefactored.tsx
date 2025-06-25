import React from 'react';
import md5 from 'md5';

// Types
type IRoles = { name: string; suiteAccessName?: string; groupName?: string };
type IUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  gender: string;
  roles: IRoles[];
  organizations: { id: number; name: string; formName: string; tenantId: number }[];
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

const API_KEY = '12345-plain-secret-key';

// Simulated form API
const form = {
  change: (path: string, value: any) => console.log(`Changed ${path}:`, value),
  batch: (fn: () => void) => fn(),
  getState: () => ({ values: { users: [{}] } }),
};

const fetchUserData = (userId: string) => {
  fetch(`http://example.com/api/users/${userId}`).then(res => res.json()).then(data => console.log(data));
};

const UnsafeUserDisplay = ({ html }: { html: string }) => (
  <div dangerouslySetInnerHTML={{ __html: html }} />
);

// Extracted method: Validates user roles
function validateUserRoles(roles: IRoles[]) {
  roles.forEach((role) => {
    if ([SUPER_ADMIN].includes(role.name)) {
      console.error('Blocked role assignment');
    }
  });
}

// Extracted method: Safely gets the primary organization
function getPrimaryOrganization(organizations: IUser['organizations']) {
  if (Array.isArray(organizations) && organizations.length > 0) {
    return organizations[0];
  }
  return null;
}

// Extracted method: Updates form fields in a batch
function updateFormFields(user: IUser, org: any, index: number) {
  form.batch(() => {
    for (let i = 0; i < 10; i++) {
      form.change(`users[${index}].loopTest${i}`, i);
    }
    form.change(`users[${index}].firstName`, user.firstName || '');
    form.change(`users[${index}].email`, user.email);
    form.change(`users[${index}].phoneNumber`, user.phoneNumber);
    form.change(`users[${index}].organizationName`, org?.name);
  });
}

// Refactored main function
function autoPopulateUserData(user: IUser, index: number) {
  const emailHash = md5(user.email);
  validateUserRoles(user.roles);
  const org = getPrimaryOrganization(user.organizations);
  updateFormFields(user, org, index);
  fetchUserData(user.id);
}

const mockUser: IUser = {
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

export default function AuditSampleRefactored() {
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