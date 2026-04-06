import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loadUser, logout } from '../../slices/authSlice';
import { getCurrentProfile, createProfile, deleteAccount, clearProfile } from '../../slices/profileSlice';
import { getMyFollowLists, followUser, unfollowUser } from '../../slices/followSlice';
import { toast } from 'react-toastify';
import api, { getAssetUrl } from '../../utils/api';

// ---------------------------------------------------------------------------
// Available colour themes
// ---------------------------------------------------------------------------
const THEMES = [
  {
    id: 'indigo',
    label: 'Indigo Nebula',
    emoji: '🔮',
    primary: '#6366f1',
    secondary: '#818cf8',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
    gradientHover: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
    glow: 'rgba(99, 102, 241, 0.15)',
  },
  {
    id: 'rose',
    label: 'Rose Gold',
    emoji: '🌹',
    primary: '#f43f5e',
    secondary: '#fb7185',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)',
    gradientHover: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #e11d48 100%)',
    glow: 'rgba(244, 63, 94, 0.15)',
  },
  {
    id: 'emerald',
    label: 'Emerald Forest',
    emoji: '🌿',
    primary: '#10b981',
    secondary: '#34d399',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
    gradientHover: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
    glow: 'rgba(16, 185, 129, 0.15)',
  },
  {
    id: 'amber',
    label: 'Solar Amber',
    emoji: '🌞',
    primary: '#f59e0b',
    secondary: '#fbbf24',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
    gradientHover: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
    glow: 'rgba(245, 158, 11, 0.15)',
  },
  {
    id: 'sky',
    label: 'Ocean Blue',
    emoji: '🌊',
    primary: '#0ea5e9',
    secondary: '#38bdf8',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #4f46e5 100%)',
    gradientHover: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #2563eb 100%)',
    glow: 'rgba(14, 165, 233, 0.15)',
  },
  {
    id: 'violet',
    label: 'Cosmic Violet',
    emoji: '✨',
    primary: '#8b5cf6',
    secondary: '#a78bfa',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
    gradientHover: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)',
    glow: 'rgba(139, 92, 246, 0.15)',
  },
];

// Apply theme to :root CSS variables
const applyTheme = (themeId) => {
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  const root = document.documentElement;
  root.style.setProperty('--accent-primary', theme.primary);
  root.style.setProperty('--accent-secondary', theme.secondary);
  root.style.setProperty('--accent-gradient', theme.gradient);
  root.style.setProperty('--accent-gradient-hover', theme.gradientHover);
  root.style.setProperty('--shadow-glow', `0 0 30px ${theme.glow}`);
  root.style.setProperty('--border-focus', theme.primary);
  localStorage.setItem('sopher-theme', themeId);
};

// ---------------------------------------------------------------------------
const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { profile, loading } = useSelector((state) => state.profile);
  const { myFollowers, myFollowing, followersCount, followingCount } = useSelector((state) => state.follow);
  const fileInputRef = useRef(null);

  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Theme panel
  const [showThemes, setShowThemes] = useState(false);
  const [activeTheme, setActiveTheme] = useState(
    () => localStorage.getItem('sopher-theme') || 'indigo'
  );

  // Follow modal
  const [showFollowModal, setShowFollowModal] = useState(null); // 'followers' | 'following' | null

  useEffect(() => {
    dispatch(loadUser());
    dispatch(getCurrentProfile());
    // Re-apply saved theme on mount
    applyTheme(localStorage.getItem('sopher-theme') || 'indigo');
  }, [dispatch]);

  useEffect(() => {
    if (user?._id) {
      dispatch(getMyFollowLists(user._id));
    }
  }, [dispatch, user?._id]);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setWebsite(profile.website || '');
    }
  }, [profile]);

  useEffect(() => {
    if (user) fetchUserPosts();
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const res = await api.get(`/profile/posts/${user._id}`);
      setUserPosts(res.data);
      setPostsLoading(false);
    } catch {
      setPostsLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      await api.put('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch(loadUser());
      toast.success('Profile image updated!');
    } catch {
      toast.error('Failed to upload image');
      setAvatarPreview(null);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createProfile({ bio, location, website })).unwrap();
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  // ---- Delete account ----
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      await dispatch(deleteAccount()).unwrap();
      dispatch(clearProfile());
      dispatch(logout());
      toast.success('Your account has been deleted.');
      navigate('/');
    } catch {
      toast.error('Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  // ---- Theme selection ----
  const handleThemeSelect = (themeId) => {
    setActiveTheme(themeId);
    applyTheme(themeId);
    toast.success(`Theme changed to ${THEMES.find((t) => t.id === themeId).label}!`);
  };

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (user?.avatar) return getAssetUrl(user.avatar);
    return null;
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  if (loading) return <div className="loading-spinner">Loading...</div>;

  const currentTheme = THEMES.find((t) => t.id === activeTheme) || THEMES[0];

  return (
    <section className="profile-page">
      <div className="profile-page-content">
        {/* ── Profile Header Card ── */}
        <div className="profile-header-card">
          <div className="profile-avatar-section">
            <div
              className="profile-avatar-wrapper"
              onClick={() => fileInputRef.current.click()}
            >
              {getAvatarUrl() ? (
                <img src={getAvatarUrl()} alt="Profile" className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-placeholder">
                  <span>{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                </div>
              )}
              <div className="profile-avatar-overlay">
                <span>📷</span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            <div className="profile-user-info">
              <h1 className="profile-name">{user?.name}</h1>
              <p className="profile-email">{user?.email}</p>
              {profile?.location && (
                <p className="profile-location">📍 {profile.location}</p>
              )}
              <div className="profile-follow-counts">
                <button
                  className="profile-follow-count-btn"
                  id="btn-show-followers"
                  onClick={() => setShowFollowModal('followers')}
                >
                  <strong>{followersCount}</strong> <span>Followers</span>
                </button>
                <span className="profile-follow-sep">·</span>
                <button
                  className="profile-follow-count-btn"
                  id="btn-show-following"
                  onClick={() => setShowFollowModal('following')}
                >
                  <strong>{followingCount}</strong> <span>Following</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Bio / Edit Form ── */}
          {!editing ? (
            <div className="profile-bio-display">
              {profile?.bio ? (
                <p className="profile-bio-text">{profile.bio}</p>
              ) : (
                <p className="profile-bio-empty">No bio yet. Tell us about yourself!</p>
              )}
              <div className="profile-action-row">
                <button
                  id="btn-edit-profile"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setEditing(true)}
                >
                  ✏️ Edit Profile
                </button>
                <button
                  id="btn-theme-picker"
                  className="btn btn-theme-preview btn-sm"
                  style={{ '--theme-color': currentTheme.primary }}
                  onClick={() => setShowThemes(!showThemes)}
                >
                  🎨 Themes
                </button>
                <button
                  id="btn-delete-account"
                  className="btn btn-danger-outline btn-sm"
                  onClick={() => {
                    setDeleteConfirmText('');
                    setShowDeleteModal(true);
                  }}
                >
                  🗑️ Delete Account
                </button>
              </div>
            </div>
          ) : (
            <form className="profile-edit-form" onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label htmlFor="profile-bio">Bio</label>
                <textarea
                  id="profile-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write something about yourself..."
                  rows="3"
                />
              </div>
              <div className="profile-edit-row">
                <div className="form-group">
                  <label htmlFor="profile-location">Location</label>
                  <input
                    type="text"
                    id="profile-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profile-website">Website</label>
                  <input
                    type="text"
                    id="profile-website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yoursite.com"
                  />
                </div>
              </div>
              <div className="profile-edit-actions">
                <button type="submit" className="btn btn-primary btn-sm">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Theme Picker Panel ── */}
        {showThemes && (
          <div className="theme-panel" id="theme-panel">
            <div className="theme-panel-header">
              <h2 className="theme-panel-title">🎨 Choose Your Theme</h2>
              <p className="theme-panel-sub">Personalise your Sopher experience</p>
            </div>
            <div className="theme-grid">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  id={`theme-${theme.id}`}
                  className={`theme-card ${activeTheme === theme.id ? 'active' : ''}`}
                  style={{ '--tc': theme.primary, '--tg': theme.gradient }}
                  onClick={() => handleThemeSelect(theme.id)}
                >
                  <div className="theme-swatch" />
                  <span className="theme-emoji">{theme.emoji}</span>
                  <span className="theme-label">{theme.label}</span>
                  {activeTheme === theme.id && (
                    <span className="theme-check">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── User Posts ── */}
        <div className="profile-posts-section">
          <h2 className="section-title">
            My Posts
            <span className="post-count">{userPosts.length}</span>
          </h2>
          {postsLoading ? (
            <div className="loading-spinner">Loading posts...</div>
          ) : userPosts.length === 0 ? (
            <div className="empty-state">
              <p>You haven't posted anything yet.</p>
            </div>
          ) : (
            <div className="posts-grid">
              {userPosts.map((post) => (
                <div key={post._id} className="post-card">
                  {post.image && (
                    <div className="post-image-wrapper">
                      <img
                        src={getAssetUrl(post.image)}
                        alt="Post"
                        className="post-image"
                      />
                    </div>
                  )}
                  <div className="post-card-body">
                    <p className="post-text">{post.text}</p>
                    <div className="post-meta">
                      <span className="post-date">{formatDate(post.date)}</span>
                      <div className="post-stats">
                        <span>❤️ {post.likes?.length || 0}</span>
                        <span>💬 {post.comments?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Delete Account Confirmation Modal ── */}
      {showDeleteModal && (
        <div className="modal-overlay" id="delete-modal-overlay" onClick={(e) => {
          if (e.target.classList.contains('modal-overlay')) {
            setShowDeleteModal(false);
            setDeleteConfirmText('');
          }
        }}>
          <div className="modal-box delete-modal">
            <div className="delete-modal-icon">⚠️</div>
            <h2 className="delete-modal-title">Delete Account</h2>
            <p className="delete-modal-body">
              This action is <strong>permanent and irreversible</strong>. All your posts,
              profile data, and account information will be permanently erased.
            </p>
            <div className="delete-modal-confirm">
              <label htmlFor="delete-confirm-input">
                Type <strong>DELETE</strong> to confirm:
              </label>
              <input
                id="delete-confirm-input"
                type="text"
                className="delete-confirm-input"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
              />
            </div>
            <div className="delete-modal-actions">
              <button
                id="btn-confirm-delete"
                className="btn btn-danger btn-sm"
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                onClick={handleDeleteAccount}
              >
                {deleting ? 'Deleting…' : '🗑️ Delete My Account'}
              </button>
              <button
                id="btn-cancel-delete"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Followers / Following Modal ── */}
      {showFollowModal && (
        <div
          className="modal-overlay"
          id="follow-modal-overlay"
          onClick={(e) => {
            if (e.target.classList.contains('modal-overlay')) setShowFollowModal(null);
          }}
        >
          <div className="modal-box follow-modal">
            <div className="follow-modal-header">
              <h2 className="follow-modal-title">
                {showFollowModal === 'followers' ? '👥 Followers' : '➡️ Following'}
              </h2>
              <button className="follow-modal-close" onClick={() => setShowFollowModal(null)}>✕</button>
            </div>
            <div className="follow-modal-list">
              {(showFollowModal === 'followers' ? myFollowers : myFollowing).length === 0 ? (
                <p className="follow-modal-empty">
                  {showFollowModal === 'followers'
                    ? 'No followers yet.'
                    : "You're not following anyone yet."}
                </p>
              ) : (
                (showFollowModal === 'followers' ? myFollowers : myFollowing).map((item) => {
                  const person = item.user;
                  return (
                    <div key={person?._id || item._id} className="follow-modal-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="follow-modal-avatar">
                          {person?.avatar ? (
                            <img src={getAssetUrl(person.avatar)} alt={person.name} />
                          ) : (
                            <span>{person?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                          )}
                        </div>
                        <span className="follow-modal-name">{person?.name || 'Unknown'}</span>
                      </div>
                      
                      {showFollowModal === 'following' && person?._id && (
                        <button
                          className="btn btn-danger-outline btn-sm"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                          onClick={async () => {
                            try {
                              await dispatch(unfollowUser(person._id)).unwrap();
                              toast.success(`Unfollowed ${person.name}`);
                              dispatch(getMyFollowLists(user._id));
                            } catch {
                              toast.error('Failed to unfollow user');
                            }
                          }}
                        >
                          Unfollow
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProfilePage;
