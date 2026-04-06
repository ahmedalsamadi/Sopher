import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Get current user profile
export const getCurrentProfile = createAsyncThunk('profile/getCurrentProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/profile/me');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

// Create or update profile
export const createProfile = createAsyncThunk('profile/createProfile', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.post('/profile', formData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

// Delete account (profile + user + posts)
export const deleteAccount = createAsyncThunk('profile/deleteAccount', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/profile');
    return true;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: null,
    profiles: [],
    loading: true,
    error: null
  },
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(getCurrentProfile.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(createProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(createProfile.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.profile = null;
        state.loading = false;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  }
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
