/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

const expect = require('chai').expect;
const FuelAuth = require('fuel-auth');
const FuelRest = require('../../lib/fuel-rest');
const mockServer = require('../mock-server');
const routes = require('../config').routes;
const sinon = require('sinon');

const port = 4550;
const localhost = `http://127.0.0.1:${port}`;

describe('apiRequest method', function() {
	'use strict';

	let RestClient;
	let requestOptions;
	let server;

	let initOptions = {
		auth: {
			clientId: 'testing',
			clientSecret: 'testing'
		},
		restEndpoint: localhost
	};

	before(() => {
		// setting up rest client for all tests to use
		RestClient = new FuelRest(initOptions);

		// faking auth
		RestClient.AuthClient.accessToken = 'testForRest';
		RestClient.AuthClient.expiration = 111111111111;

		// setting up server
		server = mockServer(port);
	});

	after(() => server.close());

	beforeEach(() => {
		requestOptions = {
			method: 'GET',
			uri: routes.get
		};
	});

	it('should throw an error when no options are passed', () => {
		try {
			RestClient.apiRequest(null, () => {});
		} catch (err) {
			expect(err.name).to.equal('TypeError');
			expect(err.message).to.equal('options argument is required');
		}
	});

	it('should make a requset to the API', done => {
		RestClient.apiRequest(requestOptions, (err, data) => {
			// making sure original request was GET
			expect(data.res.req.method).to.equal('GET');

			// finish async test
			done();
		});
	});

	it('should add extra headers to default headers', done => {
		requestOptions.headers = {
			'X-Test-Header': 'testing value'
		};

		RestClient.apiRequest(requestOptions, (err, data) => {
			// making sure custom header was sent in request
			expect(data.res.req._headers['x-test-header']).to.equal(requestOptions.headers['X-Test-Header']);

			// finish async test
			done();
		});
	});

	it('should add extra options to request module - testing qs', done => {
		requestOptions.qs = {
			test: 1
		};

		RestClient.apiRequest(requestOptions, (err, data) => {
			// checking to make sure path on request was correct
			expect(data.res.req.path).to.equal('/get/test?test=1');

			// finish async test
			done();
		});
	});

	it('should override Authorization header if passed', done => {
		requestOptions.headers = {
			Authorization: 'Bearer diffTestForRest'
		};

		RestClient.apiRequest(requestOptions, (err, data) => {
			// making sure different auth header was sent in request
			expect(data.res.req._headers.authorization).to.equal(requestOptions.headers.Authorization);

			// finish async test
			done();
		});
	});

	it('should return an error when application type returned is not application/json', done => {
		requestOptions.uri = routes.notJson;

		RestClient.apiRequest(requestOptions, (err, data) => {
			// error should be passed, and data should be null
			expect(!!err).to.be.true;
			expect(err.message).to.equal('API did not return JSON');
			expect(data).to.be.null;

			// finish async test
			done();
		});
	});

	it('should error when request module errors', done => {
		var options = {
			method: 'TEST',
			uri: routes.notJson
		};

		RestClient.apiRequest(options, (err, data) => {
			// error should be passed, and data should be null
			expect(!!err).to.be.true;
			expect(data).to.be.null;

			// finish async test
			done();
		});
	});

	it('should return an error when no accessToken is available', done => {
		let RestClient;

		// stubbing response from auth client with no access token
		sinon.stub(FuelAuth.prototype, 'getAccessToken').callsFake(() => {
			return new Promise(resolve => {
				resolve({
					documentation: 'https://code.docs.exacttarget.com/rest/errors/404',
					errorcode: 404,
					message: 'Not Found'
				});
			});
		});

		RestClient = new FuelRest(initOptions);

		RestClient.apiRequest(requestOptions, (err, data) => {
			// error should be passed, and data should be null
			expect(!!err).to.be.true;
			expect(err.message).to.equal('No access token');
			expect(err.res).to.be.an('object');
			expect(data).to.be.null;

			// restoring stubbed function
			FuelAuth.prototype.getAccessToken.restore();

			// finish async test
			done();
		});
	});

	it('should handle an error from the Auth Client', done => {
		var RestClient;

		// stubbing response from auth client with no access token
		sinon.stub(FuelAuth.prototype, 'getAccessToken').callsFake(() => {
			return new Promise((resolve, reject) => {
				reject(new Error('error from auth client'));
			});
		});

		RestClient = new FuelRest(initOptions);

		RestClient.apiRequest(requestOptions, (err, data) => {
			// error should be passed, and data should be null
			expect(!!err).to.be.true;
			expect(err.message).to.equal('error from auth client');
			expect(data).to.be.null;

			// restoring stubbed function
			FuelAuth.prototype.getAccessToken.restore();

			// finish async test
			done();
		});
	});

	it('should try request again if 401 stating token is invalid', done => {
		var requestSpy;
		var RestClient;
		let firstAttempt = true;

		requestSpy = sinon.spy(FuelRest.prototype, 'apiRequest');

		sinon.stub(FuelAuth.prototype, 'getAccessToken').callsFake(() => {
			var accessToken = firstAttempt ? 'testing' : 'retry';
			firstAttempt = false;
			return new Promise(resolve => resolve({ accessToken, expiresIn: 3600 }));
		});

		RestClient = new FuelRest(initOptions);

		requestOptions.uri = routes.invalidToken;
		requestOptions.retry = true;
		requestOptions.auth = {
			force: true
		};

		RestClient.apiRequest(
			requestOptions,
			() => {
				// error should be passed, and data should be null
				expect(requestSpy.calledTwice).to.be.true;
				expect(requestSpy.args[0][0].headers.Authorization).to.equal('Bearer testing');
				expect(requestSpy.args[1][0].headers.Authorization).to.equal('Bearer retry');

				FuelRest.prototype.apiRequest.restore();
				FuelAuth.prototype.getAccessToken.restore();
				// finish async test
				done();
			},
			true
		);
	});

	it('should skip retry when Authorization header is provided and request 401s', done => {
		var requestSpy;
		var RestClient;

		requestSpy = sinon.spy(FuelRest.prototype, 'apiRequest');

		sinon.stub(FuelAuth.prototype, 'getAccessToken').callsFake(() => {
			return new Promise(resolve => resolve({ accessToken: 'testing', expiresIn: 3600 }));
		});

		RestClient = new FuelRest(initOptions);

		requestOptions.uri = routes.invalidToken;
		requestOptions.retry = true;
		requestOptions.auth = {
			force: true
		};
		requestOptions.headers = {
			Authorization: 'Bearer SomeToken'
		};

		RestClient.apiRequest(
			requestOptions,
			function() {
				// error should be passed, and data should be null
				expect(requestSpy.calledTwice).to.be.false;

				FuelRest.prototype.apiRequest.restore();
				FuelAuth.prototype.getAccessToken.restore();
				// finish async test
				done();
			},
			true
		);
	});

	it('should use a full URI if provided', done => {
		requestOptions.uri = localhost + routes.get;

		RestClient.apiRequest(requestOptions, (err, data) => {
			// making sure original request was GET
			expect(data.res.req.method).to.equal('GET');

			// finish async test
			done();
		});
	});

	describe('invalidating token', () => {
		it("should tell auth client to invalide it's token", done => {
			var invalidateSpy = sinon.stub(FuelAuth.prototype, 'invalidateToken');
			var RestClient;

			sinon.stub(FuelAuth.prototype, 'getAccessToken').callsFake(() => {
				return new Promise(resolve => resolve({ accessToken: 'testing', expiresIn: 3600 }));
			});

			RestClient = new FuelRest(initOptions);

			requestOptions.uri = routes.invalidToken;
			requestOptions.retry = true;
			requestOptions.auth = {
				force: true
			};

			RestClient.apiRequest(
				requestOptions,
				function() {
					expect(invalidateSpy.callCount).to.equal(1);

					FuelAuth.prototype.getAccessToken.restore();
					FuelAuth.prototype.invalidateToken.restore();

					// finish async test
					done();
				},
				true
			);
		});
	});
});
