import 'isomorphic-fetch';

const port = process.env.PORT || 8000;
const ROOT_URL = `http://localhost:${port}`;

export default async function sendRequest(path, opts = {}) {
	const headers = Object.assign({}, opts.headers || {}, {
		'Content-type': 'application/json; charset=UTF-8',
	});

	const response = await fetch(
		`${ROOT_URL}${path}`,
		Object.assign({ method: 'POST', credentials: 'include' }, opts, { headers }),
	);

	const data = await response.json();

	if (data.error) {
		throw new Error(data.error);
	}

	return data;
}