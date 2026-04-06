import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Follow a user
export const followUser = createAsyncThunk('follow/followUser', async (userId, { rejectWithValue }) => {
  try {
    const res = await api.put(`/follow/${userId}`);
    return { userId, ...res.data };
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

// Unfollow a user
export const unfollowUser = createAsyncThunk('follow/unfollowUser', async (userId, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/follow/${userId}`);
    return { userId, ...res.data };
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

// Get suggestions (users not yet followed)
export const getSuggestions = createAsyncThunk('follow/getSuggestions', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/follow/suggestions');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

// Get feed from followed users
export const getFollowingFeed = createAsyncThunk('follow/getFollowingFeed', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/follow/following-feed');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

// Get popular posts
export const getPopularPosts = createAsyncThunk('follow/getPopularPosts', async (period, { rejectWithValue }) => {
  try {
    const res = await api.get(`/posts/popular${period ? `?period=${period}` : ''}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

// Get follow status for a user
export const getFollowStatus = createAsyncThunk('follow/getFollowStatus', async (userId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/follow/status/${userId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

// Get current user's followers/following lists
export const getMyFollowLists = createAsyncThunk('follow/getMyFollowLists', async (userId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/follow/users/${userId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

const followSlice = createSlice({
  name: 'follow',
  initialState: {
    suggestions: [],
    followingFeed: [],
    popularPosts: [],
    followingIds: [], // quick lookup set — list of user IDs the current user follows
    followersCount: 0,
    followingCount: 0,
    myFollowers: [],
    myFollowing: [],
    loading: false,
    error: null
  },
  reducers: {
    clearFollowState: (state) => {
      state.suggestions = [];
      state.followingFeed = [];
      state.popularPosts = [];
      state.followingIds = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Follow
      .addCase(followUser.fulfilled, (state, action) => {
        const { userId, following } = action.payload;
        state.followingIds.push(userId);
        state.followingCount = following?.length || state.followingCount + 1;
        // Remove from suggestions
        state.suggestions = state.suggestions.filter((u) => u._id !== userId);
      })
      // Unfollow
      .addCase(unfollowUser.fulfilled, (state, action) => {
        const { userId, following } = action.payload;
        state.followingIds = state.followingIds.filter((id) => id !== userId);
        state.followingCount = following?.length || Math.max(0, state.followingCount - 1);
      })
      // Suggestions
      .addCase(getSuggestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
        state.loading = false;
      })
      .addCase(getSuggestions.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // Following feed
      .addCase(getFollowingFeed.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFollowingFeed.fulfilled, (state, action) => {
        state.followingFeed = action.payload;
        state.loading = false;
      })
      .addCase(getFollowingFeed.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // Popular posts
      .addCase(getPopularPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPopularPosts.fulfilled, (state, action) => {
        state.popularPosts = action.payload;
        state.loading = false;
      })
      .addCase(getPopularPosts.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // Follow status
      .addCase(getFollowStatus.fulfilled, (state, action) => {
        const { isFollowing, followersCount, followingCount } = action.payload;
        state.followersCount = followersCount;
        state.followingCount = followingCount;
        if (isFollowing) {
          // mark in followingIds if not already present
        }
      })
      // My follow lists
      .addCase(getMyFollowLists.fulfilled, (state, action) => {
        state.myFollowers = action.payload.followers;
        state.myFollowing = action.payload.following;
        state.followingIds = action.payload.following.map((f) =>
          f.user?._id || f.user
        );
        state.followersCount = action.payload.followers.length;
        state.followingCount = action.payload.following.length;
      });
  }
});

export const { clearFollowState } = followSlice.actions;
export default followSlice.reducer;
