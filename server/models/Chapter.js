import mongoose from 'mongoose'

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
}

mongoSchema.index({bookId: 1, slug: 1}, {unique: true});
mongoSchema.index({bookId: 1, githubFilePath: 1}, {unique: true});

mongoSchema.loadClass(ChapterClass)

const Chapter = mongoose.model('Chapter', mongoSchema)

export default Chapter