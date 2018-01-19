'use strict';

const gulp = require('gulp');
const workflow = require('gulp-workflow');

workflow
	.load(gulp)
	.task('lint', 'lint files', ['jshint'])
	.task('test', 'run tests', ['mocha'])
	.task('ci', 'run ci stuff', [['lint', 'test']]);
