import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Get posts
export const getPosts = createAsyncThunk('post/getPosts', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/posts');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { msg: 'Network error' });
  }
});

// Add post
export const addPost = createAsyncThunk('post/addPost', async (formData, { rejectWithValue }) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    const res = await api.post('/posts', formData, config);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { msg: 'Network error' });
  }
});

// Delete post
export const deletePost = createAsyncThunk('post/deletePost', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/posts/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data || { msg: 'Network error' });
  }
});

// Like post
export const likePost = createAsyncThunk('post/likePost', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/posts/like/${id}`);
    return res.data; // now returns full post
  } catch (err) {
    return rejectWithValue(err.response?.data || { msg: 'Network error' });
  }
});

// Unlike post
export const unlikePost = createAsyncThunk('post/unlikePost', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/posts/unlike/${id}`);
    return res.data; // now returns full post
  } catch (err) {
    return rejectWithValue(err.response?.data || { msg: 'Network error' });
  }
});

// Add comment
export const addComment = createAsyncThunk('post/addComment', async ({ postId, text }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/posts/comment/${postId}`, { text });
    return res.data; // returns full post
  } catch (err) {
    return rejectWithValue(err.response?.data || { msg: 'Network error' });
  }
});

// Delete comment
export const deleteComment = createAsyncThunk('post/deleteComment', async ({ postId, commentId }, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/posts/comment/${postId}/${commentId}`);
    return res.data; // returns full post
  } catch (err) {
    return rejectWithValue(err.response?.data || { msg: 'Network error' });
  }
});

const postSlice = createSlice({
  name: 'post',
  initialState: {
    posts: [],
    post: null,
    loading: true,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.loading = false;
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
        state.loading = false;
      })
      .addCase(addPost.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((post) => post._id !== action.payload);
        state.loading = false;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        state.posts = state.posts.map((post) =>
          post._id === action.payload._id ? action.payload : post
        );
      })
      .addCase(likePost.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(unlikePost.fulfilled, (state, action) => {
        state.posts = state.posts.map((post) =>
          post._id === action.payload._id ? action.payload : post
        );
      })
      .addCase(unlikePost.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.posts = state.posts.map((post) =>
          post._id === action.payload._id ? action.payload : post
        );
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.posts = state.posts.map((post) =>
          post._id === action.payload._id ? action.payload : post
        );
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export default postSlice.reducer;
