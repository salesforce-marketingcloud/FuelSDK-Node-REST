/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */
'use strict';

module.exports = (workflow, gulp, $) => {
	workflow.subtask('mocha', () => {
		return gulp.src('./test/specs/*.js', { read: false }).pipe($.mocha({ reporter: 'spec' }));
	});
};
