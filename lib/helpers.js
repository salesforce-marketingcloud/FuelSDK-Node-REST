/*
 * Copyright (c) 2015, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

'use strict';

var url = require('url');

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
};
