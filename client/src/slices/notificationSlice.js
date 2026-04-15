import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Get notifications
export const getNotifications = createAsyncThunk('notification/getNotifications', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/notifications');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { msg: 'Network error' });
  }
});

// Get unread count
export const getUnreadCount = createAsyncThunk('notification/getUnreadCount', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/notifications/unread-count');
    return res.data.count;
  } catch (err) {
    return rejectWithValue(err.response?.data || { msg: 'Network error' });
  }
});

// Mark all as read
export const markAllRead = createAsyncThunk('notification/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await api.put('/notifications/read-all');
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data || { msg: 'Network error' });
  }
});

// Mark one as read
export const markAsRead = createAsyncThunk('notification/markAsRead', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/notifications/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { msg: 'Network error' });
  }
});

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: true,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.loading = false;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(getUnreadCount.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
        state.unreadCount = 0;
      })
      .addCase(markAllRead.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.notifications = state.notifications.map((n) =>
          n._id === action.payload._id ? action.payload : n
        );
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export default notificationSlice.reducer;
