import { useSelector } from 'react-redux';
import { RootState } from '../../task1/src/store';

/**
 * Custom hook to fetch roles, countries, and loading state from Redux.
 */
export function useUserFormLogic() {
  const roles = useSelector((state: RootState) => state.user.roles || []);
  const countries = useSelector((state: RootState) => state.location.countries || []);
  const loading = useSelector((state: RootState) => state.user.loading || state.location.loading);
  return { roles, countries, loading };
} 