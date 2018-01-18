/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

module.exports = {
	routes: {
		get: '/get/test',
		post: '/post/test',
		put: '/update/test',
		delete: '/delete/test',
		queryGet: '/get/test?test=1',
		notJson: '/not/json/response',
		patch: '/patch',
		invalidToken: '/invalid/token'
	}
};
