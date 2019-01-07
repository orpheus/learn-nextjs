import mongoose from 'mongoose';
import frontmatter from 'front-matter';

import generateSlug from '../utils/slugify';
import Chapter from './Chapter';

import { getCommits, getContent } from '../github';
import logger from '../logs';

import Purchase from './Purchase';
import { stripeCharge } from '../stripe';
import getEmailTemplate from './EmailTemplate';
import sendEmail from '../aws';

const ROOT_URL = 'http://localhost:8000';

const {Schema} = mongoose;

const mongoSchema = new Schema({
	// parameters
	name: {
		type: String,
		required: true,
	},
	slug: {
		type: String,
		required: true,
		unique: true,
	},
	createdAt: {
		type: Date,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	githubRepo: {
		type: String,
		required: true,
	},
	githubLastCommitSha: String,
});


class BookClass {
	// methods
	static async list({offset = 0, limit = 10} = {}) {
		// some code
		const books = await this.find({})
			.sort({createdAt: -1})
			.skip(offset)
			.limit(limit);
		return {books};
	}

	static async getBySlug({slug}) {
		// some code
		let bookDoc
		try {
			bookDoc = await this.findOne({slug});
		} catch (err) {
			throw new Error(`Failed to findOne Book by slug: ${slug}`)
		}
		if (!bookDoc) {
			throw new Error('Book not found');
		}

		const book = bookDoc.toObject();

		book.chapters = (await Chapter.find({bookId: book._id}, 'title slug')
			.sort({order: 1}))
			.map(chapter => chapter.toObject());

		return book;
	}

	static async add({name, price, githubRepo}) {
		// some code
		const slug = await generateSlug(this, name);

		if (!slug) {
			throw new Error(`Error with slug generation for name: ${name}`);
		}

		return this.create({
			name,
			slug,
			price,
			githubRepo,
			createdAt: new Date(),
		});
	}

	static async edit({id, name, price, githubRepo}) {
		// some code
		const book = await this.findById(id, 'slug name');

		if (!book) {
			throw new Error('Book is not found by id');
		}

		const modifier = {price, githubRepo};

		if (name !== book.name) {
			modifier.name = name;
			modifier.slug = await generateSlug(this, name);
		}

		await this.updateOne({_id: id}, {$set: modifier});

		const editedBook = await this.findById(id, 'slug');

		return editedBook;
	}

	static async syncContent({id, githubAccessToken}) {
		let book
		try {
			book = await this.findById(id, 'githubRepo githubLastCommitSha');
		} catch (err) {
			throw new Error(`Failed to Book findById: ${err}`)
		}

		if (!book) {
			throw new Error('Not found');
		}

		const lastCommit = await getCommits({
			accessToken: githubAccessToken,
			repoName: book.githubRepo,
			limit: 1,
		});

		if (!lastCommit || !lastCommit.data || !lastCommit.data[0]) {
			throw new Error('No change!');
		}

		const lastCommitSha = lastCommit.data[0].sha;
		if (lastCommitSha === book.githubLastCommitSha) {
			throw new Error('No change!');
		}

		const mainFolder = await getContent({
			accessToken: githubAccessToken,
			repoName: book.githubRepo,
			path: '',
		});

		await Promise.all(mainFolder.data.map(async (f) => {
			console.log('file path', f.path)

			if (f.type !== 'file') {
				return;
			}

			if (f.path !== 'introduction.md' && !/chapter-(\d+)\.md/.test(f.path)) {
				// not chapter content, skip
				return;
			}
			//
			// if (f.path !== 'introduction.md' && !/chapter-(\[0-9]+)\.md/.test(f.path)) {
			// 	// not chapter content, skip
			// 	return;
			// }

			const chapter = await getContent({
				accessToken: githubAccessToken,
				repoName: book.githubRepo,
				path: f.path,
			});

			const data = frontmatter(Buffer.from(chapter.data.content, 'base64').toString('utf8'));

			data.path = f.path;

			try {
				await Chapter.syncContent({book, data});
				logger.info('Content is synced', {path: f.path});
			} catch (error) {
				logger.error('Content sync has error', {path: f.path, error});
			}
		}));

		return book.update({githubLastCommitSha: lastCommitSha});
	}
	static async buy({ id, user, stripeToken }) {
		if (!user) {
			throw new Error('User required');
		}

		const book = await this.findById(id, 'name slug price');
		if (!book) {
			throw new Error('Book not found');
		}

		const isPurchased = (await Purchase.find({ userId: user._id, bookId: id }).countDocuments()) > 0;
		if (isPurchased) {
			throw new Error('Already bought this book');
		}

		const chargeObj = await stripeCharge({
			amount: book.price * 100,
			token: stripeToken.id,
			buyerEmail: user.email,
		});

		const template = await getEmailTemplate('purchase', {
			userName: user.displayName,
			bookTitle: book.name,
			bookUrl: `${ROOT_URL}/books/${book.slug}/introduction`,
		});

		try {
			await sendEmail({
				from: `Kelly from builderbook.org <${process.env.EMAIL_SUPPORT_FROM_ADDRESS}>`,
				to: [user.email],
				subject: template.subject,
				body: template.message,
			});
		} catch (error) {
			logger.error('Email sending error:', error);
		}

		return Purchase.create({
			userId: user._id,
			bookId: book._id,
			amount: book.price * 100,
			stripeCharge: chargeObj,
			createdAt: new Date(),
		});
	}
}

mongoSchema.loadClass(BookClass);

const Book = mongoose.model('Book', mongoSchema);

export default Book;