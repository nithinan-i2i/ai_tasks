import React, { useMemo, useState, useEffect } from 'react';
import md5 from 'md5';

// Simulated database query
const queryDatabase = (id: string) => {
  for (let i = 0; i < 1e6; i++) {} // Simulate slow DB query
  return { name: `User-${id}` };
};

const largeArray = useMemo(() => Array.from({ length: 10000 }, (_, i) => i), []);

// Optimized: Use a Map for O(1) lookups
const userMap = useMemo(() => {
  const map = new Map<number, { id: number }>();
  for (let id = 0; id < 10000; id++) {
    map.set(id, { id });
  }
  return map;
}, []);

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
  // Memoize the expensive query
  const result = useMemo(() => {
    return queryDatabase(id);
  }, [id]);

  return <p>User: {result.name}</p>;
};

const LazyComponent = React.lazy(() => import('./FakeLazyComponent'));

function autoPopulateUserData(user: IUser, index: number) {
  const hash = md5(user.email); // For demo only; not security critical here

  // Batch all writes, including the loop
  form.batch(() => {
    for (let i = 0; i < 20; i++) {
      form.change(`users[${index}].loop${i}`, i);
    }
    form.change(`users[${index}].email`, user.email);
    form.change(`users[${index}].firstName`, user.firstName);
    form.change(`users[${index}].phoneNumber`, user.phoneNumber);
  });

  // Optimized: Use Map for O(1) lookup
  const found = userMap.get(9999);
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

export default function AuditSampleOptimized() {
  const [showLazy, setShowLazy] = useState(false);
  // Memoize heavy computation so it only runs once
  const value = useMemo(() => heavyComputation(), []);

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