/**
* Copyright (c) 2015​, salesforce.com, inc.
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without modification, are permitted provided
* that the following conditions are met:
*
*    Redistributions of source code must retain the above copyright notice, this list of conditions and the
*    following disclaimer.
*
*    Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
*    the following disclaimer in the documentation and/or other materials provided with the distribution.
*
*    Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
*    promote products derived from this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
* WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
* PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
* ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
* TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
* HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
* NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
* POSSIBILITY OF SUCH DAMAGE.
*/

var http            = require('http');
var bodyParser      = require('body-parser');
var _               = require('lodash');
var validUrls       = require('./config').routes;
var sampleResponses = require('./sample-responses');

module.exports = function(port) {
	'use strict';

	return http.createServer(function(req, res) {

		var sendResponse = function(res, status, data) {
			res.statusCode = status;
			res.end(JSON.stringify(data));
		};

		var _bodyParser   = bodyParser.json();
		var totalRequests = 0;

		res.setHeader('Content-Type', 'application/json');

		// check for valid URL (404)
		if(!_.contains(_.values(validUrls), req.url)) {
			res.statusCode = 404;
			res.end(JSON.stringify(sampleResponses['404']));
			return;
		}

		_bodyParser(req, res, function(err) {
			var data      = req.body.testingData;
			var reqMethod = req.method;
			var reqUrl    = req.url;
			var dataCheck = (data === 'test data');

			if(err) {
				throw new Error('problem with bodyParser');
			}

			if(reqUrl === validUrls.get && reqMethod === 'GET') {
				sendResponse(res, 200, sampleResponses.get200);
				return;
			}

			if(reqUrl === validUrls.post && dataCheck && reqMethod === 'POST') {
				sendResponse(res, 200, sampleResponses.post200);
				return;
			}

			if(reqUrl === validUrls.put && dataCheck && reqMethod === 'PUT') {
				res.statusCode = 200;
				res.end(JSON.stringify(sampleResponses.post200));
				return;
			}

			if(reqUrl === validUrls.delete && dataCheck && reqMethod === 'DELETE') {
				sendResponse(res, 200, sampleResponses.post200);
				return;
			}

			if(reqUrl === validUrls.patch && dataCheck && reqMethod === 'PATCH') {
				sendResponse(res, 200, sampleResponses.post200);
				return;
			}

			if(reqUrl === validUrls.invalidToken) {
				if(totalRequests === 0) {
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

			if(reqUrl === validUrls.notJson) {
				res.setHeader('Content-Type', 'text/html');
				sendResponse(res, 200, sampleResponses.get200);
				return;
			}

			// coverall
			sendResponse(res, 500, sampleResponses['500']);
			return;
		});
	}).listen(port);
};
