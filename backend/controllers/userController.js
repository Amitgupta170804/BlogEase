const User = require('../models/User');
const Blog = require('../models/Blog');

// @route   GET api/users/:id
// @desc    Get user profile by ID
// @access  Public
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server error');
    }
};

// @route   GET api/users/:id/blogs
// @desc    Get all blogs by a user
// @access  Public
const getUserBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ author: req.params.id }).populate('author', ['username']).sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const { username, bio, profilePicture } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (username) user.username = username;
        if (bio) user.bio = bio;
        if (profilePicture) user.profilePicture = profilePicture;

        if (username) {
            const existingUser = await User.findOne({ username });
            if (existingUser && existingUser._id.toString() !== req.user.id) {
                return res.status(400).json({ msg: 'Username is already taken' });
            }
        }

        await user.save();

        const userToReturn = user.toObject();
        delete userToReturn.password;

        res.json(userToReturn);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    getUserProfile,
    getUserBlogs,
    updateUserProfile,
};
