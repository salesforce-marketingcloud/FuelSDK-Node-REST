/**
* Copyright (c) 2014​, salesforce.com, inc.
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

var version  = require('../package.json').version;
var helpers  = require('./helpers');
var request  = require('request');
var _        = require('lodash');
var FuelAuth = require('fuel-auth');
var Promiser = (typeof Promise === 'undefined') ? require('bluebird') : Promise;

var FuelRest = function(options) {
	'use strict';

	var authOptions = options && options.auth || {};

	// use fuel auth instance if applicable
	if(authOptions instanceof FuelAuth) {
		this.AuthClient = authOptions;
	} else {
		try {
			this.AuthClient = new FuelAuth(authOptions);
		} catch(err) {
			throw err;
		}
	}

	// adding version to object
	this.version = version;

	// setting up default headers
	this.defaultHeaders = _.merge({
		'User-Agent': 'node-fuel/' + this.version
		, 'Content-Type': 'application/json'
	}, options.headers);

	this.origin = options.origin || options.restEndpoint || 'https://www.exacttargetapis.com';
};

FuelRest.prototype.apiRequest = function(options, callback) {
	'use strict';

	var self = this;

	// we need options
	if(!_.isPlainObject(options)) {
		throw new TypeError('options argument is required');
	}

	return self.AuthClient
		.getAccessToken(_.clone(options.auth))
		.then(function(authResponse) {
			return new Promiser(function(resolve, reject) {
				var authOptions;
				var jsonRequested;
				var localError;
				var retry;

				if(!authResponse.accessToken) {
					localError     = new Error('No access token');
					localError.res = authResponse;
					reject(localError);
					return;
				}

				// retry request?
				retry       = options.retry || false;
				authOptions = _.clone(options.auth);

				// clean up
				delete options.retry;
				delete options.auth;

				options.uri     = helpers.resolveUri(self.origin, options.uri);
				options.headers = _.merge({}, self.defaultHeaders, options.headers);
				options.headers.Authorization = options.headers.Authorization || 'Bearer ' + authResponse.accessToken;

				request(options, function(err, res, body) {
					var parsedBody, restResponse;

					if(err) {
						reject(err);
						return;
					}

					// check if we should retry req
					if(helpers.isValid401(res) && retry) {
						options.auth = authOptions;
						self.apiRequest(options, callback);
						return;
					}

					// checking to make sure it's json from api
					jsonRequested = res.headers['content-type'] && res.headers[ 'content-type'].split(';')[ 0].toLowerCase() === 'application/json';
					if(!jsonRequested) {
						localError = new Error('API did not return JSON');
						helpers.cbRespond('error', localError, callback);
						reject(err);
						return;
					}

					// trying to parse body
					try {
						parsedBody = JSON.parse(body);
					} catch(err) {
						parsedBody = body;
					}

					restResponse = {
						res: res
						, body: parsedBody
					};

					helpers.cbRespond('response', restResponse, callback);
					resolve(restResponse);
				});
			});
		})
		.catch(function(err) {
			helpers.cbRespond('error', err, callback);
			return err;
		});
};

FuelRest.prototype.get = function(options, callback) {
	'use strict';

	options.method = 'GET';
	options.retry  = true;

	return this.apiRequest(options, callback);
};

FuelRest.prototype.post = function(options, callback) {
	'use strict';

	options.method = 'POST';
	options.retry  = true;

	return this.apiRequest(options, callback);
};

FuelRest.prototype.put = function(options, callback) {
	'use strict';

	options.method = 'PUT';
	options.retry  = true;

	return this.apiRequest(options, callback);
};

FuelRest.prototype.patch = function(options, callback) {
	'use strict';

	options.method = 'PATCH';
	options.retry  = true;

	return this.apiRequest(options, callback);
};

FuelRest.prototype.delete = function(options, callback) {
	'use strict';

	options.method = 'DELETE';
	options.retry  = true;

	return this.apiRequest(options, callback);
};

module.exports = FuelRest;
