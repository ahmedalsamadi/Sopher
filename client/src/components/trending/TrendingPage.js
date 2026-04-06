import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPopularPosts } from '../../slices/followSlice';
import { likePost, unlikePost } from '../../slices/postSlice';
import { loadUser } from '../../slices/authSlice';
import { toast } from 'react-toastify';
import { getAssetUrl } from '../../utils/api';

const FILTERS = [
  { id: 'all', label: '🏆 All Time' },
  { id: 'month', label: '📅 This Month' },
  { id: 'week', label: '🔥 This Week' }
];

const TrendingPage = () => {
  const dispatch = useDispatch();
  const { popularPosts, loading } = useSelector((state) => state.follow);
  const { user } = useSelector((state) => state.auth);
  const { posts } = useSelector((state) => state.post);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedComments, setExpandedComments] = useState({});

  useEffect(() => {
    dispatch(loadUser());
    dispatch(getPopularPosts(activeFilter));
  }, [dispatch, activeFilter]);

  const isLiked = (post) =>
    post.likes?.some((like) => like.user?.toString() === user?._id);

  const handleLike = async (post) => {
    try {
      if (isLiked(post)) {
        await dispatch(unlikePost(post._id)).unwrap();
      } else {
        await dispatch(likePost(post._id)).unwrap();
        toast.success('❤️ Liked!');
      }
      // Refresh trending after like
      dispatch(getPopularPosts(activeFilter));
    } catch {
      toast.error('Failed to update like');
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getRankClass = (index) => {
    if (index === 0) return 'rank-gold';
    if (index === 1) return 'rank-silver';
    if (index === 2) return 'rank-bronze';
    return 'rank-default';
  };

  const getRankEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <section className="trending-page">
      <div className="trending-content">
        {/* Header */}
        <div className="trending-header">
          <div className="trending-header-text">
            <h1 className="trending-title">🔥 Trending Posts</h1>
            <p className="trending-subtitle">The most loved content on Sopher</p>
          </div>
          {/* Filter Tabs */}
          <div className="trending-filters" id="trending-filters">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                id={`filter-${f.id}`}
                className={`trending-filter-btn ${activeFilter === f.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Crunching the numbers...</div>
        ) : popularPosts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No posts in this period</h3>
            <p>Try a different time range or create the first trending post!</p>
          </div>
        ) : (
          <div className="trending-list">
            {popularPosts.map((post, index) => (
              <div key={post._id} className={`trending-post-card ${getRankClass(index)}`}>
                {/* Rank Badge */}
                <div className={`trending-rank-badge ${getRankClass(index)}`}>
                  {getRankEmoji(index)}
                </div>

                {/* Post Author */}
                <div className="trending-post-inner">
                  <div className="trending-post-header">
                    <div className="trending-author">
                      <div className="trending-author-avatar">
                        {post.avatar ? (
                          <img
                            src={getAssetUrl(post.avatar)}
                            alt={post.name}
                          />
                        ) : (
                          <span>{post.name?.charAt(0)?.toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="trending-author-name">{post.name}</p>
                        <p className="trending-post-date">{formatDate(post.date)}</p>
                      </div>
                    </div>

                    {/* Engagement Score */}
                    <div className="trending-score-badge">
                      <span className="trending-score-label">Score</span>
                      <span className="trending-score-value">{post.score || 0}</span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="trending-post-text">{post.text}</p>

                  {post.image && (
                    <div className="trending-post-image-wrapper">
                      <img
                        src={getAssetUrl(post.image)}
                        alt="Post"
                        className="trending-post-image"
                      />
                    </div>
                  )}

                  {/* Stats Row */}
                  <div className="trending-post-stats">
                    <button
                      className={`trending-stat-btn ${isLiked(post) ? 'liked' : ''}`}
                      onClick={() => handleLike(post)}
                      id={`trending-like-${post._id}`}
                    >
                      {isLiked(post) ? '❤️' : '🤍'}
                      <span>{post.likes?.length || 0} likes</span>
                    </button>

                    <button
                      className="trending-stat-btn"
                      onClick={() =>
                        setExpandedComments((prev) => ({
                          ...prev,
                          [post._id]: !prev[post._id]
                        }))
                      }
                    >
                      💬
                      <span>{post.comments?.length || 0} comments</span>
                    </button>
                  </div>

                  {/* Comments preview */}
                  {expandedComments[post._id] && post.comments?.length > 0 && (
                    <div className="trending-comments-preview">
                      {post.comments.slice(0, 3).map((c) => (
                        <div key={c._id} className="trending-comment">
                          <div className="trending-comment-avatar">
                            {c.avatar ? (
                              <img src={getAssetUrl(c.avatar)} alt={c.name} />
                            ) : (
                              <span>{c.name?.charAt(0)?.toUpperCase()}</span>
                            )}
                          </div>
                          <div className="trending-comment-body">
                            <span className="trending-comment-author">{c.name}</span>
                            <span className="trending-comment-text">{c.text}</span>
                          </div>
                        </div>
                      ))}
                      {post.comments.length > 3 && (
                        <p className="trending-comments-more">
                          +{post.comments.length - 3} more comments
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingPage;
