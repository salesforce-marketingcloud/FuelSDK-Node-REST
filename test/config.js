/*
 * Copyright (c) 2015, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

module.exports = {
	routes: {
		get: '/get/test'
		, post: '/post/test'
		, put: '/update/test'
		, delete: '/delete/test'
		, queryGet: '/get/test?test=1'
		, notJson: '/not/json/response'
		, patch: '/patch'
		, invalidToken: '/invalid/token'
	}
};
