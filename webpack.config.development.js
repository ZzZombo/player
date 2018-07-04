const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const config = require('./webpack.config.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const out = path.resolve(__dirname, 'build');
const src = path.resolve(__dirname, 'src');

module.exports = merge(config,
{
	mode: 'development',
	devtool: 'inline-source-map',
	devServer:
	{
		contentBase: out
	},
	output:
	{
		filename: 'js/[name].js',
		chunkFilename: 'js/[name].bundle.js',
	},
	plugins: [
		new webpack.NamedModulesPlugin(),
		new MiniCssExtractPlugin(
		{
			filename: "js/[name].css",
			chunkFilename: "js/[id].css"
		}),
	],
	module:
	{
		rules: [
		{
			test: /\.css$/,
			include: src,
			use: [
				'style-loader',
				'css-loader'
			]
		},
		{
			test: /\.js$/,
			include: src,
			exclude: /node_modules/,
			loader: 'babel-loader',
			options:
			{
				cacheDirectory: true
			}
		}]
	}
});
