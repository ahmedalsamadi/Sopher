import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from '../../slices/authSlice';
import { getCurrentProfile } from '../../slices/profileSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, loading } = useSelector((state) => state.profile);

  useEffect(() => {
    dispatch(loadUser());
    dispatch(getCurrentProfile());
  }, [dispatch]);

  return (
    <section className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-welcome">
          Welcome{user && <span className="gradient-text"> {user.name}</span>}
        </p>
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : profile !== null ? (
          <div className="profile-card">
            <h2>Your Profile</h2>
            {profile.bio && <p>{profile.bio}</p>}
            {profile.location && <p>📍 {profile.location}</p>}
          </div>
        ) : (
          <div className="no-profile">
            <p>You have not yet set up a profile. Add some info to get started.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
