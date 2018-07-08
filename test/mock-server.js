/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

const http = require('http');
const bodyParser = require('body-parser');
const _ = require('lodash');
const validUrls = require('./config').routes;
const sampleResponses = require('./sample-responses');

module.exports = port => {
	'use strict';

	return http
		.createServer((req, res) => {
			const sendResponse = (res, status, data) => {
				res.statusCode = status;
				res.end(JSON.stringify(data));
			};

			const _bodyParser = bodyParser.json();
			let totalRequests = 0;

			res.setHeader('Content-Type', 'application/json');

			// check for valid URL (404)
			if (!_.includes(_.values(validUrls), req.url)) {
				res.statusCode = 404;
				res.end(JSON.stringify(sampleResponses['404']));
				return;
			}

			_bodyParser(req, res, function(err) {
				const data = req.body.testingData;
				const reqMethod = req.method;
				const reqUrl = req.url;
				const dataCheck = data === 'test data';

				if (err) {
					throw new Error('problem with bodyParser');
				}

				if (reqUrl === validUrls.get && reqMethod === 'GET') {
					sendResponse(res, 200, sampleResponses.get200);
					return;
				}

				if (reqUrl === validUrls.post && dataCheck && reqMethod === 'POST') {
					sendResponse(res, 200, sampleResponses.post200);
					return;
				}

				if (reqUrl === validUrls.put && dataCheck && reqMethod === 'PUT') {
					res.statusCode = 200;
					res.end(JSON.stringify(sampleResponses.post200));
					return;
				}

				if (reqUrl === validUrls.delete && dataCheck && reqMethod === 'DELETE') {
					sendResponse(res, 200, sampleResponses.post200);
					return;
				}

				if (reqUrl === validUrls.patch && dataCheck && reqMethod === 'PATCH') {
					sendResponse(res, 200, sampleResponses.post200);
					return;
				}

				if (reqUrl === validUrls.invalidToken) {
					if (totalRequests === 0) {
						res.writeHead(401, {
							'WWW-Authenticate': sampleResponses.invalidToken
						});
						res.end(JSON.stringify(sampleResponses['401']));
					} else {
						sendResponse(res, 200, sampleResponses.get200);
					}
					totalRequests++;
					return;
				}

				if (reqUrl === validUrls.notJson) {
					res.setHeader('Content-Type', 'text/html');
					sendResponse(res, 200, sampleResponses.get200);
					return;
				}

				// coverall
				sendResponse(res, 500, sampleResponses['500']);
				return;
			});
		})
		.listen(port);
};
