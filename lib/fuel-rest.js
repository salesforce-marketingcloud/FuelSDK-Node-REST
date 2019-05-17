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
const merge = require('lodash.merge');
const isPlainObject = require('lodash.isplainobject');

class FuelRest {
	/**
	 * Constuctor of Fuel Rest object
	 * @constructor
	 * @param {FuelAuth|Object} options.auth - Instance of Fuel Auth or object used to initialise Fuel Auth Object
	 * @param {string} options.origin - endpoint to send api requests to
	 * @param {Object} options.headers - heads to merge onto all requests
	 */
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
		this.globalReqOptions = options.globalReqOptions || {};
	}
	/**
	 * Method that makes the api request
	 * @param {Object} options - request modules options. see https://github.com/request/request#requestoptions-callback
	 * @param {boolean} options.auth.force - force the retrieval of a new access token
	 * @param {Object} options.retry - object of headers to add to this individual request
	 * @param {function} callback - callback to give results to. if not specified promise will be returned
	 * @returns {?Promise}
	 */
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

		const requestOptions = merge(
			{},
			this.globalReqOptions,
			options.auth
		);

		this.AuthClient.getAccessToken(requestOptions)
			.then(tokenInfo => {
				if (!tokenInfo.accessToken) {
					let error = new Error('No access token');
					error.res = tokenInfo;

					return Promise.reject(error);
				}
				return tokenInfo;
			})
			.then(tokenInfo => {
				let retry = options.retry || false;
				const consolidatedOpts = {};
				const authOptions = clone(options.auth);
				const headers = options.headers;

				options.uri = helpers.resolveUri(this.origin, options.uri);
				if(this.AuthClient.authVersion === 2){
					options.uri = helpers.resolveUriForOAuth2(options.uri, tokenInfo.rest_instance_url);
				}
				options.headers = Object.assign({}, this.defaultHeaders, options.headers, {
					// on a retry, the auth header is removed, so this will only add the header passed in
					// if it's not the retry
					Authorization: (headers && headers.Authorization) || 'Bearer ' + tokenInfo.accessToken
				});

				delete options.retry;
				delete options.auth;

				consolidatedOpts.req = options;
				consolidatedOpts.auth = authOptions;
				consolidatedOpts.accessToken = tokenInfo.accessToken;
				consolidatedOpts.retry = retry;

				this._makeRequest(consolidatedOpts, callback);
			})
			.catch(err => callback(err, null));
	}
	_makeRequest(consolidatedOpts, callback) {
		const requestOptions = merge(
			{},
			this.globalReqOptions,
			consolidatedOpts.req
		);
		
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
				const retryOptions = Object.assign({}, requestOptions, {
					auth: consolidatedOpts.auth,
					retry: false,
					headers: Object.assign({}, requestOptions.headers, {
						Authorization: null
					})
				});
				this.apiRequest(retryOptions, callback);
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
	/**
	 * Method that makes the GET api request
	 * @param {Object} options - request modules options. see https://github.com/request/request#requestoptions-callback
	 * @param {Object} options.auth - force the retrieval of a new access token
	 * @param {boolean} options.auth.force - force the retrieval of a new access token
	 * @param {boolean} [options.retry=true] - force a retry if request fails due to token expiration
	 * @param {function} callback - callback to give results to. if not specified promise will be returned
	 * @returns {?Promise}
	 */
	get(options, callback) {
		options.method = 'GET';
		options.retry = true;

		return this.apiRequest(options, callback);
	}
	/**
	 * Method that makes the POST api request
	 * @param {Object} options - request modules options. see https://github.com/request/request#requestoptions-callback
	 * @param {boolean} options.auth.force - force the retrieval of a new access token
	 * @param {boolean} [options.retry=true] - force a retry if request fails due to token expiration
	 * @param {function} callback - callback to give results to. if not specified promise will be returned
	 * @returns {?Promise}
	 */
	post(options, callback) {
		options.method = 'POST';
		options.retry = true;

		return this.apiRequest(options, callback);
	}
	/**
	 * Method that makes the PUT api request
	 * @param {Object} options - request modules options. see https://github.com/request/request#requestoptions-callback
	 * @param {boolean} options.auth.force - force the retrieval of a new access token
	 * @param {boolean} [options.retry=true] - force a retry if request fails due to token expiration
	 * @param {function} callback - callback to give results to. if not specified promise will be returned
	 * @returns {?Promise}
	 */
	put(options, callback) {
		options.method = 'PUT';
		options.retry = true;

		return this.apiRequest(options, callback);
	}
	/**
	 * Method that makes the PATCH api request
	 * @param {Object} options - request modules options. see https://github.com/request/request#requestoptions-callback
	 * @param {boolean} options.auth.force - force the retrieval of a new access token
	 * @param {boolean} [options.retry=true] - force a retry if request fails due to token expiration
	 * @param {function} callback - callback to give results to. if not specified promise will be returned
	 * @returns {?Promise}
	 */
	patch(options, callback) {
		options.method = 'PATCH';
		options.retry = true;

		return this.apiRequest(options, callback);
	}
	/**
	 * Method that makes the DELETE api request
	 * @param {Object} options - request modules options. see https://github.com/request/request#requestoptions-callback
	 * @param {boolean} options.auth.force - force the retrieval of a new access token
	 * @param {boolean} [options.retry=true] - force a retry if request fails due to token expiration
	 * @param {function} callback - callback to give results to. if not specified promise will be returned
	 * @returns {?Promise}
	 */
	delete(options, callback) {
		options.method = 'DELETE';
		options.retry = true;

		return this.apiRequest(options, callback);
	}
}

module.exports = FuelRest;
