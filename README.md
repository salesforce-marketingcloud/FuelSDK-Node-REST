Fuel REST Client (for Node.js) [![Build Status](https://travis-ci.org/salesforce-marketingcloud/FuelSDK-Node-REST.svg?branch=master)](https://travis-ci.org/salesforce-marketingcloud/FuelSDK-Node-REST)
=============

**This repo used to be located at https://github.com/exacttarget/Fuel-Node-REST**

This library allows users access to the Salesforce Marketing Cloud (formerly ExactTarget) REST API at a low level.

```
npm install fuel-rest --save

yarn add fuel-rest
```

## Initialization

**new FuelRest(options)** - Initialization

* `options.auth`
    * Required: yes
    * Type: `Object` or [FuelAuth Instance][1]
    * properties need to match [FuelAuth][1]
* `options.origin` or `options.restEndpoint`
    * Required: no
    * Type: `String`
    * Default: https://www.exacttargetapis.com
* `options.headers`
    * Required: no
    * Type: `Object`
    * set headers that apply to all REST requests (not auth requests)

## API

* **apiRequest(options, callback)**
    * `options` - [see request modules options][3]
    * `options.auth` - will be passed into [getAccessToken][4] inside Fuel Auth
    * `options.uri` - can either be a full url or a path that is appended to `options.origin` used at initialization ([url.resolve][2])
    * `options.retry` - boolean value representing whether or not to retry request (and request new token) on 401 invalid token response. `default: false`
    * `callback` - executed after task is completed.
        * if no callback is passed, you'll need to use the promise interface
* **get | post | put | patch | delete(options, callback)**
    * `options` - see apiRequest options
    * `options.retry` - see above for description. `default: true`
    * `callback` - see apiRequest options
    * Request method will be overwritten by these methods. It will be set to same value as the name of the method used

## Setting up the client

```js
const FuelRest = require('fuel-rest');
const options = {
	auth: {
		// options you want passed when Fuel Auth is initialized
		clientId: 'clientId',
		clientSecret: 'clientSecret'
	},
	origin: 'https://alternate.rest.endpoint.com' // default --> https://www.exacttargetapis.com
};

const RestClient = new FuelRest(options);
```


## Examples

```js
const options = {
	uri: '/platform/v1/endpoints',
	headers: {}
	// other request options
};

// CANNOT USE BOTH CALLBACKS AND PROMISES TOGETHER
RestClient.get(options, (err, response) => {
	if (err) {
		// error here
		console.log(err);
	}

	// will be delivered with 200, 400, 401, 500, etc status codes
	// response.body === payload from response
	// response.res === full response from request client
	console.log(response);
});

// or with promises
RestClient.get(options)
	.then(response => {
		// will be delivered with 200, 400, 401, 500, etc status codes
		// response.body === payload from response
		// response.res === full response from request client
		console.log(response);
	})
	.catch(err => console.log(err));
```

## Contributors

* Alex Vernacchia (author) - [twitter](https://twitter.com/vernacchia), [github](https://github.com/vernak2539)
* Kelly Andrews - [twitter](https://twitter.com/kellyjandrews), [github](https://github.com/kellyjandrews)
* David Brainer-Banker - [twitter](https://twitter.com/TweetTypography), [github](https://github.com/tweettypography)

## Contributing

We welcome all contributions and issues! There's only one way to make this better, and that's by using it. If you would like to contribute, please checkout our [guidelines][5]!

## Supported Node Versions

We follow the [Node.js Release Schedule](https://github.com/nodejs/Release#release-schedule). When the current date is past the version's "Maintenance LTS End" it will no longer be supported by this library. A major release on this module will be published when this occurs. 

## ChangeLog

* **See tags/release page for release notes after 0.7.2**
* **0.7.2** - 2014-10-16 - account for content-type header not being present on API response
* **0.7.1** - 2014-09-09 - removed unneeded "!!"
* **0.7.0** - 2014-08-29 (public release, 1st npm version)
    * request retry on 401 invalid token response
    * created helpers file for certain functions
    * updated error delivering/throwing
* **0.6.0** - 2014-08-26 - added patch method
* **0.5.0** - 2014-08-26 - API overhaul (apiRequest + all http methods) - *breaking*
* **0.4.0** - 2014-08-25 - changed object initialization - *breaking*
* **0.3.0** - 2014-08-20
    * added ability to use initialized fuel auth
    * updated travis ci config
    * added license
* **0.2.0** - 2014-08-09 - removed event emitter - *breaking*
* **0.1.0** - 2014-08-07
    * initial module
    * initial unit tests

[1]: https://github.com/salesforcefuel/FuelSDK-Node-Auth/wiki/Initialization
[2]: http://nodejs.org/api/url.html#url_url_resolve_from_to
[3]: https://github.com/mikeal/request#requestoptions-callback
[4]: https://github.com/salesforcefuel/FuelSDK-Node-Auth/wiki/getAccessToken
[5]: https://github.com/salesforcefuel/FuelSDK-Node-REST/wiki/Contributing
