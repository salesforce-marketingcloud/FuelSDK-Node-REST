var version      = require( '../package.json').version;
var request      = require( 'request');
var _            = require( 'lodash' );
var EventEmitter = require( 'events' ).EventEmitter;
var util         = require( 'util' );
var FuelAuth     = require( 'fuel-auth' );


var FuelRest = function( authOptions, restOptions ) {
	'use strict';

	try {
		this.AuthClient = new FuelAuth( authOptions );
	} catch( err ) {
		console.log( err );
		return;
	}

	// adding version to object
	this.version = version;

	var defaultHeaders = {
		'User-Agent': 'node-fuel/' + this.version
	};

	// configuring rest options
	this.requestOptions         = {};
	this.requestOptions.uri     = restOptions.endpoint || 'https://www.exacttargetapis.com';
	this.requestOptions.headers = _.merge( {}, defaultHeaders, restOptions.headers );
	this.requestOptions.json    = true;
};

// adding inheriting properties from EventEmitter
util.inherits( FuelRest, EventEmitter );

FuelRest.prototype.apiRequest = function( type, localReqOptions, getAccessTokenOptions, callback ) {
	'use strict';

	localReqOptions       = _.merge( this.requestOptions, localReqOptions );
	getAccessTokenOptions = getAccessTokenOptions || {};

	this.AuthClient.getAccessToken( getAccessTokenOptions );

	this.AuthClient.on( 'response', function( body ) {
		if( !body.accessToken ) {
			this._deliverResponse( 'error', 'No token. API Response - ' + JSON.stringify( body ) );
			return;
		}

		request( localReqOptions, function( err, res, body ) {
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

FuelRest.prototype.get = function( options, callback ) {
	'use strict';

	this.apiRequest( 'GET', options.requestOptions, options.getAccessTokenOptions, callback );
};

FuelRest.prototype.post = function( options, callback ) {
	'use strict';

	this.apiRequest( 'POST', options.requestOptions, options.getAccessTokenOptions, callback );
};

FuelRest.prototype.put = function( options, callback ) {
	'use strict';

	this.apiRequest( 'PUT', options.requestOptions, options.getAccessTokenOptions, callback );
};

FuelRest.prototype.delete = function( options, callback ) {
	'use strict';

	this.apiRequest( 'DELETE', options.requestOptions, options.getAccessTokenOptions, callback );
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
