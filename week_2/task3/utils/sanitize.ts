import { UserFormValues } from '../validation/userFormSchema';

/**
 * Sanitizes user input to prevent XSS and injection attacks.
 * @param {UserFormValues} data
 * @returns {UserFormValues}
 */
export function sanitizeUserInput(data: UserFormValues): UserFormValues {
  // Example: strip script tags, trim whitespace, etc.
  return {
    ...data,
    firstName: data.firstName.replace(/<[^>]*>?/gm, '').trim(),
    lastName: data.lastName.replace(/<[^>]*>?/gm, '').trim(),
    email: data.email.trim(),
    // ...other fields
  };
} 