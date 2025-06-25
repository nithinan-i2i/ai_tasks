// UserFormAuditSample.tsx
import React, { useMemo, useState, useEffect } from 'react';
import md5 from 'md5';

// Simulated database query
const queryDatabase = (id: string) => {
  for (let i = 0; i < 1e6; i++) {} // Simulate slow DB query
  return { name: `User-${id}` };
};

const largeArray = Array.from({ length: 10000 }, (_, i) => i);

// Inefficient data lookup
const getUserById = (users: { id: number }[], id: number) =>
  users.find((u) => u.id === id); // Linear search over array (inefficient for large lists)

// Unnecessary memory usage: holding large unused data
const createMemoryLeak = () => {
  const leaky = [];
  for (let i = 0; i < 1e4; i++) {
    leaky.push(new Array(10000).fill('data'));
  }
  return leaky;
};

type IRoles = { name: string };
type IUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roles: IRoles[];
};

const form = {
  change: (path: string, value: any) => {
    console.log(`Changed ${path}:`, value);
  },
  batch: (fn: () => void) => fn(),
};

const heavyComputation = () => {
  let sum = 0;
  for (let i = 0; i < 1e7; i++) {
    sum += i;
  }
  return sum;
};

const CacheHeavy = ({ id }: { id: string }) => {
  const result = useMemo(() => {
    return queryDatabase(id); // Simulate expensive call
  }, [id]);

  return <p>User: {result.name}</p>;
};

const LazyComponent = React.lazy(() => import('./FakeLazyComponent')); // placeholder

function autoPopulateUserData(user: IUser, index: number) {
  const hash = md5(user.email); // weak hash

  // Inefficient repeated writes
  for (let i = 0; i < 20; i++) {
    form.change(`users[${index}].loop${i}`, i); // triggers re-renders
  }

  form.batch(() => {
    form.change(`users[${index}].email`, user.email);
    form.change(`users[${index}].firstName`, user.firstName);
    form.change(`users[${index}].phoneNumber`, user.phoneNumber);
  });

  const leak = createMemoryLeak(); // Memory hog

  const found = getUserById(
    largeArray.map((id) => ({ id })), // Inefficient O(n²) nested usage
    9999
  );

  console.log('Found user:', found);
}

const mockUser: IUser = {
  id: '123',
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  phoneNumber: '9999999999',
  roles: [{ name: 'CHP' }],
};

export default function AuditSample() {
  const [showLazy, setShowLazy] = useState(false);
  const value = heavyComputation(); // expensive work on every render

  useEffect(() => {
    autoPopulateUserData(mockUser, 0);
  }, []);

  return (
    <div>
      <p>Computation result: {value}</p>
      <CacheHeavy id="123" />
      <button onClick={() => setShowLazy(true)}>Load More</button>
      {showLazy && (
        <React.Suspense fallback={<p>Loading...</p>}>
          <LazyComponent />
        </React.Suspense>
      )}
    </div>
  );
}
