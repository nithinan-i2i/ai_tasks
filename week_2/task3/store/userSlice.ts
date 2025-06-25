import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { UserFormValues } from '../validation/userFormSchema';

export interface UserRole {
  id: string;
  displayName: string;
}

export interface UserState {
  roles: UserRole[];
  loading: boolean;
  error: string | null;
  users: UserFormValues[];
}

const initialState: UserState = {
  roles: [
    { id: 'admin', displayName: 'Admin' },
    { id: 'user', displayName: 'User' },
  ],
  loading: false,
  error: null,
  users: [],
};

/**
 * Async thunk to create a user (mocked API call).
 */
export const createUser = createAsyncThunk(
  'user/createUser',
  async (user: UserFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return user;
  }
);

/**
 * Async thunk to update a user (mocked API call).
 */
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (user: UserFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return user;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<UserFormValues>) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create user';
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<UserFormValues>) => {
        state.loading = false;
        if (state.users.length > 0) {
          state.users[0] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update user';
      });
  },
});

export default userSlice.reducer; 