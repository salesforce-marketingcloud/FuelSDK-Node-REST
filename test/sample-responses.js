/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

module.exports = {
	get200: {
		endpoints: {
			test: '/test/test/test'
		}
	}
	, post200: {
		id: 1
	}
	, 500: {
		documentation: ""
		, errorcode: 0
		, message: "Internal Server Error"
	}
	, 401: {
		documentation: ""
		, errorcode: 1
		, message: "Unauthorized"
	}
	, invalidToken: 'Bearer realm="example.com", error="invalid_token", error_description="The access token expired"'
};
