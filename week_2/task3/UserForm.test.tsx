import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import UserForm from './UserForm';

/**
 * Unit tests for UserForm component.
 */
describe('UserForm', () => {
  const mockStore = configureStore([]);
  const initialState = {
    user: { roles: [{ id: 'admin', displayName: 'Admin' }], loading: false },
    location: { countries: [{ id: 'US', name: 'United States' }], loading: false },
  };
  let store: any;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  it('renders all fields', () => {
    render(
      <Provider store={store}>
        <UserForm />
      </Provider>
    );
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
  });

  it('shows validation errors on submit', async () => {
    render(
      <Provider store={store}>
        <UserForm />
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
    await waitFor(() => {
      expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    });
  });

  it('submits valid data', async () => {
    render(
      <Provider store={store}>
        <UserForm />
      </Provider>
    );
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/Country/i), { target: { value: 'US' } });
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
    await waitFor(() => {
      // Since we use window.alert for error toast, no success toast is shown, but no validation error should be present
      expect(screen.queryByText(/is required/i)).not.toBeInTheDocument();
    });
  });
}); 