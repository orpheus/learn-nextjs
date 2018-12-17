import dotenv from 'dotenv';
import express from 'express';
import next from 'next';
import mongoose from 'mongoose';

import User from './models/User';

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const MONGO_URL = process.env.MONGO_URL_TEST;

const options = {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
};
//
// mongoose.connect(
// 	MONGO_URL,
// 	options,
// );

const port = process.env.PORT || 8000;
const ROOT_URL = `http://localhost:${port}`;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	const server = express();

	server.get('/', async (req, res) => {
		// const user = await User.findOne({ slug: 'team-builder-book' });
		const user = {email: 'ryan.gnar@yahoo.com'}
		app.render(req, res, '/', { user });
	});

	server.get('*', (req, res) => handle(req, res));

	server.listen(port, (err) => {
		if (err) throw err;
		console.log(`> Ready on ${ROOT_URL}`); // eslint-disable-line no-console
	});
});