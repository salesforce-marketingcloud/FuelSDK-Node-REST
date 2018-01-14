/* 
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
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
	var authOptions;

	if(!(this instanceof FuelRest)) {
		return new FuelRest(options);
	}

	authOptions = options && options.auth || {};

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
		var retry = false;
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

		authOptions = clone(options.auth);

		options.uri     = helpers.resolveUri(this.origin, options.uri);
		options.headers = merge({}, this.defaultHeaders, options.headers);

		if(!options.headers.Authorization) {
			options.headers.Authorization = 'Bearer ' + authResponse.accessToken;
			retry = options.retry || false;
		}

		delete options.retry;
		delete options.auth;

		consolidatedOpts.req = options;
		consolidatedOpts.auth = authOptions;
		consolidatedOpts.accessToken = authResponse.accessToken;
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
			this.AuthClient.invalidateToken(consolidatedOpts.accessToken);
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
