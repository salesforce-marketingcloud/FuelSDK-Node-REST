/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */
'use strict';

module.exports = (workflow, gulp, $) => {
	workflow.subtask('jshint', () => {
		return gulp
			.src(['./gulp/**/*.js', './lib/**/*.js', './test/**/*.js', './*.js'])
			.pipe($.jshint())
			.pipe($.jshint.reporter('default'))
			.pipe($.jshint.reporter('fail'));
	});
};
