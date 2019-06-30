/* istanbul ignore file */
export default {
	renderer:    process.env.NODE_ENV === 'test' ? 'silent' : /* istanbul ignore next */ 'default',
	exitOnError: false,
	concurrent:  true,
};
