/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

var expect          = require('chai').expect;
var sinon           = require('sinon');
var helpers         = require('../../lib/helpers');
var sampleResponses = require('../sample-responses');
var url             = require('url');

describe('helpers', function() {

	describe('isValid401', function() {
		it('should return true if 401 and token failure', function() {
			var res;
			var result;

			res = {
				statusCode: 401
				, headers: {
					'www-authenticate': sampleResponses.invalidToken
				}
			};

			result = helpers.isValid401(res);
			expect(result).to.be.true;
		});

		it('should return false if 401 and no token failure', function() {
			var res;
			var result;

			res = {
				statusCode: 401
				, headers: {}
			};

			result = helpers.isValid401(res);
			expect(result).to.be.false;
		});

		it('should return false if not 401', function() {
			var res;
			var result;

			res = {
				statusCode: 200
				, headers: {}
			};

			result = helpers.isValid401(res);
			expect(result).to.be.false;
		});

		it('should return false if no headers passed', function() {
			var res;
			var result;

			res = {
				statusCode: 401
			};

			result = helpers.isValid401(res);
			expect(result).to.be.false;
		});
	});

	describe('resolveUri', function() {
		var origin;
		var resolveSpy;
		var uri;

		beforeEach(function() {
			origin     = 'http://test.com';
			resolveSpy = sinon.stub(url, 'resolve');
			uri        = 'path/to/test';
		});

		afterEach(function() {
			url.resolve.restore();
		});

		it('should resolve a URI if origin and uri passed', function() {
			helpers.resolveUri(origin, uri);
			expect(resolveSpy.calledOnce).to.be.true;
		});

		it('should not resolve if URI has http in it', function() {
			uri = origin + uri;
			helpers.resolveUri(origin, uri);
			expect(resolveSpy.calledOnce).to.be.false;
		});

		it('should not resolve if no origin is passed', function() {
			helpers.resolveUri(null, uri);
			expect(resolveSpy.calledOnce).to.be.false;
		});

		it('should not resolve if no URI is passed', function() {
			helpers.resolveUri(origin, null);
			expect(resolveSpy.calledOnce).to.be.false;
		});
	});
});
