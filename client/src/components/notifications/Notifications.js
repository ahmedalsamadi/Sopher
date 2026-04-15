import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getNotifications, markAllRead, markAsRead } from '../../slices/notificationSlice';
import { getAssetUrl } from '../../utils/api';

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector((state) => state.notification);

  useEffect(() => {
    document.title = 'Notifications | Sopher';
    dispatch(getNotifications());
  }, [dispatch]);

  const handleMarkAllRead = () => {
    dispatch(markAllRead());
  };

  const handleMarkRead = (id) => {
    dispatch(markAsRead(id));
  };

  const formatDate = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👤';
      default:
        return '🔔';
    }
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'like':
        return (
          <>
            <strong>{notification.senderName}</strong> liked your post
          </>
        );
      case 'comment':
        return (
          <>
            <strong>{notification.senderName}</strong> commented on your post
          </>
        );
      case 'follow':
        return (
          <>
            <strong>{notification.senderName}</strong> started following you
          </>
        );
      default:
        return 'New notification';
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;

  return (
    <section className="notifications-page">
      <div className="notifications-content">
        <div className="notifications-header">
          <h1 className="notifications-title">
            🔔 Notifications
          </h1>
          {notifications.some((n) => !n.read) && (
            <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <h3>No notifications</h3>
            <p>When someone likes or comments on your posts, you'll see it here.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => !notification.read && handleMarkRead(notification._id)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-body">
                  <div className="notification-avatar">
                    {notification.senderAvatar ? (
                      <img
                        src={getAssetUrl(notification.senderAvatar)}
                        alt={notification.senderName}
                      />
                    ) : (
                      <span>{notification.senderName?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="notification-info">
                    <p className="notification-message">
                      {getNotificationMessage(notification)}
                    </p>
                    {notification.postText && (
                      <p className="notification-post-preview">
                        "{notification.postText}{notification.postText.length >= 80 ? '...' : ''}"
                      </p>
                    )}
                    {notification.type === 'comment' && notification.commentText && (
                      <p className="notification-comment-text">
                        💬 "{notification.commentText}"
                      </p>
                    )}
                    <span className="notification-time">
                      {formatDate(notification.date)}
                    </span>
                  </div>
                </div>
                {!notification.read && <div className="notification-dot" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Notifications;
