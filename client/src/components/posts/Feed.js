import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPosts, likePost, unlikePost, deletePost, addComment, deleteComment } from '../../slices/postSlice';
import { getFollowingFeed } from '../../slices/followSlice';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAssetUrl } from '../../utils/api';

const Feed = () => {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector((state) => state.post);
  const { followingFeed } = useSelector((state) => state.follow);
  const { user } = useSelector((state) => state.auth);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [activeTab, setActiveTab] = useState('forYou'); // 'forYou' | 'following'

  useEffect(() => {
    document.title = 'Feed | Sopher';
    dispatch(getPosts());
    dispatch(getFollowingFeed());
  }, [dispatch]);

  const handleLike = (postId) => {
    dispatch(likePost(postId));
  };

  const handleUnlike = (postId) => {
    dispatch(unlikePost(postId));
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await dispatch(deletePost(postId)).unwrap();
        toast.success('Post deleted');
      } catch (err) {
        toast.error('Failed to delete post');
      }
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const text = commentTexts[postId]?.trim();
    if (!text) return;

    try {
      await dispatch(addComment({ postId, text })).unwrap();
      setCommentTexts((prev) => ({ ...prev, [postId]: '' }));
      setExpandedComments((prev) => ({ ...prev, [postId]: true }));
      toast.success('Comment added!');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await dispatch(deleteComment({ postId, commentId })).unwrap();
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const isLiked = (post) => {
    return post.likes?.some((like) => like.user.toString() === user?._id);
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: postDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (loading) return <div className="loading-spinner">Loading posts...</div>;

  const displayPosts = activeTab === 'forYou' ? posts : followingFeed;

  return (
    <section className="feed-page">
      <div className="feed-content">
        <div className="feed-header">
          <h1 className="feed-title">Feed</h1>
          <Link to="/create-post" className="btn btn-primary btn-sm">
            ✍️ New Post
          </Link>
        </div>

        {/* Tab switcher */}
        <div className="feed-tabs" id="feed-tabs">
          <button
            id="tab-for-you"
            className={`feed-tab-btn ${activeTab === 'forYou' ? 'active' : ''}`}
            onClick={() => setActiveTab('forYou')}
          >
            🌐 For You
          </button>
          <button
            id="tab-following"
            className={`feed-tab-btn ${activeTab === 'following' ? 'active' : ''}`}
            onClick={() => setActiveTab('following')}
          >
            👥 Following
          </button>
        </div>

        {displayPosts.length === 0 ? (
          <div className="empty-state">
            {activeTab === 'following' ? (
              <>
                <div className="empty-state-icon">👥</div>
                <h3>No posts from people you follow</h3>
                <p>Follow some people to see their posts here!</p>
                <Link to="/people" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Discover People
                </Link>
              </>
            ) : (
              <>
                <h3>No posts yet</h3>
                <p>Be the first to share something!</p>
                <Link to="/create-post" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Create Post
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="feed-posts">
            {displayPosts.map((post) => (
              <div key={post._id} className="feed-post-card">
                {/* Post Header */}
                <div className="feed-post-header">
                  <div className="feed-post-author">
                    <div className="feed-author-avatar">
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
                      <Link to={`/profile/${post.user}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <p className="feed-author-name">{post.name}</p>
                      </Link>
                      <p className="feed-post-time">{formatDate(post.date)}</p>
                    </div>
                  </div>
                  {user?._id === post.user && (
                    <button
                      className="feed-delete-btn"
                      onClick={() => handleDelete(post._id)}
                      title="Delete post"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                {/* Post Content */}
                <div className="feed-post-content">
                  <p className="feed-post-text">{post.text}</p>
                  {post.image && (
                    <div className="feed-post-image-wrapper">
                      <img
                        src={getAssetUrl(post.image)}
                        alt="Post"
                        className="feed-post-image"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="feed-post-actions">
                  <button
                    className={`feed-action-btn ${isLiked(post) ? 'liked' : ''}`}
                    onClick={() =>
                      isLiked(post) ? handleUnlike(post._id) : handleLike(post._id)
                    }
                  >
                    {isLiked(post) ? '❤️' : '🤍'}{' '}
                    <span>{post.likes?.length || 0}</span>
                  </button>
                  <button
                    className={`feed-action-btn ${expandedComments[post._id] ? 'active' : ''}`}
                    onClick={() => toggleComments(post._id)}
                  >
                    💬 <span>{post.comments?.length || 0}</span>
                  </button>
                </div>

                {/* Comments Section */}
                {expandedComments[post._id] && (
                  <div className="comments-section">
                    {/* Add Comment Form */}
                    <form
                      className="comment-form"
                      onSubmit={(e) => handleCommentSubmit(e, post._id)}
                    >
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentTexts[post._id] || ''}
                        onChange={(e) =>
                          setCommentTexts((prev) => ({
                            ...prev,
                            [post._id]: e.target.value
                          }))
                        }
                        className="comment-input"
                      />
                      <button
                        type="submit"
                        className="comment-submit-btn"
                        disabled={!commentTexts[post._id]?.trim()}
                      >
                        →
                      </button>
                    </form>

                    {/* Comment List */}
                    {post.comments?.length > 0 && (
                      <div className="comments-list">
                        {post.comments.map((comment) => (
                          <div key={comment._id} className="comment-item">
                            <div className="comment-avatar">
                              {comment.avatar ? (
                                <img
                                  src={getAssetUrl(comment.avatar)}
                                  alt={comment.name}
                                />
                              ) : (
                                <span>{comment.name?.charAt(0)?.toUpperCase()}</span>
                              )}
                            </div>
                            <div className="comment-body">
                              <div className="comment-header">
                                <Link to={`/profile/${comment.user}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                  <span className="comment-author">{comment.name}</span>
                                </Link>
                                <span className="comment-date">
                                  {formatDate(comment.date)}
                                </span>
                              </div>
                              <p className="comment-text">{comment.text}</p>
                            </div>
                            {(user?._id === comment.user || user?._id === post.user) && (
                              <button
                                className="comment-delete-btn"
                                onClick={() =>
                                  handleDeleteComment(post._id, comment._id)
                                }
                                title="Delete comment"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Feed;
