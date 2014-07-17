var http = require('http');
var bodyParser = require('body-parser');

var validUrls = [
	'/get/test'
	, '/post/test'
	, '/update/test'
	, '/delete/test'
];
var sampleResponses = require('./sample-responses');

module.exports = function(port) {
	'use strict';

	return http.createServer(function(req, res) {

		var _bodyParser = bodyParser.json();

		res.setHeader('Content-Type', 'application/json');

		// check for valid URL (404)
		if( validUrls.indexOf(req.url) === -1 ) {
			res.statusCode = 404;
			res.end(JSON.stringify(sampleResponses['404']));
			return;
		}

		_bodyParser(req, res, function(err) {

			if (err) {
				throw new Error('problem with bodyParser');
			}

			if( req.url === validUrls[ 0 ] ) {
				res.statusCode = 200;
				res.end( JSON.stringify( sampleResponses.get200 ) );
				return;
			}

			// // successful response (200)
			// if (req.body.clientId === 'test' && req.body.clientSecret === 'test') {
			// 	res.statusCode = 200;
			// 	res.end(JSON.stringify(sampleResponses['200']));
			// 	return;
			// }
			//
			// // server error (500)
			// if (req.body.clientId === 'test500' && req.body.clientSecret === 'test500') {
			// 	res.statusCode = 500;
			// 	res.end(JSON.stringify(sampleResponses['500']));
			// 	return;
			// }
			//
			// // unauthorized response (401)
			// if (req.body.clientId !== 'test' && req.body.clientSecret !== 'test') {
			// 	res.statusCode = 401;
			// 	res.end(JSON.stringify(sampleResponses['401']));
			// 	return;
			// }

			// coverall
			res.statusCode = 500;
			res.end(JSON.stringify(sampleResponses['500']));
			return;
		});
	}).listen(port);
};
