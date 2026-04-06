import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Landing = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <section className="landing">
      <div className="landing-overlay">
        <div className="landing-inner">
          <h1 className="landing-title">
            Welcome to <span className="gradient-text">Sopher Blog</span>
          </h1>
          <p className="landing-subtitle">
            Connect, share, and discover amazing content with a community that inspires.
          </p>
          <div className="landing-buttons">
            <Link to="/register" className="btn btn-primary">
              Sign Up
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Landing;
