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

var expect     = require( 'chai' ).expect;
var sinon      = require( 'sinon' );
var mockServer = require( '../mock-server' );
var FuelRest   = require( '../../lib/fuel-rest' );
var FuelAuth   = require( 'fuel-auth' );
var port       = 4550;
var localhost  = 'http://127.0.0.1:' + port;

describe( 'apiRequest method', function() {
	'use strict';

	var server, RestClient;

	before( function() {
		// setting up rest client for all tests to use
		var options = {
			auth: {
				clientId: 'testing'
				, clientSecret: 'testing'
			}
			, restEndpoint: localhost
		};

		RestClient = new FuelRest( options );

		// faking auth
		RestClient.AuthClient.accessToken = 'testForRest';
		RestClient.AuthClient.expiration  = 111111111111;

		// setting up server
		server = mockServer( port );
	});

	after(function() {
		server.close();
	});

	it( 'should return an error when no options are passed', function( done ) {
		RestClient.apiRequest( null, function( err, data ) {
			expect( err.errorPropagatedFrom ).to.equal( 'FuelRest - apiRequest' );
			expect( err.message ).to.equal( 'options are required' );
			expect( data ).to.be.null;
			done();
		});
	});

	it( 'should throw an error if no callback is present', function() {
		try {
			RestClient.apiRequest( null, null );
		} catch( err ) {
			expect( err.name ).to.equal( 'TypeError' );
			expect( err.message ).to.equal( 'callback argument is required' );
		}
	});

	it( 'should make a requset to the API', function( done ) {
		var options = {
			method: 'GET'
			, uri: '/get/test'
		};

		RestClient.apiRequest( options, function( err, data ) {
			// making sure original request was GET
			expect( data.res.req.method ).to.equal( 'GET' );

			// finish async test
			done();
		});
	});

	it( 'should add extra headers to default headers', function( done ) {
		var options = {
			method: 'GET'
			, uri: '/get/test'
			, headers: {
				'X-Test-Header': 'testing value'
			}
		};

		RestClient.apiRequest( options, function( err, data ) {
			// making sure custom header was sent in request
			expect( data.res.req._headers['x-test-header'] ).to.equal( options.headers[ 'X-Test-Header' ] );

			// finish async test
			done();
		});
	});

	it( 'should add extra options to request module - testing qs', function( done ) {
		var options = {
			method: 'GET'
			, uri: '/get/test'
			, qs: {
				'test': 1
			}
		};

		RestClient.apiRequest( options, function( err, data ) {
			// checking to make sure path on request was correct
			expect( data.res.req.path ).to.equal( '/get/test?test=1' );

			// finish async test
			done();
		});
	});

	it( 'should override Authorization header if passed', function( done ) {
		var options = {
			method: 'GET'
			, uri: '/get/test'
			, headers: {
				Authorization: 'Bearer diffTestForRest'
			}
		};

		RestClient.apiRequest( options, function( err, data ) {
			// making sure different auth header was sent in request
			expect( data.res.req._headers.authorization ).to.equal( options.headers.Authorization );

			// finish async test
			done();
		});
	});

	it( 'should return an error when application type returned is not application/json', function( done ) {
		var options = {
			method: 'GET'
			, uri: '/not/json/response'
		};

		RestClient.apiRequest( options, function( err, data ) {
			// error should be passed, and data should be null
			expect( !!err ).to.be.true;
			expect( err.message ).to.equal( 'API did not return JSON' );
			expect( data ).to.be.null;

			// finish async test
			done();
		});
	});

	it( 'should error when request module errors', function( done ) {
		var options = {
			method: 'TEST'
			, uri: '/not/json/response'
		};

		RestClient.apiRequest( options, function( err, data ) {
			// error should be passed, and data should be null
			expect( !!err ).to.be.true;
			expect( err.errorPropagatedFrom ).to.equal( 'Request Module inside apiRequest' );
			expect( data ).to.be.null;

			// finish async test
			done();
		});
	});

	it( 'should return an error when no accessToken is available', function( done ) {
		// stubbing response from auth client with no access token
		sinon.stub( FuelAuth.prototype, 'getAccessToken', function( options, callback ) {
			callback( null, {
				documentation: "https://code.docs.exacttarget.com/rest/errors/404"
				, errorcode: 404
				, message: "Not Found"
			});
		});

		// creating local rest client so we can use stubbed auth function
		var initOptions = {
			auth: {
				clientId: 'testing'
				, clientSecret: 'testing'
			}
			, restEndpoint: localhost
		};

		var RestClient = new FuelRest( initOptions );
		var reqOptions = {
			method: 'GET'
			, uri: '/get/test'
		};

		RestClient.apiRequest( reqOptions, function( err, data ) {
			// error should be passed, and data should be null
			expect( !!err ).to.be.true;
			expect( err.errorPropagatedFrom ).to.equal( 'FuelAuth' );
			expect( err.message ).to.equal( 'No access token' );
			expect( err.res ).to.be.a( 'object' );
			expect( data ).to.be.null;

			// restoring stubbed function
			FuelAuth.prototype.getAccessToken.restore();

			// finish async test
			done();
		});
	});

	it( 'should handle an error from the Auth Client', function( done ) {
		// stubbing response from auth client with no access token
		sinon.stub( FuelAuth.prototype, '_requestToken', function( requestOptions, callback ) {
			callback( new Error( 'error from auth client' ), null );
			return;
		});

		// creating local rest client so we can use stubbed auth function
		var initOptions = {
			auth: {
				clientId: 'testing'
				, clientSecret: 'testing'
			}
			, restEndpoint: localhost
		};

		var RestClient = new FuelRest( initOptions );
		var reqOptions = {
			method: 'GET'
			, uri: '/get/test'
		};

		RestClient.apiRequest( reqOptions, function( err, data ) {
			// error should be passed, and data should be null
			expect( !!err ).to.be.true;
			expect( err.errorPropagatedFrom ).to.equal( 'FuelAuth' );
			expect( err.message ).to.equal( 'error from auth client' );
			expect( data ).to.be.null;

			// restoring stubbed function
			FuelAuth.prototype._requestToken.restore();

			// finish async test
			done();
		});
	});

	it( 'should try request again if 401 stating token is invalid', function( done ) {
		var requestSpy = sinon.spy( FuelRest.prototype, 'apiRequest' );
		sinon.stub( FuelAuth.prototype, '_requestToken', function( requestOptions, callback ) {
			callback( null, { accessToken: 'testing', expiresIn: 3600 } );
			return;
		});
		// creating local rest client so we can use stubbed auth function
		var initOptions = {
			auth: {
				clientId: 'testing'
				, clientSecret: 'testing'
			}
			, restEndpoint: localhost
		};
		var RestClient = new FuelRest( initOptions );

		var reqOptions = {
			method: 'GET'
			, uri: '/invalid/token'
			, retry: true
			, auth: {
				force: true
			}
		};

		RestClient.apiRequest( reqOptions, function( /*err, data*/ ) {
			// error should be passed, and data should be null
			expect( requestSpy.calledTwice ).to.be.true;

			FuelRest.prototype.apiRequest.restore();
			FuelAuth.prototype._requestToken.restore();
			// finish async test
			done();
		}, true );
	});
});
