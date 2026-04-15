const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Simple URL normalizer (normalize-url v8+ is ESM-only)
const normalizeUrl = (url) => {
  try {
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    return new URL(url).href;
  } catch {
    return url;
  }
};

// Multer config for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']).lean();

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/', auth, async (req, res) => {
  const { bio, location, website, youtube, twitter, facebook, linkedin, instagram } = req.body;

  // Build profile object
  const profileFields = {
    user: req.user.id,
    bio,
    location
  };

  if (website) {
    try {
      profileFields.website = normalizeUrl(website);
    } catch {
      profileFields.website = website;
    }
  }

  // Build social object
  const socialFields = { youtube, twitter, facebook, linkedin, instagram };

  // Normalize social URLs
  for (const [key, value] of Object.entries(socialFields)) {
    if (value && value.length > 0) {
      try {
        socialFields[key] = normalizeUrl(value);
      } catch {
        socialFields[key] = value;
      }
    }
  }

  profileFields.social = socialFields;

  try {
    let profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']).lean();
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']).lean();

    if (!profile) {
      // Check if user exists at all
      const userObj = await User.findById(req.params.user_id).select('name avatar').lean();
      if (!userObj) {
        return res.status(404).json({ msg: 'User not found' });
      }
      // Return a default profile
      profile = {
        user: {
          _id: userObj._id,
          name: userObj.name,
          avatar: userObj.avatar
        },
        bio: '',
        location: '',
        website: '',
        social: {}
      };
    }

    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    return res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE api/profile
// @desc    Delete profile, user & posts
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    const Post = require('../../models/Post');
    const Notification = require('../../models/Notification');

    // Remove user posts
    await Post.deleteMany({ user: req.user.id });

    // Remove all notifications sent by or to this user
    await Notification.deleteMany({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }]
    });

    // Remove this user from all other users' followers / following arrays
    await User.updateMany(
      {},
      {
        $pull: {
          followers: { user: req.user.id },
          following: { user: req.user.id }
        }
      }
    );

    // Remove user's likes and comments from all posts
    await Post.updateMany(
      {},
      {
        $pull: {
          likes: { user: req.user.id },
          comments: { user: req.user.id }
        }
      }
    );

    // Remove profile
    await Profile.findOneAndDelete({ user: req.user.id });

    // Remove user
    await User.findOneAndDelete({ _id: req.user.id });

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profile/avatar
// @desc    Upload profile avatar
// @access  Private
router.put('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload an image' });
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    // Update user avatar
    await User.findByIdAndUpdate(req.user.id, { avatar: avatarPath });

    res.json({ avatar: avatarPath });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profile/posts/:user_id
// @desc    Get all posts by a user
// @access  Private
router.get('/posts/:user_id', auth, async (req, res) => {
  try {
    const Post = require('../../models/Post');
    const posts = await Post.find({ user: req.params.user_id }).sort({ date: -1 }).limit(50).lean();
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
