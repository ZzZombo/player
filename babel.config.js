module.exports = {
	presets: [
		['@babel/preset-env',
		{
			useBuiltIns: 'usage',
			spec: true,
			modules: false,
			shippedProposals: true,
		}],
		['@babel/preset-react'],
		['minify'],
	],
	plugins: [
		['@babel/plugin-transform-runtime',
		{
			useBuiltIns: true,
			useESModules: true,
		}],
		['@babel/plugin-proposal-class-properties'],
	]
};
