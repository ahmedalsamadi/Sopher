const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow'],
    required: true
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'post'
  },
  postText: {
    type: String
  },
  commentText: {
    type: String
  },
  senderName: {
    type: String
  },
  senderAvatar: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('notification', NotificationSchema);
