/* istanbul ignore file */
export default function(err) {
	const queue = [err];

	while (queue.length) {
		const currentErr = queue.shift();

		if (currentErr.errors) {
			queue.push(...currentErr.errors);
		} else if (currentErr.all) {
			console.log(currentErr.all); /* eslint-disable-line no-console */
		} else if (currentErr.stderr) {
			console.error(currentErr.stderr); /* eslint-disable-line no-console */
		} else if (currentErr.stdout) {
			console.log(currentErr.stdout); /* eslint-disable-line no-console */
		} else {
			console.error(currentErr); /* eslint-disable-line no-console */
		}
	}
}
