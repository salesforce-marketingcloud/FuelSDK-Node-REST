/**
* Copyright (c) 2015​, salesforce.com, inc.
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without modification, are permitted provided
* that the following conditions are met:
*
*    Redistributions of source code must retain the above copyright notice, this list of conditions and the
*    following disclaimer.
*
*    Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
*    the following disclaimer in the documentation and/or other materials provided with the distribution.
*
*    Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
*    promote products derived from this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
* WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
* PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
* ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
* TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
* HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
* NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
* POSSIBILITY OF SUCH DAMAGE.
*/

var expect          = require('chai').expect;
var sinon           = require('sinon');
var helpers         = require('../../lib/helpers');
var sampleResponses = require('../sample-responses');
var url             = require('url');

describe('helpers', function() {
	'use strict';

	var invalidTypeMsg = 'invalid response type';

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

	describe('cbRespond', function() {
		var options;

		beforeEach(function() {
			options = {
				type: 'error'
				, data: {
					test: true
				}
				, cb: function() {}
			};
		});

		it('should return if no callback', function() {
			var promiseSpy = sinon.stub(options, 'cb');

			helpers.cbRespond(options.type, options.data, null);
			helpers.cbRespond(options.type, options.data, 'test');
			helpers.cbRespond(options.type, options.data, options.cb);

			expect(promiseSpy.callCount).to.equal(1);
		});

		it('should use callbacks for success if applicable', function() {
			var cbSpy = sinon.spy(options, 'cb');

			options.type = 'response';
			helpers.cbRespond(options.type, options.data, options.cb);
			expect(cbSpy.calledWith(null, options.data)).to.be.true;
		});

		it('should use callbacks for errors if applicable', function() {
			var cbSpy = sinon.spy(options, 'cb');

			helpers.cbRespond(options.type, options.data, options.cb);
			expect(cbSpy.calledWith(options.data, null)).to.be.true;
		});

		it('should return error if invalid type is passed', function() {
			var cbSpy = sinon.spy(options, 'cb');

			helpers.cbRespond('invalid', options.data, options.cb);
			expect(cbSpy.calledWith(invalidTypeMsg, null)).to.be.true;
		});
	});
});
