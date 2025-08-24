const Blog = require('../models/Blog');
const User = require('../models/User');

// @route   POST api/blogs
// @desc    Create a new blog
// @access  Private
const createBlog = async (req, res) => {
    const { title, content, tags, categories, images } = req.body;

    try {
        const newBlog = new Blog({
            title,
            content,
            tags,
            categories,
            images,
            author: req.user.id,
        });

        const blog = await newBlog.save();
        res.json(blog);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET api/blogs
// @desc    Get all blogs (with search and filter)
// @access  Public
const getBlogs = async (req, res) => {
    try {
        const { search, category, tag, author } = req.query;

        let filter = {};

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            filter.categories = category;
        }

        if (tag) {
            filter.tags = tag;
        }

        if (author) {
            const user = await User.findOne({ username: { $regex: author, $options: 'i' } });
            if (user) {
                filter.author = user._id;
            } else {
                // If author is specified but not found, return no blogs
                return res.json([]);
            }
        }

        const blogs = await Blog.find(filter).populate('author', ['username', 'profilePicture']).sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET api/blogs/:id
// @desc    Get a single blog by ID
// @access  Public
const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', ['username', 'profilePicture']);

        if (!blog) {
            return res.status(404).json({ msg: 'Blog not found' });
        }

        // Increment views
        blog.views += 1;
        await blog.save();

        res.json(blog);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Blog not found' });
        }
        res.status(500).send('Server error');
    }
};

// @route   PUT api/blogs/:id
// @desc    Update a blog
// @access  Private
const updateBlog = async (req, res) => {
    const { title, content, tags, categories, images } = req.body;

    try {
        let blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ msg: 'Blog not found' });
        }

        // Check if user is the author
        if (blog.author.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Update fields
        if (title) blog.title = title;
        if (content) blog.content = content;
        if (tags) blog.tags = tags;
        if (categories) blog.categories = categories;
        if (images) blog.images = images;

        blog = await blog.save();

        res.json(blog);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Blog not found' });
        }
        res.status(500).send('Server error');
    }
};

// @route   DELETE api/blogs/:id
// @desc    Delete a blog
// @access  Private
const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ msg: 'Blog not found' });
        }

        // Check if user is the author
        if (blog.author.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await blog.deleteOne();

        res.json({ msg: 'Blog removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Blog not found' });
        }
        res.status(500).send('Server error');
    }
};

// @route   PUT api/blogs/:id/like
// @desc    Like or unlike a blog
// @access  Private
const likeBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ msg: 'Blog not found' });
        }

        // Check if the blog has already been liked by this user
        if (blog.likes.some(like => like.toString() === req.user.id)) {
            // Unlike the blog
            blog.likes = blog.likes.filter(
                like => like.toString() !== req.user.id
            );
        } else {
            // Like the blog
            blog.likes.unshift(req.user.id);
        }

        await blog.save();
        res.json(blog.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   POST api/blogs/:id/comment
// @desc    Add a comment to a blog
// @access  Private
const addComment = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ msg: 'Blog not found' });
        }

        const newComment = {
            text: req.body.text,
            user: req.user.id,
        };

        blog.comments.unshift(newComment);

        await blog.save();

        const populatedBlog = await Blog.findById(req.params.id).populate('comments.user', ['username', 'profilePicture']);

        res.json(populatedBlog.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   DELETE api/blogs/:id/comment/:comment_id
// @desc    Delete a comment
// @access  Private
const deleteComment = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ msg: 'Blog not found' });
        }

        // Pull out comment
        const comment = blog.comments.find(
            comment => comment.id === req.params.comment_id
        );

        // Make sure comment exists
        if (!comment) {
            return res.status(404).json({ msg: 'Comment does not exist' });
        }

        // Check user
        if (comment.user.toString() !== req.user.id && blog.author.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        blog.comments = blog.comments.filter(
            ({ id }) => id !== req.params.comment_id
        );

        await blog.save();

        res.json(blog.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    createBlog,
    getBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    likeBlog,
    addComment,
    deleteComment,
};
