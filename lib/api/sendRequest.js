import 'isomorphic-fetch';
import getRootUrl from './getRootUrl';

export default async function sendRequest(path, opts = {}) {
	const headers = Object.assign({}, opts.headers || {}, {
		'Content-type': 'application/json; charset=UTF-8',
	});

	let response
	try {
		response = await fetch(
			`${getRootUrl()}${path}`,
			Object.assign({ method: 'POST', credentials: 'include' }, opts, { headers }),
		);
	} catch (err) {
		throw new Error(err)
	}

	const data = await response.json();

	if (data.error) {
		throw new Error(data.error);
	}

	return data;
}