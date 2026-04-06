import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../slices/authSlice';
import { clearProfile } from '../../slices/profileSlice';
import { getUnreadCount } from '../../slices/notificationSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notification);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sopher-theme') || 'dark';
  });

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sopher-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getUnreadCount());
      const interval = setInterval(() => {
        dispatch(getUnreadCount());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, dispatch]);

  // Close menu on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const onLogout = () => {
    dispatch(logout());
    dispatch(clearProfile());
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  const authLinks = (
    <ul className={`nav-links${menuOpen ? ' nav-links--open' : ''}`}>
      <li>
        <Link to="/feed" onClick={closeMenu}>📰 Feed</Link>
      </li>
      <li>
        <Link to="/trending" onClick={closeMenu}>🔥 Trending</Link>
      </li>
      <li>
        <Link to="/people" onClick={closeMenu}>👥 People</Link>
      </li>
      <li>
        <Link to="/create-post" onClick={closeMenu}>✍️ Create</Link>
      </li>
      <li>
        <Link to="/notifications" className="nav-notification-link" onClick={closeMenu}>
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </Link>
      </li>
      <li>
        <Link to="/profile" onClick={closeMenu}>👤 Profile</Link>
      </li>
      <li>
        <button onClick={toggleTheme} className="btn-theme-toggle" title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </li>
      <li>
        <button onClick={onLogout} className="btn-logout">
          Logout
        </button>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul className={`nav-links${menuOpen ? ' nav-links--open' : ''}`}>
      <li>
        <button onClick={toggleTheme} className="btn-theme-toggle" title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </li>
      <li>
        <Link to="/register" onClick={closeMenu}>Register</Link>
      </li>
      <li>
        <Link to="/login" onClick={closeMenu}>Login</Link>
      </li>
    </ul>
  );

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1>
          <Link to="/" className="nav-logo" onClick={closeMenu}>
            <span className="logo-icon">◆</span> Sopher
          </Link>
        </h1>

        {/* Hamburger button — only visible on mobile */}
        {!loading && (
          <button
            className={`nav-hamburger${menuOpen ? ' nav-hamburger--open' : ''}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}

        {!loading && (isAuthenticated ? authLinks : guestLinks)}
      </div>
    </nav>
  );
};

export default Navbar;
