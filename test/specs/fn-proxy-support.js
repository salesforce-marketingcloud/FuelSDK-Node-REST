/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */
'use strict';
const expect = require('chai').expect;
const FuelRest = require('../../lib/fuel-rest');
const routes = require('../config').routes;
const http = require('http');

const port = 4550;
const proxyPort = 8888;
const proxyErrorPort = 1234;
const localhost = `http://127.0.0.1:${port}`;
const proxyResponseBody = 'Hello Node JS Server Response';
const requestOptions = {
	method: 'GET',
	uri: routes.get
};
const server = http.createServer(function (request, response) {
	response.writeHead(200, {'Content-Type': 'application/json'});
	response.write(proxyResponseBody);
	response.end();
});
const accessToken = 'testForRest';
const expiration = 111111111111;

describe('Proxy support', function () {

	let restClient, initOptions;

	before(done => server.listen(proxyPort, done));

	beforeEach(() => {
		initOptions = {
			auth: {
				clientId: 'testing',
				clientSecret: 'testing'
			},
			restEndpoint: localhost,
			globalReqOptions: {
				proxy: {
					host: '127.0.0.1',
					protocol: 'http:'
				}
			}
		};
	});

	it('should respond the proxyResponseBody if proxy option passed correctly', done => {
		initOptions.globalReqOptions.proxy.port = proxyPort;
		restClient = new FuelRest(initOptions);
		restClient.AuthClient.accessToken = accessToken;
		restClient.AuthClient.expiration = expiration;
		restClient.apiRequest(requestOptions, (err, data) => {
			expect(data.body).to.equal(proxyResponseBody);
			done();
		});
	});

	it('should error if proxy option passed incorrectly', done => {
		initOptions.globalReqOptions.proxy.port = proxyErrorPort;
		restClient = new FuelRest(initOptions);
		restClient.AuthClient.accessToken = accessToken;
		restClient.AuthClient.expiration = expiration;
		restClient.apiRequest(requestOptions, (err) => {
			expect(err.code).to.equal('ECONNREFUSED');
			expect(err.port).to.equal(proxyErrorPort);
			done();
		});
	});

	after(() => server.close());

});
