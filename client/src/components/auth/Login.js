import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { login } from '../../slices/authSlice';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loggingIn, setLoggingIn] = useState(false);

  const { email, password } = formData;

  useEffect(() => {
    document.title = 'Login | Sopher';
  }, []);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      await dispatch(login({ email, password })).unwrap();
      toast.success('Logged in successfully!');

      // Check if the user already has a profile
      try {
        await api.get('/profile/me');
        // Profile exists → send to profile page
        navigate('/profile');
      } catch {
        // No profile yet → send to dashboard to create one
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.errors) {
        err.errors.forEach((error) => toast.error(error.msg));
      } else {
        toast.error('Invalid email or password.');
      }
    } finally {
      setLoggingIn(false);
    }
  };

  // Safety net: already authenticated on page load
  if (isAuthenticated) {
    return <Navigate to="/profile" />;
  }

  return (
    <section className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Sign In</h1>
        <p className="auth-subtitle">Welcome back to Sopher</p>
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              type="email"
              id="login-email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              type="password"
              id="login-password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            id="btn-login-submit"
            className="btn btn-primary btn-block"
            disabled={loggingIn}
          >
            {loggingIn ? 'Signing in…' : 'Login'}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
