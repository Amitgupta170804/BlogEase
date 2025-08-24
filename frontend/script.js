document.addEventListener('DOMContentLoaded', () => {
    const blogsContainer = document.getElementById('blogs-container');
    const API_URL = 'http://localhost:5000/api/blogs'; // Assuming the backend runs on port 5000

    const fetchBlogs = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const blogs = await response.json();
            displayBlogs(blogs);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            blogsContainer.innerHTML = '<p>Could not fetch blogs. Is the backend server running?</p>';
        }
    };

    const displayBlogs = (blogs) => {
        if (blogs.length === 0) {
            blogsContainer.innerHTML = '<p>No blogs to display.</p>';
            return;
        }

        blogsContainer.innerHTML = ''; // Clear the container

        blogs.forEach(blog => {
            const blogPostElement = document.createElement('div');
            blogPostElement.className = 'blog-post';

            const authorName = blog.author ? blog.author.username : 'Anonymous';
            const postDate = new Date(blog.createdAt).toLocaleDateString();

            blogPostElement.innerHTML = `
                <h2>${blog.title}</h2>
                <div class="meta">
                    <span>By: ${authorName}</span> |
                    <span>On: ${postDate}</span>
                </div>
                <div class="content">
                    <p>${blog.content}</p>
                </div>
                <div class="tags">
                    <strong>Tags:</strong> ${blog.tags.join(', ')}
                </div>
            `;
            blogsContainer.appendChild(blogPostElement);
        });
    };

    fetchBlogs();
});
