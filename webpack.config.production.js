const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const config = require('./webpack.config.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

//const out = path.resolve(__dirname, 'build');
const src = path.resolve(__dirname, 'src');
module.exports = merge(config,
{
	mode: 'production',
	devtool: 'nosources-source-map',
	output:
	{
		filename: 'js/[name].[chunkhash].js',
		chunkFilename: 'js/[name].[chunkhash].js',
	},
	optimization:
	{
		runtimeChunk: 'single',
		minimizer: [new UglifyJsPlugin(
			{
				cache: true,
				parallel: true,
				sourceMap: true,
				uglifyOptions:
				{
					ecma: 6,
					output:
					{
						comments: false,
					},
					toplevel: true,
				},
			}),
			new OptimizeCssAssetsPlugin(
			{})
		],
	},
	plugins: [
		new webpack.HashedModuleIdsPlugin(),
		new webpack.DefinePlugin(
		{
			'process.env.NODE_ENV': '"production"',
		}),
		new MiniCssExtractPlugin(
		{
			filename: "css/[name].[contenthash].css",
			chunkFilename: "css/[id].[contenthash].css"
		}),
		new CompressionPlugin(
		{
			threshold: 1024,
			asset: '[file].gzip',
		}),
	],
	module:
	{
		rules: [
		{
			test: /\.css$/,
			include: src,
			exclude: /node_modules/,
			use: [MiniCssExtractPlugin.loader,
			{
				loader: 'css-loader',
				options:
				{
					importLoaders: 1,
					modules: true,
				}
			},
			'postcss-loader',]
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
