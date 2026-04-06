import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSuggestions, followUser, unfollowUser } from '../../slices/followSlice';
import { loadUser } from '../../slices/authSlice';
import { toast } from 'react-toastify';
import { getAssetUrl } from '../../utils/api';

const PeoplePage = () => {
  const dispatch = useDispatch();
  const { suggestions, followingIds, loading } = useSelector((state) => state.follow);
  const { user } = useSelector((state) => state.auth);
  const [pendingIds, setPendingIds] = useState(new Set());
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(loadUser());
    dispatch(getSuggestions());
  }, [dispatch]);

  const handleFollow = async (userId) => {
    setPendingIds((p) => new Set(p).add(userId));
    try {
      await dispatch(followUser(userId)).unwrap();
      toast.success('Followed!');
    } catch (err) {
      toast.error(err?.msg || 'Failed to follow');
    } finally {
      setPendingIds((p) => { const n = new Set(p); n.delete(userId); return n; });
    }
  };

  const handleUnfollow = async (userId) => {
    setPendingIds((p) => new Set(p).add(userId));
    try {
      await dispatch(unfollowUser(userId)).unwrap();
      toast.success('Unfollowed');
    } catch (err) {
      toast.error(err?.msg || 'Failed to unfollow');
    } finally {
      setPendingIds((p) => { const n = new Set(p); n.delete(userId); return n; });
    }
  };

  const filtered = suggestions.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="people-page">
      <div className="people-content">
        <div className="people-header">
          <div className="people-header-text">
            <h1 className="people-title">👥 Discover People</h1>
            <p className="people-subtitle">Find interesting people to follow on Sopher</p>
          </div>
          <div className="people-search-wrapper">
            <span className="people-search-icon">🔍</span>
            <input
              id="people-search"
              type="text"
              className="people-search"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Finding people...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌐</div>
            <h3>{search ? 'No users found' : "You're following everyone!"}</h3>
            <p>{search ? 'Try a different name.' : 'Check back later for new members.'}</p>
          </div>
        ) : (
          <div className="people-grid">
            {filtered.map((person) => {
              const isFollowing = followingIds.includes(person._id);
              const isPending = pendingIds.has(person._id);

              return (
                <div key={person._id} className="person-card">
                  <div className="person-card-bg" />
                  <div className="person-avatar-wrap">
                    {person.avatar ? (
                      <img
                        src={getAssetUrl(person.avatar)}
                        alt={person.name}
                        className="person-avatar-img"
                      />
                    ) : (
                      <div className="person-avatar-placeholder">
                        <span>{person.name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="person-info">
                    <h3 className="person-name">{person.name}</h3>
                    <div className="person-stats">
                      <span className="person-stat">
                        <strong>{person.followers?.length || 0}</strong> followers
                      </span>
                      <span className="person-stat-dot">·</span>
                      <span className="person-stat">
                        <strong>{person.following?.length || 0}</strong> following
                      </span>
                    </div>
                  </div>
                  <button
                    id={`follow-btn-${person._id}`}
                    className={`person-follow-btn ${isFollowing ? 'following' : ''}`}
                    disabled={isPending}
                    onClick={() =>
                      isFollowing ? handleUnfollow(person._id) : handleFollow(person._id)
                    }
                  >
                    {isPending ? '...' : isFollowing ? '✓ Following' : '+ Follow'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default PeoplePage;
