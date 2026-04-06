import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postReducer from './slices/postSlice';
import profileReducer from './slices/profileSlice';
import notificationReducer from './slices/notificationSlice';
import followReducer from './slices/followSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    post: postReducer,
    profile: profileReducer,
    notification: notificationReducer,
    follow: followReducer
  }
});

export default store;
