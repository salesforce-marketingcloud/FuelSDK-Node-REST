var version      = require( '../package.json').version;
var request      = require( 'request');
var _            = require( 'lodash' );
var EventEmitter = require( 'events' ).EventEmitter;
var util         = require( 'util' );
var url          = require( 'url' );
var FuelAuth     = require( 'fuel-auth' );


var FuelRest = function( authOptions, restEndpoint ) {
	'use strict';

	try {
		this.AuthClient = new FuelAuth( authOptions );
	} catch( err ) {
		console.log( err );
		return;
	}

	// adding version to object
	this.version = version;

	// setting up default headers
	this.defaultHeaders = {
		'User-Agent': 'node-fuel/' + this.version
		, 'Content-Type': 'application/json'
	};

	// configuring rest options
	this.requestOptions     = {};
	this.requestOptions.uri = restEndpoint || 'https://www.exacttargetapis.com';
};

// adding inheriting properties from EventEmitter
util.inherits( FuelRest, EventEmitter );

FuelRest.prototype.apiRequest = function( type, uri, requestOptions, authOptions, callback ) {
	'use strict';

	// setting up request options
	requestOptions        = _.merge( this.requestOptions, requestOptions || {} );
	requestOptions.uri    = url.resolve( requestOptions.uri, uri ); // resolving url to be used for request
	requestOptions.method = type;

	// setting up authOptions
	authOptions                = authOptions || {};
	authOptions.forceRequest   = authOptions.forceRequest || null;
	authOptions.requestOptions = authOptions.requestOptions || null;

	this.AuthClient.getAccessToken( authOptions.requestOptions, authOptions.forceRequest );

	this.AuthClient.on( 'response', function( body ) {
		// if there's no access token we have a problem
		if( !body.accessToken ) {
			this._deliverResponse( 'error', body, callback, 'API Response - No token' );
			return;
		}

		request( requestOptions, function( err, res, body ) {
			if( err ) {
				this._deliverResponse( 'error', err, callback, 'Request Module inside apiRequest' );
				return;
			}

			this._deliverResponse( 'reponse', body, callback );

		}.bind( this ) );
	});

	this.AuthClient.on( 'error', function( err ) {
		this._deliverResponse( 'error', err, callback, 'FuelAuth' );
	});
};

FuelRest.prototype.get = function( uri, options, callback ) {
	'use strict';

	this.apiRequest( 'GET', uri, options.requestOptions, options.authOptions, callback );
};

FuelRest.prototype.post = function( uri, options, callback ) {
	'use strict';

	this.apiRequest( 'POST', uri, options.requestOptions, options.authOptions, callback );
};

FuelRest.prototype.put = function( uri, options, callback ) {
	'use strict';

	this.apiRequest( 'PUT', uri, options.requestOptions, options.authOptions, callback );
};

FuelRest.prototype.delete = function( uri, options, callback ) {
	'use strict';

	this.apiRequest( 'DELETE', uri, options.requestOptions, options.authOptions, callback );
};


FuelAuth.prototype._deliverResponse = function( type, data, callback, errorFrom ) {
	'use strict';

	// if it's an error and we have where it occured, let's tack it on
	if( type === 'error' && !!errorFrom ) {
		data.errorPropagatedFrom = errorFrom;
	}

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
