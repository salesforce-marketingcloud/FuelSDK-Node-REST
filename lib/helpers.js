/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
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
