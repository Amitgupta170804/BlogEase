const express = require('express');
const router = express.Router();
const {
    createBlog,
    getBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    likeBlog,
    addComment,
    deleteComment,
} = require('../controllers/blogController');
const auth = require('../middleware/authMiddleware');

// @route   POST api/blogs
// @desc    Create a new blog
// @access  Private
router.post('/', auth, createBlog);

// @route   GET api/blogs
// @desc    Get all blogs
// @access  Public
router.get('/', getBlogs);

// @route   GET api/blogs/:id
// @desc    Get a single blog by ID
// @access  Public
router.get('/:id', getBlogById);

// @route   PUT api/blogs/:id
// @desc    Update a blog
// @access  Private
router.put('/:id', auth, updateBlog);

// @route   DELETE api/blogs/:id
// @desc    Delete a blog
// @access  Private
router.delete('/:id', auth, deleteBlog);

// @route   PUT api/blogs/:id/like
// @desc    Like or unlike a blog
// @access  Private
router.put('/:id/like', auth, likeBlog);

// @route   POST api/blogs/:id/comment
// @desc    Add a comment to a blog
// @access  Private
router.post('/:id/comment', auth, addComment);

// @route   DELETE api/blogs/:id/comment/:comment_id
// @desc    Delete a comment
// @access  Private
router.delete('/:id/comment/:comment_id', auth, deleteComment);

module.exports = router;
