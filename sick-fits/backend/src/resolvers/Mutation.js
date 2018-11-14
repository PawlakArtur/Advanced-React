const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto');
const { promisify } =  require('util');

const mutations = {
	async createItem(parent, args, ctx, info) { 
		const item = await ctx.db.mutation.createItem({
			data: {
				...args
			}
		}, info);

		return item;
	},
	updateItem(parent, args, ctx, info) {
		// first take a copy of the updates
		const updates = { ...args };
		// remove the ID from the  updates
		delete updates.id;
		// run the update method
		return ctx.db.mutation.updateItem({
			data: updates,
			where: {
				id: args.id
			},
		}, info);
	},
	async deleteItem(parent, args, ctx, info) {
		const where = { id: args.id };
		const item = await ctx.db.query.item({ where }, `{ id, title }`);
		return ctx.db.mutation.deleteItem({ where }, info);
	},
	async signup(parent, args, ctx, info) {
		args.email = args.email.toLowerCase();
		// hash their password
		const password = await bcrypt.hash(args.password, 10);
		// create the user in the database
		const user = await ctx.db.mutation.createUser({
			data: {
				...args,
				password,
				permissions: { set: ['USER'] }
			}
		}, info);
		// create JWT token for them
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		// we set the jwt as a cookie on the respone
		ctx.response.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 *365, // 1 year cookie
		});
		// return the user to the browser
		return user;
	},
	async signin(parent, { email, password }, ctx, info) {
		// 1. check if there is a user with that email
		const user = await ctx.db.query.user({ where: { email } });
		if (!user) {
			throw new Error(`No such user found for email ${email}`);
		}
		// 2. Check if their password is correct
		const valid = await bcrypt.compare(password, user.password);
		if (!valid) {
			throw new Error('Invalid Password!');
		}
		// 3. generate the JWT Token
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		// 4. Set the cookie with the token
		ctx.response.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365,
		});
		// 5. Return the user
		return user;
	},
	async signout(parent, args, ctx, info) {
		ctx.response.clearCookie('token');
		return { message: 'Goodbye!' };
	},
	async requestReset(parent, args, ctx, info) {
		// Check if the is a real user
		const user = await ctx.db.query.user({ where: { email: args.email }});
		if (!user) {
			throw new Error(`No such user found for email ${args.email}`);
		}
		// Set a reset token and expiry on that user
		const randomBytesPromisified = promisify(randomBytes);
		const resetToken = (await randomBytesPromisified(20)).toString('hex');
		const resetTokenExpiry = Date.now() + 3600000 // 1 hour from now
		const res = await ctx.db.mutation.updateUser({
			where: { email: args.email },
			data: { resetToken, resetTokenExpiry }
		});
		console.log(res);
		return { message: 'Thanks'};
		// Email them that reset token
	}
};

module.exports = mutations;
