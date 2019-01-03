// const mongoose = require('mongoose');
// const User = require('../../../server/models/User'); // jest cannot handle this import
// toDo: submit issue on GitHub
// describe('slugify', () => {
// 	beforeAll(async () => {
// 		await mongoose.connect(global.__MONGO_URI__);
// 		console.log('connected');
// 	});
// 	afterAll(async () => {
// 		await mongoose.disconnect();
// 		console.log('disconnected');
// 	});
// 	test('no duplication', async () => {
// 		expect.assertions(1);
// 		await User.remove();
// 		const user = await User.signInOrSignUp({
// 			googleId: 'test1',
// 			email: 'test1@test.ts',
// 			googleToken: { accessToken: 'test1', refreshToken: 'test1' },
// 			displayName: 'Test Name',
// 			avatarUrl: 'test1',
// 		});
// 		expect(user.slug).toBe('test-name');
// 	});
// });