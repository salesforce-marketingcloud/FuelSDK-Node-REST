/*
 * Copyright (c) 2015, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

'use strict';

var expect   = require('chai').expect;
var FuelAuth = require('fuel-auth');
var FuelRest = require('../../lib/fuel-rest');
var sinon    = require('sinon');

// this only done for linting reasons. No difference between FuelAuth
var nonConstructorFuelRest = require('../../lib/fuel-rest');

describe('General Tests', function() {
	var options;

	beforeEach(function() {
		options = {
			auth: {
				clientId: 'testing'
				, clientSecret: 'testing'
			}
		};
	});

	it('should be a constructor', function() {
		expect(FuelRest).to.be.a('function');
	});

	it('should not need to use "new" when instantiating', function() {
		// Arrange
		var options = {
			auth: {
				clientId: '<test>'
				, clientSecret: '<test>'
			}
			, origin: '<api origin>'
		};

		// Act
		var client = nonConstructorFuelRest(options);

		// Assert
		expect(client.origin).to.equal(options.origin);
	});

	it('should require auth options', function() {
		var RestClient;

		try {
			RestClient = new FuelRest();
		} catch(err) {
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
			'test': 1
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

			RestClient
				.apiRequest({})
				.then(function(res) {
					expect(res.data).to.be.true;
					done();
				});
		});

		it('should not allow for use of callbacks and promises together', function() {
			var error      = null;
			var RestClient = new FuelRest(options);

			try {
				RestClient
					.apiRequest({}, function() {})
					.then(function() {});
			} catch(err) {
				error = err;
			}
			expect(error).not.to.be.null;
		});
	});
});
