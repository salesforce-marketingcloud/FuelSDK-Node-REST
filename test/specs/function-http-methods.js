var expect          = require( 'chai' ).expect;
var sinon           = require( 'sinon' );
var mockServer      = require( '../mock-server' );
var FuelRest        = require( '../../lib/fuel-rest' );
var FuelAuth        = require( 'fuel-auth' );
var port            = 4550;
var localhost       = 'http://127.0.0.1:' + port;
var sampleResponses = require( '../sample-responses' );

describe( 'HTTP methods', function() {
	'use strict';

	var server;

	before( function() {
		server = mockServer( port );
	});

	after(function() {
		server.close();
	});

	describe( 'GET', function() {
		it( 'should deliver a get response', function(done) {
			// setting up spy and rest client
			var apiRequestSpy = sinon.spy( FuelRest.prototype, 'apiRequest' );
			var RestClient    = new FuelRest({
				clientId: 'testing'
				, clientSecret: 'testing'
			}, localhost );

			// faking auth
			RestClient.AuthClient.accessToken = 'testForRest';
			RestClient.AuthClient.expiration  = 111111111111;

			RestClient.get( '/get/test', null, function( err, response ) {
				// need to make sure we called apiRequest method
				expect( apiRequestSpy.calledOnce ).to.be.true;
				expect( response.apiResponse.req.method ).to.equal( 'GET' );

				FuelRest.prototype.apiRequest.restore(); // restoring function
				done();
			});
		});
	});
});
