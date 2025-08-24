const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    getUserBlogs,
    updateUserProfile,
} = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

// @route   GET api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', getUserProfile);

// @route   GET api/users/:id/blogs
// @desc    Get all blogs by a user
// @access  Public
router.get('/:id/blogs', getUserBlogs);

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, updateUserProfile);

module.exports = router;
