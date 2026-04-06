const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const User = require('../../models/User');
const Post = require('../../models/Post');
const Notification = require('../../models/Notification');

// @route   PUT api/follow/:user_id
// @desc    Follow a user
// @access  Private
router.put('/:user_id', auth, async (req, res) => {
  try {
    if (req.params.user_id === req.user.id) {
      return res.status(400).json({ msg: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(req.params.user_id);
    const currentUser = await User.findById(req.user.id);

    if (!targetUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if already following
    const alreadyFollowing = targetUser.followers.some(
      (f) => f.user.toString() === req.user.id
    );
    if (alreadyFollowing) {
      return res.status(400).json({ msg: 'Already following this user' });
    }

    // Add to target's followers
    targetUser.followers.unshift({ user: req.user.id });
    await targetUser.save();

    // Add to current user's following
    currentUser.following.unshift({ user: req.params.user_id });
    await currentUser.save();

    // Create follow notification
    const notification = new Notification({
      recipient: targetUser._id,
      sender: req.user.id,
      type: 'follow',
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar
    });
    await notification.save();

    res.json({
      followers: targetUser.followers,
      following: currentUser.following
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/follow/:user_id
// @desc    Unfollow a user
// @access  Private
router.delete('/:user_id', auth, async (req, res) => {
  try {
    if (req.params.user_id === req.user.id) {
      return res.status(400).json({ msg: 'You cannot unfollow yourself' });
    }

    const targetUser = await User.findById(req.params.user_id);
    const currentUser = await User.findById(req.user.id);

    if (!targetUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const isFollowing = targetUser.followers.some(
      (f) => f.user.toString() === req.user.id
    );
    if (!isFollowing) {
      return res.status(400).json({ msg: 'Not following this user' });
    }

    // Remove from target's followers
    targetUser.followers = targetUser.followers.filter(
      (f) => f.user.toString() !== req.user.id
    );
    await targetUser.save();

    // Remove from current user's following
    currentUser.following = currentUser.following.filter(
      (f) => f.user.toString() !== req.params.user_id
    );
    await currentUser.save();

    res.json({
      followers: targetUser.followers,
      following: currentUser.following
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/follow/suggestions
// @desc    Get users the current user is NOT following (suggestions)
// @access  Private
router.get('/suggestions', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const followingIds = currentUser.following.map((f) => f.user.toString());
    followingIds.push(req.user.id); // exclude self

    // Get all users except those already following + self
    const suggestions = await User.find({
      _id: { $nin: followingIds }
    })
      .select('-password')
      .limit(20);

    res.json(suggestions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/follow/following-feed
// @desc    Get posts from users the current user follows
// @access  Private
router.get('/following-feed', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const followingIds = currentUser.following.map((f) => f.user);

    if (followingIds.length === 0) {
      return res.json([]);
    }

    const posts = await Post.find({ user: { $in: followingIds } }).sort({
      date: -1
    });

    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/follow/status/:user_id
// @desc    Check if current user follows a given user + get counts
// @access  Private
router.get('/status/:user_id', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.user_id).select('-password');
    if (!targetUser) return res.status(404).json({ msg: 'User not found' });

    const isFollowing = targetUser.followers.some(
      (f) => f.user.toString() === req.user.id
    );

    res.json({
      isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: targetUser.following.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/follow/users/:user_id
// @desc    Get followers/following lists for a user
// @access  Private
router.get('/users/:user_id', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.user_id)
      .select('-password')
      .populate('followers.user', ['name', 'avatar'])
      .populate('following.user', ['name', 'avatar']);

    if (!targetUser) return res.status(404).json({ msg: 'User not found' });

    res.json({
      followers: targetUser.followers,
      following: targetUser.following
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
