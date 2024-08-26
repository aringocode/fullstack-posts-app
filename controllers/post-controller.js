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
		const userId = req.user.userId;

		try {
			const posts = await prisma.post.findMany({
				include: {
					likes: true,
					author: true,
					comments: true,
				},
				orderBy: {
					createdAt: 'desc'
				},
			});

			const postWithLikeInfo = posts.map(post => ({
				...post,
				likedByUser: post.likes.some(like => like.userId === userId)
			}));

			res.json(postWithLikeInfo);
		} catch (e) {
			console.error('Get all post error', e);
			res.status(500).json({ error: 'Internal server error' });
		}
	},
	getPostById: async (req, res) => {
		const { id } =  req.params;
		const userId = req.user.userId;

		try {
			const post = await prisma.post.findUnique({
				where: { id },
				include: {
					comments: {
						include: {
							user: true,
						},
					},
					likes: true,
					author: true,
				},
			});

			if (!post) {
				res.status(404).json({ error: 'The post was not found' });
			}

			const postWithLikeInfo = {
				...post,
				likedByUser: post.likes.some(like => like.userId === userId),
			};

			res.json(postWithLikeInfo);
		} catch (e) {
			console.error('Get post by Id error', e);
			res.status(500).json({ error: 'Internal server error' });
		}
	},
	deletePost: async (req, res) => {
		const { id } =  req.params;

		const post = await prisma.post.findUnique({where: { id }});

		if (!post) {
			res.status(404).json({ error: 'The post was not found' });
		}

		if (post.authorId !== req.user.userId) {
			return res.status(403).json({ error: 'Not access' });
		}

		try {
			const transaction = await prisma.$transaction([
				prisma.comment.deleteMany({ where: { postId: id } }),
				prisma.like.deleteMany({ where: { postId: id } }),
				prisma.post.deleteMany({ where: { id } }),
			]);

			res.json(transaction);
		} catch (e) {
			console.error('Delete post error', e);
			res.status(500).json({ error: 'Internal server error' });
		}
	},
}

module.exports = PostController;
