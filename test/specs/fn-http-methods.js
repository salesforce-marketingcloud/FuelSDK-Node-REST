/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

const expect = require('chai').expect;
const FuelRest = require('../../lib/fuel-rest');
const mockServer = require('../mock-server');
const routes = require('../config').routes;
const sinon = require('sinon');

const port = 4550;
const localhost = `http://127.0.0.1:${port}`;

describe('HTTP methods', () => {
	'use strict';

	let initOptions;
	let requestOptions;
	let server;

	before(() => {
		server = mockServer(port);
	});

	after(() => {
		server.close();
	});

	beforeEach(() => {
		initOptions = {
			auth: {
				clientId: 'testing',
				clientSecret: 'testing'
			},
			restEndpoint: localhost
		};

		requestOptions = {
			json: {
				testingData: 'test data'
			}
		};
	});

	describe('GET', () => {
		it('should deliver a GET + response', done => {
			const apiRequestSpy = sinon.spy(FuelRest.prototype, 'apiRequest');
			const RestClient = new FuelRest(initOptions);

			// faking auth
			RestClient.AuthClient.accessToken = 'testForRest';
			RestClient.AuthClient.expiration = 111111111111;

			RestClient.get({ uri: routes.get }, (err, data) => {
				// need to make sure we called apiRequest method
				expect(apiRequestSpy.calledOnce).to.be.true;

				// making sure original request was GET
				expect(data.res.req.method).to.equal('GET');

				FuelRest.prototype.apiRequest.restore(); // restoring function
				done();
			});
		});
	});

	describe('POST', () => {
		it('should deliver a POST', done => {
			const apiRequestSpy = sinon.spy(FuelRest.prototype, 'apiRequest');
			const RestClient = new FuelRest(initOptions);
			requestOptions.uri = routes.post;

			// faking auth
			RestClient.AuthClient.accessToken = 'testForRest';
			RestClient.AuthClient.expiration = 111111111111;

			// doing post
			RestClient.post(requestOptions, (err, data) => {
				// need to make sure we called apiRequest method
				expect(apiRequestSpy.calledOnce).to.be.true;

				// making sure original request was POST
				expect(data.res.req.method).to.equal('POST');

				FuelRest.prototype.apiRequest.restore(); // restoring function
				done();
			});
		});
	});

	describe('PUT', () => {
		it('should deliever an PUT/UPDATE', done => {
			const apiRequestSpy = sinon.spy(FuelRest.prototype, 'apiRequest');
			const RestClient = new FuelRest(initOptions);
			requestOptions.uri = routes.put;

			// faking auth
			RestClient.AuthClient.accessToken = 'testForRest';
			RestClient.AuthClient.expiration = 111111111111;

			// doing post
			RestClient.put(requestOptions, (err, data) => {
				// need to make sure we called apiRequest method
				expect(apiRequestSpy.calledOnce).to.be.true;

				// making sure original request was POST
				expect(data.res.req.method).to.equal('PUT');

				FuelRest.prototype.apiRequest.restore(); // restoring function
				done();
			});
		});
	});

	describe('PATCH', () => {
		it('should deliever an PATCH', done => {
			const apiRequestSpy = sinon.spy(FuelRest.prototype, 'apiRequest');
			const RestClient = new FuelRest(initOptions);
			requestOptions.uri = routes.patch;

			// faking auth
			RestClient.AuthClient.accessToken = 'testForRest';
			RestClient.AuthClient.expiration = 111111111111;

			// doing post
			RestClient.patch(requestOptions, (err, data) => {
				// need to make sure we called apiRequest method
				expect(apiRequestSpy.calledOnce).to.be.true;

				// making sure original request was POST
				expect(data.res.req.method).to.equal('PATCH');

				FuelRest.prototype.apiRequest.restore(); // restoring function
				done();
			});
		});
	});

	describe('DELETE', () => {
		it('should deliever an DELETE', done => {
			const apiRequestSpy = sinon.spy(FuelRest.prototype, 'apiRequest');
			const RestClient = new FuelRest(initOptions);
			requestOptions.uri = routes.delete;

			// faking auth
			RestClient.AuthClient.accessToken = 'testForRest';
			RestClient.AuthClient.expiration = 111111111111;

			// doing post
			RestClient.delete(requestOptions, (err, data) => {
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
