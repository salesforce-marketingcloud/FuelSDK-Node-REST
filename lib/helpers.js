'use strict';

module.exports = {
	check401header: function( res ) {
		var is401                 = res.statusCode === 401;
		var isFailureFromBadToken = /^Bearer\s.+?invalid_token/.test( res.headers[ 'www-authenticate' ] );

		return is401 && isFailureFromBadToken;
	}
};
