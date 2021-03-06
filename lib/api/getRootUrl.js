export default function getRootURL() {
	const port = process.env.PORT || 8001;
	const dev = process.env.NODE_ENV !== 'production';
	const ROOT_URL = dev ? `http://localhost:${port}` : 'https://builderbook.org';

	return ROOT_URL;
}