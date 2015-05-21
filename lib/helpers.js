'use strict';

var _   = require('lodash');
var url = require('url');

var invalidTypeMsg = 'invalid response type';

module.exports = {
	isValid401: function(res) {
		var is401                 = (res.statusCode === 401);
		var isFailureFromBadToken = false;

		if(res.headers && res.headers['www-authenticate']) {
			isFailureFromBadToken = /^Bearer\s.+?invalid_token/.test(res.headers['www-authenticate']);
		}

		return is401 && isFailureFromBadToken;
	}
	, resolveUri: function(origin, uri) {
		if(origin && uri && !/^http/.test(uri)) {
			uri = url.resolve(origin, uri);
		}
		return uri;
	}
	, cbRespond: function(type, data, callback) {
		if(!_.isFunction(callback)) {
			return;
		}

		// if it's an error and we have where it occured, let's tack it on
		if(type === 'error') {
			callback(data, null);
		} else if(type === 'response') {
			callback(null, data);
		} else {
			callback(invalidTypeMsg, null);
		}
	}
};
