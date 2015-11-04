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

var expect     = require('chai').expect;
var FuelAuth   = require('fuel-auth');
var FuelRest   = require('../../lib/fuel-rest');
var mockServer = require('../mock-server');
var port       = 4550;
var sinon      = require('sinon');
var routes     = require('../config').routes;

var localhost = 'http://127.0.0.1:' + port;

describe('apiRequest method', function() {
	'use strict';

	var RestClient;
	var requestOptions;
	var server;

	var initOptions = {
		auth: {
			clientId: 'testing'
			, clientSecret: 'testing'
		}
		, restEndpoint: localhost
	};

	before(function() {
		// setting up rest client for all tests to use
		RestClient = new FuelRest(initOptions);

		// faking auth
		RestClient.AuthClient.accessToken = 'testForRest';
		RestClient.AuthClient.expiration  = 111111111111;

		// setting up server
		server = mockServer(port);
	});

	after(function() {
		server.close();
	});

	beforeEach(function() {
		requestOptions = {
			method: 'GET'
			, uri: routes.get
		};
	});

	it('should throw an error when no options are passed', function() {
		try {
			RestClient.apiRequest(null, function() {});
		} catch(err) {
			expect(err.name).to.equal('TypeError');
			expect(err.message).to.equal('options argument is required');
		}
	});

	it('should make a requset to the API', function(done) {
		RestClient.apiRequest(requestOptions, function(err, data) {
			// making sure original request was GET
			expect(data.res.req.method).to.equal('GET');

			// finish async test
			done();
		});
	});

	it('should add extra headers to default headers', function(done) {
		requestOptions.headers = {
			'X-Test-Header': 'testing value'
		};

		RestClient.apiRequest(requestOptions, function(err, data) {
			// making sure custom header was sent in request
			expect(data.res.req._headers['x-test-header']).to.equal(requestOptions.headers['X-Test-Header']);

			// finish async test
			done();
		});
	});

	it('should add extra options to request module - testing qs', function(done) {
		requestOptions.qs = {
			'test': 1
		};

		RestClient.apiRequest(requestOptions, function(err, data) {
			// checking to make sure path on request was correct
			expect(data.res.req.path).to.equal('/get/test?test=1');

			// finish async test
			done();
		});
	});

	it('should override Authorization header if passed', function(done) {
		requestOptions.headers = {
			Authorization: 'Bearer diffTestForRest'
		};

		RestClient.apiRequest(requestOptions, function(err, data) {
			// making sure different auth header was sent in request
			expect(data.res.req._headers.authorization).to.equal(requestOptions.headers.Authorization);

			// finish async test
			done();
		});
	});

	it('should return an error when application type returned is not application/json', function(done) {
		requestOptions.uri = routes.notJson;

		RestClient.apiRequest(requestOptions, function(err, data) {
			// error should be passed, and data should be null
			expect(!!err).to.be.true;
			expect(err.message).to.equal('API did not return JSON');
			expect(data).to.be.null;

			// finish async test
			done();
		});
	});

	it('should error when request module errors', function(done) {
		var options = {
			method: 'TEST'
			, uri: routes.notJson
		};

		RestClient.apiRequest(options, function(err, data) {
			// error should be passed, and data should be null
			expect(!!err).to.be.true;
			expect(data).to.be.null;

			// finish async test
			done();
		});
	});

	it('should return an error when no accessToken is available', function(done) {
		var RestClient;

		// stubbing response from auth client with no access token
		sinon.stub(FuelAuth.prototype, 'getAccessToken', function(options, callback) {
			callback(null, {
				documentation: "https://code.docs.exacttarget.com/rest/errors/404"
				, errorcode: 404
				, message: "Not Found"
			});
		});

		RestClient = new FuelRest(initOptions);

		RestClient.apiRequest(requestOptions, function(err, data) {
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

	it('should handle an error from the Auth Client', function(done) {
		var RestClient;

		// stubbing response from auth client with no access token
		sinon.stub(FuelAuth.prototype, 'getAccessToken', function(options, callback) {
			callback(new Error('error from auth client'), null);
		});

		RestClient = new FuelRest(initOptions);

		RestClient.apiRequest(requestOptions, function(err, data) {
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

	it('should try request again if 401 stating token is invalid', function(done) {
		var requestSpy;
		var RestClient;

		requestSpy = sinon.spy(FuelRest.prototype, 'apiRequest');

		sinon.stub(FuelAuth.prototype, 'getAccessToken', function(options, callback) {
			callback(null, { accessToken: 'testing', expiresIn: 3600 });
		});

		RestClient = new FuelRest(initOptions);

		requestOptions.uri   = routes.invalidToken;
		requestOptions.retry = true;
		requestOptions.auth  = {
			force: true
		};

		RestClient.apiRequest(requestOptions, function() {
			// error should be passed, and data should be null
			expect(requestSpy.calledTwice).to.be.true;

			FuelRest.prototype.apiRequest.restore();
			FuelAuth.prototype.getAccessToken.restore();
			// finish async test
			done();
		}, true);
	});

	it('should skip retry when Authorization header is provided and request 401s', function(done) {
		var requestSpy;
		var RestClient;

		requestSpy = sinon.spy(FuelRest.prototype, 'apiRequest');

		sinon.stub(FuelAuth.prototype, 'getAccessToken', function(options, callback) {
			callback(null, { accessToken: 'testing', expiresIn: 3600 });
		});

		RestClient = new FuelRest(initOptions);

		requestOptions.uri   = routes.invalidToken;
		requestOptions.retry = true;
		requestOptions.auth  = {
			force: true
		};
		requestOptions.headers = {
			Authorization: 'Bearer SomeToken'
		};

		RestClient.apiRequest(requestOptions, function() {
			// error should be passed, and data should be null
			expect(requestSpy.calledTwice).to.be.false;

			FuelRest.prototype.apiRequest.restore();
			FuelAuth.prototype.getAccessToken.restore();
			// finish async test
			done();
		}, true);
	});

	it('should use a full URI if provided', function(done) {
		requestOptions.uri = localhost + routes.get;

		RestClient.apiRequest(requestOptions, function(err, data) {
			// making sure original request was GET
			expect(data.res.req.method).to.equal('GET');

			// finish async test
			done();
		});
	});

	describe('invalidating token', function() {
		it('should tell auth client to invalide it\'s token', function(done) {
			var invalidateSpy = sinon.stub(FuelAuth.prototype, 'invalidateToken');
			var RestClient;

			sinon.stub(FuelAuth.prototype, 'getAccessToken', function(options, callback) {
				callback(null, { accessToken: 'testing', expiresIn: 3600 });
			});

			RestClient = new FuelRest(initOptions);

			requestOptions.uri   = routes.invalidToken;
			requestOptions.retry = true;
			requestOptions.auth  = {
				force: true
			};

			RestClient.apiRequest(requestOptions, function() {
				expect(invalidateSpy.callCount).to.equal(1);

				FuelAuth.prototype.getAccessToken.restore();
				FuelAuth.prototype.invalidateToken.restore();

				// finish async test
				done();
			}, true);
		});
	});
});
