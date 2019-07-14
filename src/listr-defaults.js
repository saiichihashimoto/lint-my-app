/* istanbul ignore file */
export default {
	renderer:    process.env.NODE_ENV === 'test' ? 'silent' : 'default',
	exitOnError: false,
	concurrent:  true,
};
