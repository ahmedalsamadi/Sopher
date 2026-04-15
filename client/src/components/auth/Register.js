import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { register } from '../../slices/authSlice';
import { toast } from 'react-toastify';

const Register = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });
  const [registering, setRegistering] = useState(false);

  const { name, email, password, password2 } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      toast.error('Passwords do not match');
    } else {
      setRegistering(true);
      try {
        await dispatch(register({ name, email, password })).unwrap();
        toast.success('Registration successful!');
      } catch (err) {
        if (err.errors) {
          err.errors.forEach((error) => toast.error(error.msg));
        }
      } finally {
        setRegistering(false);
      }
    }
  };

  useEffect(() => {
    document.title = 'Register | Sopher';
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <section className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join the Sopher community</p>
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="register-name">Full Name</label>
            <input
              type="text"
              id="register-name"
              name="name"
              value={name}
              onChange={onChange}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-email">Email Address</label>
            <input
              type="email"
              id="register-email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input
              type="password"
              id="register-password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Create a password"
              minLength="6"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-password2">Confirm Password</label>
            <input
              type="password"
              id="register-password2"
              name="password2"
              value={password2}
              onChange={onChange}
              placeholder="Confirm your password"
              minLength="6"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={registering}
          >
            {registering ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
