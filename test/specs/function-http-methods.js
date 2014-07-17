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
		sinon.stub( FuelAuth.prototype, 'getAccessToken', function( requestOpts, force, callback ) {
			FuelAuth.prototype._deliverResponse( 'response', { accessToken: 'tokenForRest', expiresIn: 3600 }, callback );
		});
	});

	after(function() {
		server.close();
		FuelAuth.prototype.getAccessToken.restore();
	});

	it( 'should deliver a get response', function(done) {
		var getSpy = sinon.spy( FuelRest.prototype, 'get' );

		var RestClient = new FuelRest({
			clientId: 'testing'
			, clientSecret: 'testing'
		}, localhost );

		RestClient.get( '/get/test', null, function( response ) {
			expect( getSpy.calledOnce ).to.be.true;

			FuelRest.prototype.get.restore();

			done();
		});
	});

});
