/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */
'use strict';

const FuelAuth = require('fuel-auth');
const helpers = require('./helpers');
const request = require('request');
const version = require('../package.json').version;

const clone = require('lodash.clone');
const isPlainObject = require('lodash.isplainobject');

const methods = ['get', 'post', 'put', 'patch', 'delete'];

class FuelRest {
	constructor(options) {
		const authOptions = (options && options.auth) || {};

		// use fuel auth instance if applicable
		if (authOptions instanceof FuelAuth) {
			this.AuthClient = authOptions;
		} else {
			try {
				this.AuthClient = new FuelAuth(authOptions);
			} catch (err) {
				throw err;
			}
		}

		this.version = version;
		this.origin = options.origin || options.restEndpoint || 'https://www.exacttargetapis.com';
		this.defaultHeaders = Object.assign(
			{
				'User-Agent': `node-fuel/${this.version}`,
				'Content-Type': 'application/json'
			},
			options.headers
		);
	}
	apiRequest(options, callback) {
		if (!isPlainObject(options)) {
			throw new TypeError('options argument is required');
		}

		if (typeof callback === 'function') {
			return this._processRequest(options, callback);
		}

		return new Promise((resolve, reject) => {
			this._processRequest(options, (err, response) => {
				if (err) {
					return reject(err);
				}
				resolve(response);
			});
		});
	}
	_processRequest(options, callback) {
		this.AuthClient.getAccessToken(clone(options.auth), (err, authResponse) => {
			let retry = false;
			const consolidatedOpts = {};

			if (err) {
				callback(err, null);
				return;
			}

			if (!authResponse.accessToken) {
				let localError = new Error('No access token');
				localError.res = authResponse;
				callback(localError, null);
				return;
			}

			const authOptions = clone(options.auth);

			options.uri = helpers.resolveUri(this.origin, options.uri);
			options.headers = Object.assign({}, this.defaultHeaders, options.headers);

			if (!options.headers.Authorization) {
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
		});
	}
	_makeRequest(consolidatedOpts, callback) {
		const requestOptions = consolidatedOpts.req;

		request(requestOptions, (err, res, body) => {
			let parsedBody;
			let isResponseJson;

			if (err) {
				callback(err, null);
				return;
			}

			// check if we should retry req
			if (helpers.isValid401(res) && consolidatedOpts.retry) {
				this.AuthClient.invalidateToken(consolidatedOpts.accessToken);
				requestOptions.auth = consolidatedOpts.auth;
				this.apiRequest(requestOptions, callback);
				return;
			}

			isResponseJson =
				res.headers['content-type'] &&
				res.headers['content-type'].split(';')[0].toLowerCase() === 'application/json';

			if (!isResponseJson) {
				callback(new Error('API did not return JSON'), null);
				return;
			}

			// trying to parse body
			try {
				parsedBody = JSON.parse(body);
			} catch (err) {
				parsedBody = body;
			}

			callback(null, {
				res: res,
				body: parsedBody
			});
		});
	}
}

// setup simple http methods
methods.forEach(method => {
	FuelRest.prototype[method] = function(options, callback) {
		options.method = method.toUpperCase();
		options.retry = true;

		return this.apiRequest(options, callback);
	};
});

module.exports = FuelRest;
