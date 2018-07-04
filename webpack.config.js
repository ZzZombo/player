const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

const out = path.resolve(__dirname, 'build');
const src = path.resolve(__dirname, 'src');

module.exports = {
	entry:
	{
		app: path.resolve(src, 'index.js'),
	},
	resolve:
	{
		symlinks: false
	},
	optimization:
	{
		splitChunks:
		{
			chunks: 'all',
			automaticNameDelimiter: '.',
			cacheGroups:
			{
				'3dparty':
				{
					test: /[\\/]node_modules[\\/]/,
					priority: -10
				},
				default:
				{
					minChunks: 2,
					priority: -20,
					reuseExistingChunk: true
				}
			}
		}
	},
	output:
	{
		path: out,
		publicPath: '/',
	},
	plugins: [new CleanWebpackPlugin([out]),
		new HtmlWebpackPlugin(
		{
			inject: 'head',
			minify: true,
		}),
		new ScriptExtHtmlWebpackPlugin(
		{
			defaultAttribute: 'defer'
		}),
	],
};
