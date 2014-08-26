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

var version  = require( '../package.json').version;
var request  = require( 'request');
var _        = require( 'lodash' );
var url      = require( 'url' );
var FuelAuth = require( 'fuel-auth' );


var FuelRest = function( options ) {
	'use strict';

	var authOptions = options && options.auth || {};

	// use fuel auth instance if applicable
	if( authOptions instanceof FuelAuth ) {
		this.AuthClient = authOptions;
	} else {
		try {
			this.AuthClient = new FuelAuth( authOptions );
		} catch( err ) {
			throw err;
		}
	}

	// adding version to object
	this.version = version;

	// setting up default headers
	this.defaultHeaders = {
		'User-Agent': 'node-fuel/' + this.version
		, 'Content-Type': 'application/json'
	};

	this.origin = options.origin || options.restEndpoint || 'https://www.exacttargetapis.com';
};

FuelRest.prototype.apiRequest = function( options, callback ) {
	'use strict';

	// we need a callback
	if( !_.isFunction( callback ) ) {
		throw new TypeError( 'callback argument is required' );
	}

	// we need options
	if( !_.isPlainObject( options ) ) {
		this._deliverResponse( 'error', new Error( 'options are required' ), callback, 'FuelRest - apiRequest' );
		return;
	}

	// get the auth options and then delete them (no longer needed)
	var authOptions = options.auth || {};
	delete options.auth;

	// default to GET method (request module will do this too)
	options.method = options.method || 'GET';

	// if we don't have a fully qualified URL let's make one
	if( !/^http/.test( options.uri ) ) {
		options.uri = url.resolve( this.origin, options.uri );
	}

	// merge headers
	options.headers = _.merge( {}, this.defaultHeaders, options.headers );

	this.AuthClient.getAccessToken( authOptions, function( err, body ) {
		var localError;

		if( !!err ) {
			this._deliverResponse( 'error', err, callback, 'FuelAuth' );
			return;
		}

		// if there's no access token we have a problem
		if( !body.accessToken ) {
			localError     = new Error( 'No access token' );
			localError.res = body;
			this._deliverResponse( 'error', localError, callback, 'FuelAuth' );
			return;
		}

		// adding the bearer token
		options.headers.Authorization = options.headers.Authorization || 'Bearer ' + body.accessToken;

		// send request to api
		request( options, function( err, res, body ) {
			var parsedBody;

			if( err ) {
				this._deliverResponse( 'error', err, callback, 'Request Module inside apiRequest' );
				return;
			}

			// checking to make sure it's json from api
			if( res.headers[ 'content-type' ].split( ';' )[ 0 ].toLowerCase() !== 'application/json' ) {
				this._deliverResponse( 'error', new Error('API did not return JSON'), callback, 'Fuel REST' );
				return;
			}

			// trying to parse body
			try {
				parsedBody = JSON.parse( body );
			} catch( err ) {
				parsedBody = body;
			}

			this._deliverResponse( 'response', { res: res, body: parsedBody }, callback );

		}.bind( this ) );

	}.bind( this ) );
};

FuelRest.prototype.get = function( options, callback ) {
	'use strict';

	options.method = 'GET';

	this.apiRequest( options, callback );
};

FuelRest.prototype.post = function( options, callback ) {
	'use strict';

	options.method = 'POST';

	this.apiRequest( options, callback );
};

FuelRest.prototype.put = function( options, callback ) {
	'use strict';

	options.method = 'PUT';

	this.apiRequest( options, callback );
};

FuelRest.prototype.delete = function( options, callback ) {
	'use strict';

	options.method = 'DELETE';

	this.apiRequest( options, callback );
};

FuelRest.prototype._deliverResponse = function( type, data, callback, errorFrom ) {
	'use strict';

	// if it's an error and we have where it occured, let's tack it on
	if( type === 'error' ) {

		if( !!errorFrom ) {
			data.errorPropagatedFrom = errorFrom;
		}

		callback( data, null );

	} else if( type === 'response' ) {

		callback( null, data );

	}
};

module.exports = FuelRest;
