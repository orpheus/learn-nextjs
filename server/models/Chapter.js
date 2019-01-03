import mongoose from 'mongoose'

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
		const book = await Book.getBySlug({slug: bookSlug});

		if (!book) {
			throw new Error('Not found');
		}

		const chapter = await this.findOne({bookId: book._id, slug: chapterSlug});

		if (!chapter) {
			throw new Error('Not found');
		}

		const chapterObj = chapter.toObject();
		chapterObj.book = book;

		return chapterObj;
	}
}

mongoSchema.index({ bookId: 1, slug: 1 }, { unique: true });
mongoSchema.index({ bookId: 1, githubFilePath: 1 }, { unique: true });

mongoSchema.loadClass(ChapterClass)

const Chapter = mongoose.model('Chapter', mongoSchema)

export default Chapter