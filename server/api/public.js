import express from 'express';

import Book from '../models/Book';
import Chapter from '../models/Chapter';
// import User from '../models/User';
import logger from '../logs'

const router = express.Router();

router.get('/books', async (req, res) => {)
	try {
		const books = await Book.list();
		res.json(books);
	} catch (err) {
		res.json({ error: err.message || err.toString() });
	}
});

router.get('/books/:slug', async (req, res) => {
	try {
		const book = await Book.getBySlug({ slug: req.params.slug, userId: req.user && req.user.id });
		res.json(book);
	} catch (err) {
		res.json({ error: err.message || err.toString() });
	}
});

router.get('/get-chapter-detail', async (req, res) => {
	const { bookSlug, chapterSlug } = req.query;
	let chapter
	try {
		chapter = await Chapter.getBySlug({
			bookSlug,
			chapterSlug,
			userId: req.user && req.user.id,
			isAdmin: req.user && req.user.isAdmin,
		});
	} catch (err) {
		res.json({ error: err.message || err.toString() });
	}
	res.json(chapter);

});

export default router;