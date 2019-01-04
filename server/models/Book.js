import mongoose from 'mongoose';

import generateSlug from '../utils/slugify';
import Chapter from './Chapter';

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
			githubRepo
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
}

mongoSchema.loadClass(BookClass);

const Book = mongoose.model('Book', mongoSchema);

export default Book;