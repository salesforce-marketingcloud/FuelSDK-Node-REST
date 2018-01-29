/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const helpers = require('../../lib/helpers');
const sampleResponses = require('../sample-responses');
const url = require('url');

describe('helpers', () => {
	describe('isValid401', () => {
		it('should return true if 401 and token failure', () => {
			const res = {
				statusCode: 401,
				headers: {
					'www-authenticate': sampleResponses.invalidToken
				}
			};

			const result = helpers.isValid401(res);
			expect(result).to.be.true;
		});

		it('should return false if 401 and no token failure', () => {
			const res = {
				statusCode: 401,
				headers: {}
			};

			const result = helpers.isValid401(res);
			expect(result).to.be.false;
		});

		it('should return false if not 401', () => {
			const res = {
				statusCode: 200,
				headers: {}
			};

			const result = helpers.isValid401(res);
			expect(result).to.be.false;
		});

		it('should return false if no headers passed', () => {
			const res = {
				statusCode: 401
			};

			const result = helpers.isValid401(res);
			expect(result).to.be.false;
		});
	});

	describe('resolveUri', () => {
		let origin;
		let resolveSpy;
		let uri;

		beforeEach(() => {
			origin = 'http://test.com';
			resolveSpy = sinon.stub(url, 'resolve');
			uri = 'path/to/test';
		});

		afterEach(() => {
			url.resolve.restore();
		});

		it('should resolve a URI if origin and uri passed', () => {
			helpers.resolveUri(origin, uri);
			expect(resolveSpy.calledOnce).to.be.true;
		});

		it('should not resolve if URI has http in it', () => {
			uri = origin + uri;
			helpers.resolveUri(origin, uri);
			expect(resolveSpy.calledOnce).to.be.false;
		});

		it('should not resolve if no origin is passed', () => {
			helpers.resolveUri(null, uri);
			expect(resolveSpy.calledOnce).to.be.false;
		});

		it('should not resolve if no URI is passed', () => {
			helpers.resolveUri(origin, null);
			expect(resolveSpy.calledOnce).to.be.false;
		});
	});
});
