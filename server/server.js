import dotenv from 'dotenv';
import express from 'express';
import next from 'next';
import mongoose from 'mongoose';
import session from 'express-session';
import mongoSessionStore from 'connect-mongo';
import helmet from 'helmet'

import logger from './logs'
import api from './api'
import auth from './google'
import { setupGithub as github } from './github';
import routesWithSlug from './routesWithSlug';
import getRootUrl from '../lib/api/getRootUrl';
import sitemapAndRobots from './sitemapAndRobots';

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const MONGO_URL = process.env.MONGO_URL_TEST;

const options = {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
};

mongoose.connect(
	MONGO_URL,
	options,
);

const port = process.env.PORT || 8001;
const ROOT_URL = getRootUrl()

const app = next({dev});
const handle = app.getRequestHandler();

const URL_MAP = {
	'/login': '/public/login',
	'/my-books': '/customer/my-books',
};

app.prepare().then(() => {
	const server = express();
	server.use(helmet())
	server.use(express.json());
	const MongoStore = mongoSessionStore(session);

	const sess = session({
		name: 'nextjs.sid',
		secret: 'HD2w.)q*VqRT4/#NK2M/,E^B)}FED5fWU!dKe[wk',
		store: new MongoStore({
			mongooseConnection: mongoose.connection,
			ttl: 14 * 24 * 60 * 60, // save session 14 days
		}),
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			maxAge: 14 * 24 * 60 * 60 * 1000,
		}
	});

	if (!dev) {
		server.set('trust proxy', 1);
		sess.cookie.secure = true;
	}
	server.use(sess);

	auth({ server, ROOT_URL })
	github({ server });
	api(server);
	routesWithSlug({ server, app });
	sitemapAndRobots({ server });

	server.get('*', (req, res) => {
		const url = URL_MAP[req.path];
		if (url) {
			app.render(req, res, url);
		} else {
			handle(req, res);
		}
	});

	server.listen(port, (err) => {
		if (err) throw err;
		logger.info(`> Ready on ${ROOT_URL}`);
	});
});