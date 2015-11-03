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
'use strict';

var FuelAuth = require('fuel-auth');
var helpers  = require('./helpers');
var Promiser = (typeof Promise === 'undefined') ? require('bluebird') : Promise;
var request  = require('request');
var version  = require('../package.json').version;

var clone         = require('lodash.clone');
var isPlainObject = require('lodash.isplainobject');
var merge         = require('lodash.merge');

var methods = ['get', 'post', 'put', 'patch', 'delete'];

var FuelRest = function(options) {
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

	this.version = version;
	this.origin  = options.origin || options.restEndpoint || 'https://www.exacttargetapis.com';
	this.defaultHeaders = merge({
		'User-Agent': 'node-fuel/' + this.version
		, 'Content-Type': 'application/json'
	}, options.headers);
};

FuelRest.prototype.apiRequest = function(options, callback) {
	if(!isPlainObject(options)) {
		throw new TypeError('options argument is required');
	}

	if(typeof callback === 'function') {
		return this._processRequest(options, callback);
	}

	return new Promiser(function(resolve, reject) {
		this._processRequest(options, function(err, response) {
			if(err) {
				return reject(err);
			}
			resolve(response);
		});
	}.bind(this));
};

FuelRest.prototype._processRequest = function(options, callback) {
	this.AuthClient.getAccessToken(clone(options.auth), function(err, authResponse) {
		var authOptions;
		var localError;
		var retry;
		var consolidatedOpts = {};

		if(err) {
			callback(err, null);
			return;
		}

		if(!authResponse.accessToken) {
			localError     = new Error('No access token');
			localError.res = authResponse;
			callback(localError, null);
			return;
		}

		retry       = options.retry || false;
		authOptions = clone(options.auth);

		delete options.retry;
		delete options.auth;

		options.uri     = helpers.resolveUri(this.origin, options.uri);
		options.headers = merge({}, this.defaultHeaders, options.headers);
		options.headers.Authorization = options.headers.Authorization || 'Bearer ' + authResponse.accessToken;

		consolidatedOpts.req = options;
		consolidatedOpts.auth = authOptions;
		consolidatedOpts.retry = retry;

		this._makeRequest(consolidatedOpts, callback);
	}.bind(this));
};

FuelRest.prototype._makeRequest = function(consolidatedOpts, callback) {
	var requestOptions = consolidatedOpts.req;

	request(requestOptions, function(err, res, body) {
		var parsedBody;
		var isResponseJson;

		if(err) {
			callback(err, null);
			return;
		}

		// check if we should retry req
		if(helpers.isValid401(res) && consolidatedOpts.retry) {
			requestOptions.auth = consolidatedOpts.auth;
			this.apiRequest(requestOptions, callback);
			return;
		}

		isResponseJson = res.headers['content-type'] && res.headers[ 'content-type'].split(';')[ 0].toLowerCase() === 'application/json';
		if(!isResponseJson) {
			callback(new Error('API did not return JSON'), null);
			return;
		}

		// trying to parse body
		try {
			parsedBody = JSON.parse(body);
		} catch(err) {
			parsedBody = body;
		}

		callback(null, {
			res: res
			, body: parsedBody
		});
	}.bind(this));
};

// setup simple http methods
methods.forEach(function(method) {
	FuelRest.prototype[method] = function(options, callback) {
		options.method = method.toUpperCase();
		options.retry  = true;

		return this.apiRequest(options, callback);
	};
});

module.exports = FuelRest;
