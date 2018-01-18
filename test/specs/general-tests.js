/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

const expect = require('chai').expect;
const FuelAuth = require('fuel-auth');
const FuelRest = require('../../lib/fuel-rest');
const sinon = require('sinon');

describe('General Tests', function() {
	var options;

	beforeEach(function() {
		options = {
			auth: {
				clientId: 'testing',
				clientSecret: 'testing'
			}
		};
	});

	it('should be a constructor', function() {
		expect(FuelRest).to.be.a('function');
	});

	it('should require auth options', function() {
		var RestClient;

		try {
			RestClient = new FuelRest();
		} catch (err) {
			expect(err.message).to.equal('clientId or clientSecret is missing or invalid');
		}

		RestClient = new FuelRest(options);

		// rest client should have an instance of an auth client
		expect(RestClient.AuthClient instanceof FuelAuth).to.be.true;
	});

	it('should use already initialized fuel auth client', function() {
		var AuthClient;
		var RestClient;

		AuthClient = new FuelAuth(options.auth);

		AuthClient.test = true;

		RestClient = new FuelRest({ auth: AuthClient });

		expect(RestClient.AuthClient.test).to.be.true;
	});

	it('should take a custom rest endpoint', function() {
		var RestClient;

		// testing default initialization
		RestClient = new FuelRest(options);

		expect(RestClient.origin).to.equal('https://www.exacttargetapis.com');

		options.origin = 'https://www.exacttarget.com';

		// testing custom endpoint
		RestClient = new FuelRest(options);

		expect(RestClient.origin).to.equal('https://www.exacttarget.com');
	});

	it('should merge module level headers into default headers', function() {
		var RestClient;

		options.headers = {
			test: 1
		};

		// testing default initialization
		RestClient = new FuelRest(options);

		expect(RestClient.defaultHeaders.test).to.equal(1);
	});

	it('should have apiRequest on prototype', function() {
		expect(FuelRest.prototype.apiRequest).to.be.a('function');
	});

	it('should have get on prototype', function() {
		expect(FuelRest.prototype.get).to.be.a('function');
	});

	it('should have post on prototype', function() {
		expect(FuelRest.prototype.post).to.be.a('function');
	});

	it('should have put on prototype', function() {
		expect(FuelRest.prototype.put).to.be.a('function');
	});

	it('should have delete on prototype', function() {
		expect(FuelRest.prototype.delete).to.be.a('function');
	});

	describe('promise integration', function(done) {
		it('should allow for use of promises', function() {
			var RestClient = new FuelRest(options);

			sinon.stub(RestClient, '_processRequest', function(options, callback) {
				callback(null, { data: true });
			});

			RestClient.apiRequest({}).then(function(res) {
				expect(res.data).to.be.true;
				done();
			});
		});

		it('should not allow for use of callbacks and promises together', function() {
			var error = null;
			var RestClient = new FuelRest(options);

			try {
				RestClient.apiRequest({}, function() {}).then(function() {});
			} catch (err) {
				error = err;
			}
			expect(error).not.to.be.null;
		});
	});
});
