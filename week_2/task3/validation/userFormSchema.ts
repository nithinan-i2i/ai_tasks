import * as yup from 'yup';

/**
 * Yup schema for user form validation.
 */
export const userFormSchema = yup.object().shape({
  firstName: yup.string().required('First name is required').max(50),
  lastName: yup.string().required('Last name is required').max(50),
  email: yup.string().email('Invalid email').required('Email is required'),
  role: yup.string().required('Role is required'),
  country: yup.string().required('Country is required'),
  // Add more fields and rules as needed
});

export type UserFormValues = yup.InferType<typeof userFormSchema>; 