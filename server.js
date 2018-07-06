/* eslint no-console: "off" */
const url = require('url');
const express = require('express');
const proxy = require('express-http-proxy');
const webpack = require('webpack');
const path = require('path');
const contentDir = path.resolve(__dirname, 'build');
const argv = require('optimist').argv;
const ngrok = require('ngrok');
ngrok.connect(3000).then((tunnelUrl) =>
{
	const app = express();
	app.use('/proxy/',proxy((req) => req.url.substr(1),
	{
		proxyReqPathResolver: function(req)
		{
			return url.parse(req.url.substr(1)).path;
		},
		userResDecorator: function(proxyRes, proxyResData, userReq, userRes)
		{
			const appProtocol = userReq.headers['x-forwarded-proto'] || userReq.protocol;
			const port = userReq.headers.host.split(':')[1] || (appProtocol == 'http' ? 80 : 443);
			const publicUrl = `${appProtocol}://${userReq.hostname}:${port}/proxy/`;
			let parsedUrl;
			if(userRes._headers.location)
			{
				parsedUrl = url.parse(userRes._headers.location);
				userRes.location(`${publicUrl}${userRes._headers.location}`);
			}
			else
				parsedUrl = url.parse(userReq.url.substr(1));
			userRes.set('x-base-url',`${parsedUrl.protocol}//${parsedUrl.hostname}/`);
			console.log('PROXY',userReq.url.substr(1));
			/*console.log(userReq.headers);
			console.log(userRes._headers);*/
			return proxyResData;
		},
		proxyReqOptDecorator: function(proxyReqOpts, srcReq)
		{
			proxyReqOpts.headers['referer'] = srcReq.headers['x-referer'] || srcReq.headers.referer;
			if(!proxyReqOpts.headers['referer'])
				delete proxyReqOpts.headers['referer'];
			return proxyReqOpts;
		}
	}));

	if(argv.mode == 'debug')
	{
		const webpackDevMiddleware = require('webpack-dev-middleware');
		const config = require('./webpack.config.development.js');
		const compiler = webpack(config);

		app.use(webpackDevMiddleware(compiler,
		{
			publicPath: config.output.publicPath,
			historyApiFallback: true,
			writeToDisk: true,
		}));
	}
	else
	{
		const fs = require('fs');
		app.use(function (req, res, next)
		{
			if(req.acceptsEncodings('gzip'))
			{
				const file = req.path.substr(1) || 'index.html';
				const gzip = `${file}.gzip`;
				const exists = fs.existsSync(path.resolve(contentDir, gzip));
				console.log(req.url, gzip, exists);
				if(exists)
				{
					req.url = '/' + gzip;
					res.locals.gzip = true;
				}
				return next();
			}
			next();
		});
		app.use(express.static(contentDir,
		{
			maxAge: '1 day',
			setHeaders(res)
			{
				if(res.locals.gzip)
					res.set('Content-Encoding', 'gzip');
			}
		}));
	}
	app.get('/*', function(req, res)
	{
		res.sendFile(path.resolve(contentDir,'index.html'), function(err)
		{
			if(err)
				res.status(500).send(err);
		});
	});
	app.use(function (req, res)
	{
		res.status(404).send(`<strong>Requested resource <code>${req.url}</code> not found.</strong>`);
	});
	app.listen(3000, function ()
	{
		console.log(`[${tunnelUrl}] Listening on port 3000!`);
	});
});
