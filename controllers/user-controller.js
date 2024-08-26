const { prisma } = require('../prisma/prisma-client');
const bcrypt = require('bcryptjs');
const Jdenticon = require('jdenticon');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const UserController = {
	register: async (req, res) => {
		const { email, password, name } = req.body;

		if (!email || !password || !name) {
			return res.status(400).json({ error: 'All fields are required' });
		}

		try {
			const existingUser = await prisma.user.findUnique(({ where: { email } }));

			if (existingUser) {
				return res.status(400).json({ error: 'User already exist' });
			}

			const hashedPassword = await bcrypt.hash(password, 10);

			const png = Jdenticon.toPng(name, 200);
			const avatarName = `${name}_${Date.now()}.png`;
			const avatarPath = path.join(__dirname, '../uploads', avatarName);
			fs.writeFileSync(avatarPath, png);

			const user = await prisma.user.create({
				data: {
					email,
					password: hashedPassword,
					name,
					avatarUrl: `/uploads/${avatarPath}`
				}
			})

			res.json(user);

		} catch (e) {
			console.error('Error in register', e);
			res.status(500).json({ error: 'Internal server error' });
		}
	},
	login: async (req, res) => {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ error: 'All fields are required' });
		}

		try {
			const user = await prisma.user.findUnique({ where: { email } });

			if (!user) {
				return res.status(400).json({ error: 'Invalid login or password' });
			}

			const valid = await bcrypt.compare(password, user.password);

			if (!valid) {
				return res.status(400).json({ error: 'Invalid login or password' });
			}

			const token = jwt.sign(({ userId: user.id }), 'SECRET_KEY');

			res.json({ token });
		} catch (e) {
			console.error('Login error', e);
			res.status(500).json({ error: 'Internal server error' });
		}
	},
	getUserById: async (req, res) => {
		res.send('getUserById')
	},
	updateUser: async (req, res) => {
		res.send('updateUser')
	},
	current: async (req, res) => {
		res.send('current')
	}
};

module.exports = UserController;
