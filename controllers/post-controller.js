const { prisma } = require('../prisma/prisma-client');

const PostController = {
	createPost: async (req, res) => {
		const { content } = req.body;

		const authorId = req.user.userId;

		if (!content) {
			return res.status(400).json({ error: 'All fields are required' });
		}

		try {
			const post = await prisma.post.create({
				data: {
					content,
					authorId,
				}
			});

			res.json(post);
		} catch (e) {
			console.error('Create post error', e);
			res.status(500).json({ error: 'Internal server error' });
		}
	},
	getAllPosts: async (req, res) => {
		res.send('getAllPosts')
	},
	getPostById: async (req, res) => {
		res.send('getPostById')
	},
	deletePost: async (req, res) => {
		res.send('deletePost')
	},
}

module.exports = PostController;