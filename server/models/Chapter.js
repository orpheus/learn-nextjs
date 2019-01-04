import mongoose from 'mongoose'

import generateSlug from '../utils/slugify';
import Book from './Book';

const {Schema} = mongoose

const mongoSchema = new Schema({
	bookId: {
		type: Schema.Types.ObjectId,
		required: true,
	},
	isFree: {
		type: Boolean,
		required: true,
		default: false,
	},
	title: {
		type: String,
		required: true,
	},
	slug: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		default: '',
		required: true,
	},
	htmlContent: {
		type: String,
		default: '',
		required: true,
	},
	excerpt: {
		type: String,
		default: '',
	},
	htmlExcerpt: {
		type: String,
		default: '',
	},
	createdAt: {
		type: Date,
		required: true,
	},
	githubFilePath: {
		type: String,
	},
	order: {
		type: Number,
		required: true,
	},
	seoTitle: String,
	seoDescription: String,
	sections: [
		{
			text: String,
			level: Number,
			escapedText: String,
		},
	],
});

class ChapterClass {
	static async getBySlug({bookSlug, chapterSlug}) {
		let book
		try {
			book = await Book.getBySlug({slug: bookSlug});
		} catch (err) {
			throw new Error(`Failed to get book by slug`)
		}

		if (!book) {
			throw new Error('Not found');
		}

		let chapter
		try {
			chapter = await this.findOne({bookId: book._id, slug: chapterSlug});
		} catch (err) {
			throw new Error(`Failed to findOne Chapter: ${err}`)
		}
		if (!chapter) {
			throw new Error('Not found');
		}

		const chapterObj = chapter.toObject();
		chapterObj.book = book;

		return chapterObj;
	}

	static async syncContent({ book, data }) {
		const {
			title,
			excerpt = '',
			isFree = false,
			seoTitle = '',
			seoDescription = '',
		} = data.attributes;

		const { body, path } = data;

		const chapter = await this.findOne({
			bookId: book.id,
			githubFilePath: path,
		});

		let order;

		if (path === 'introduction.md') {
			order = 1;
		} else {
			order = parseInt(path.match(/[0-9]+/), 10) + 1;
		}

		// 1. if chapter document does not exist - create slug and create document with all parameters
		if (!chapter) {
			const slug = await generateSlug(this, title, { bookId: book._id });

			return this.create({
				bookId: book._id,
				githubFilePath: path,
				title,
				slug,
				isFree,
				content,
				htmlContent,
				sections,
				excerpt,
				htmlExcerpt,
				order,
				seoTitle,
				seoDescription,
				createdAt: new Date(),
			});
		}
		// 2. else, define modifier for parameters: content, htmlContent, sections, excerpt, htmlExcerpt, isFree, order, seoTitle, seoDescription
		const modifier = {
			content,
			htmlContent,
			sections,
			excerpt,
			htmlExcerpt,
			isFree,
			order,
			seoTitle,
			seoDescription,
		};

		if (title !== chapter.title) {
			modifier.title = title;
			modifier.slug = await generateSlug(this, title, {
				bookId: chapter.bookId,
			});
		}
		// 3. update existing document with modifier
		return this.updateOne({ _id: chapter._id }, { $set: modifier });
	}
}

mongoSchema.index({bookId: 1, slug: 1}, {unique: true});
mongoSchema.index({bookId: 1, githubFilePath: 1}, {unique: true});

mongoSchema.loadClass(ChapterClass)

const Chapter = mongoose.model('Chapter', mongoSchema)

export default Chapter