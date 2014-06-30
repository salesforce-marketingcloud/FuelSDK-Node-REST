var version      = require( '../package.json').version;
var request      = require( 'request');
var _            = require( 'lodash' );
var EventEmitter = require( 'events' ).EventEmitter;
var util         = require( 'util' );
var FuelAuth     = require( 'fuel-auth' );


var FuelRest = function( authOptions, restEndpoint ) {
	'use strict';

	try {
		this.AuthClient = new FuelAuth( authOptions );
	} catch( err ) {
		console.log( err );
		return;
	}

	this.restEndpoint = restEndpoint || 'https://www.exacttargetapis.com';
	this.version      = version;
};

// adding inheriting properties from EventEmitter
util.inherits( FuelRest, EventEmitter );

FuelRest.prototype.apiRequest = function( type, requestOptions, getAccessTokenOptions, callback ) {
	'use strict';

	requestOptions = requestOptions || {};

	this.AuthClient.getAccessToken( getAccessTokenOptions || {} );

	this.AuthClient.on( 'response', function( body ) {
		if( !body.accessToken ) {
			this._deliverResponse( 'error', 'No token. API Response - ' + JSON.stringify( body ) );
			return;
		}

		request( requestOptions, function( err, res, body ) {
			if( err ) {
				this._deliverResponse( 'error', err, callback );
				return;
			}

			this._deliverResponse( 'reponse', body, callback );

		}.bind( this ) );
	});

	this.AuthClient.on( 'error', function( err ) {
		this._deliverResponse( 'error', 'FuelAuth error - ' + err );
	});
};

FuelRest.prototype.get = function( requestOptions, getAccessTokenOptions, callback ) {
	'use strict';

	this.apiRequest( 'GET', requestOptions, getAccessTokenOptions, callback );
};

FuelRest.prototype.post = function( requestOptions, getAccessTokenOptions, callback ) {
	'use strict';

	this.apiRequest( 'POST', requestOptions, getAccessTokenOptions, callback );
};

FuelRest.prototype.put = function( requestOptions, getAccessTokenOptions, callback ) {
	'use strict';

	this.apiRequest( 'PUT', requestOptions, getAccessTokenOptions, callback );
};

FuelRest.prototype.delete = function( requestOptions, getAccessTokenOptions, callback ) {
	'use strict';

	this.apiRequest( 'DELETE', requestOptions, getAccessTokenOptions, callback );
};


FuelAuth.prototype._deliverResponse = function( type, data, callback ) {
	'use strict';

	// if it's a callback, lets use that
	if( _.isFunction( callback ) ) {
		if( type === 'error' ) {
			callback( data, null );
		} else if( type === 'response' ) {
			callback( null, data );
		}
		return;
	}

	this.emit( type, data );
};

module.exports = FuelRest;
