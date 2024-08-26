const { prisma } = require('../prisma/prisma-client');

const CommentController = {
	createComment: async (req, res) => {
		const { postId, content } = req.body;
		const userId = req.user.userId;

		if (!postId || !content) {
			return res.status(400).json({ error: 'All fields are required' });
		}

		try {
			const comment = await prisma.comment.create({
				data: {
					postId,
					userId,
					content,
				}
			});

			res.json(comment);
		} catch (e) {
			console.error('Create comment error', e);
			res.status(500).json({ error: 'Internal server error' });
		}
	},
	deleteComment: async (req, res) => {
		res.send('deleteComment')
	},
};

module.exports = CommentController;