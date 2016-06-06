/*
 * Copyright (c) 2016, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
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
