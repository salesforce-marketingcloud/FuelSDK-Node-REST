/*
 * Copyright (c) 2016, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

var expect     = require('chai').expect;
var sinon      = require('sinon');
var mockServer = require('../mock-server');
var FuelRest   = require('../../lib/fuel-rest');
var port       = 4550;
var localhost  = 'http://127.0.0.1:' + port;
var routes     = require('../config').routes;

describe('HTTP methods', function() {
	'use strict';

	var initOptions;
	var requestOptions;
	var server;

	before(function() {
		server = mockServer(port);
	});

	after(function() {
		server.close();
	});

	beforeEach(function() {
		initOptions = {
			auth: {
				clientId: 'testing'
				, clientSecret: 'testing'
			}
			, restEndpoint: localhost
		};

		requestOptions = {
			json: {
				testingData: 'test data'
			}
		};
	});

	describe('GET', function() {
		it('should deliver a GET + response', function(done) {
			var apiRequestSpy;
			var RestClient;

			apiRequestSpy = sinon.spy(FuelRest.prototype, 'apiRequest');
			RestClient    = new FuelRest(initOptions);

			// faking auth
			RestClient.AuthClient.accessToken = 'testForRest';
			RestClient.AuthClient.expiration  = 111111111111;

			RestClient.get({ uri: routes.get }, function(err, data) {
				// need to make sure we called apiRequest method
				expect(apiRequestSpy.calledOnce).to.be.true;

				// making sure original request was GET
				expect(data.res.req.method).to.equal('GET');

				FuelRest.prototype.apiRequest.restore(); // restoring function
				done();
			});
		});
	});

	describe('POST', function() {
		it('should deliver a POST', function(done) {
			var apiRequestSpy;
			var RestClient;

			apiRequestSpy      = sinon.spy(FuelRest.prototype, 'apiRequest');
			RestClient         = new FuelRest(initOptions);
			requestOptions.uri = routes.post;

			// faking auth
			RestClient.AuthClient.accessToken = 'testForRest';
			RestClient.AuthClient.expiration  = 111111111111;

			// doing post
			RestClient.post(requestOptions, function(err, data) {
				// need to make sure we called apiRequest method
				expect(apiRequestSpy.calledOnce).to.be.true;

				// making sure original request was POST
				expect(data.res.req.method).to.equal('POST');

				FuelRest.prototype.apiRequest.restore(); // restoring function
				done();
			});

		});
	});

	describe('PUT', function() {
		it('should deliever an PUT/UPDATE', function(done) {
			var apiRequestSpy;
			var RestClient;

			apiRequestSpy      = sinon.spy(FuelRest.prototype, 'apiRequest');
			RestClient         = new FuelRest(initOptions);
			requestOptions.uri = routes.put;

			// faking auth
			RestClient.AuthClient.accessToken = 'testForRest';
			RestClient.AuthClient.expiration  = 111111111111;

			// doing post
			RestClient.put(requestOptions, function(err, data) {
				// need to make sure we called apiRequest method
				expect(apiRequestSpy.calledOnce).to.be.true;

				// making sure original request was POST
				expect(data.res.req.method).to.equal('PUT');

				FuelRest.prototype.apiRequest.restore(); // restoring function
				done();
			});
		});
	});

	describe('PATCH', function() {
		it('should deliever an PATCH', function(done) {
			var apiRequestSpy;
			var RestClient;

			apiRequestSpy      = sinon.spy(FuelRest.prototype, 'apiRequest');
			RestClient         = new FuelRest(initOptions);
			requestOptions.uri = routes.patch;

			// faking auth
			RestClient.AuthClient.accessToken = 'testForRest';
			RestClient.AuthClient.expiration  = 111111111111;

			// doing post
			RestClient.patch(requestOptions, function(err, data) {
				// need to make sure we called apiRequest method
				expect(apiRequestSpy.calledOnce).to.be.true;

				// making sure original request was POST
				expect(data.res.req.method).to.equal('PATCH');

				FuelRest.prototype.apiRequest.restore(); // restoring function
				done();
			});
		});
	});

	describe('DELETE', function() {
		it('should deliever an DELETE', function(done) {
			var apiRequestSpy;
			var RestClient;

			apiRequestSpy      = sinon.spy(FuelRest.prototype, 'apiRequest');
			RestClient         = new FuelRest(initOptions);
			requestOptions.uri = routes.delete;

			// faking auth
			RestClient.AuthClient.accessToken = 'testForRest';
			RestClient.AuthClient.expiration  = 111111111111;

			// doing post
			RestClient.delete(requestOptions, function(err, data) {
				// need to make sure we called apiRequest method
				expect(apiRequestSpy.calledOnce).to.be.true;

				// making sure original request was POST
				expect(data.res.req.method).to.equal('DELETE');

				FuelRest.prototype.apiRequest.restore(); // restoring function
				done();
			});
		});
	});

});
