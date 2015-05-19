/**
* Copyright (c) 2014​, salesforce.com, inc.
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

var expect   = require('chai').expect;
var FuelRest = require('../../lib/fuel-rest');
var FuelAuth = require('fuel-auth');

describe('General Tests', function() {
	'use strict';

	it('should be a constructor', function() {
		expect(FuelRest).to.be.a('function');
	});

	it('should require auth options', function() {
		var RestClient, options;

		options = {
			auth: {
				clientId: 'testing'
				, clientSecret: 'testing'
			}
		};

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
		var AuthClient, RestClient, authOptions;

		authOptions = {
			clientId: 'testing'
			, clientSecret: 'testing'
		};

		AuthClient = new FuelAuth(authOptions);

		AuthClient.test = true;

		RestClient = new FuelRest({ auth: AuthClient });

		expect(RestClient.AuthClient.test).to.be.true;
	});

	it('should take a custom rest endpoint', function() {
		var RestClient, options;

		options = {
			auth: {
				clientId: 'testing'
				, clientSecret: 'testing'
			}
		};

		// testing default initialization
		RestClient = new FuelRest(options);

		expect(RestClient.origin).to.equal('https://www.exacttargetapis.com');

		options.origin = 'https://www.exacttarget.com';

		// testing custom endpoint
		RestClient = new FuelRest(options);

		expect(RestClient.origin).to.equal('https://www.exacttarget.com');
	});

	it('should merge module level headers into default headers', function() {
		var RestClient, options;

		options = {
			auth: {
				clientId: 'testing'
				, clientSecret: 'testing'
			}
			, headers: {
				'test': 1
			}
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
});
