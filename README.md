Fuel REST Client (for Node.js)
=============

This library allows users access to ExactTarget's REST API at a low level.

## Initialization

**new FuelRest( options )** - Initialization

* `options.auth`
    * Required: yes
    * Type: `Object` or [FuelAuth Instance][1]
    * properties need to match [FuelAuth][1]
* `options.origin` or `options.restEndpoint`
    * Required: no
    * Type: `String`
    * Default: https://www.exacttargetapis.com

## API

* **apiRequest( options, callback )**
    * `options` - [see request modules options][3]
    * `options.auth` - will be passed into [getAccessToken][4] inside Fuel Auth
    * `options.uri` - can either be a full url or a path that is appended to `options.origin` used at initialization ([url.resolve][2])
    * `callback` - executed after task is completed. **required**
* **get | post | put | patch | delete( options, callback )**
    * `options` - see apiRequest options
    * `callback` - see apiRequest options
    * Request method will be overwritten by these methods. It will be set to same value as the name of the method used

## Setting up the client

```js
var FuelRest = require( 'fuel-rest' );
var options  = {
    auth: {
        // options you want passed when Fuel Auth is initialized
        clientId: 'clientId'
        , clientSecret: 'clientSecret'
    }
    , origin: 'https://alternate.rest.endpoint.com' // default --> https://www.exacttargetapis.com
};

var RestClient = new FuelRest( options );
```


## Examples

```js
var options = {
    uri: '/platform/v1/endpoints'
    headers: {}
    // other request options
};

RestClient.get( options, function( err, response ) {
    if( err ) {
        // error here
        console.log( error );
    }

    // will be delivered with 200, 400, 401, 500, etc status codes
    // response.body === payload from response
    // response.res === full response from request client
    console.log( response );
});
```


## ChangeLog

* **0.5.0** - 2014-08-26
    * api overhaul (apiRequest + all http methods) - *breaking*
* **0.4.0** - 2014-08-25
    * changed object initialization - *breaking*
* **0.3.0** - 2014-08-20
    * added ability to use initialized fuel auth
    * updated travis ci config
    * added license
* **0.2.0** - 2014-08-09
    * removed event emitter - *breaking*
* **0.1.0** - 2014-08-07
    * initial module
    * initial unit tests

[1]: https://github.com/ExactTarget/Fuel-Node-Auth#initialization
[2]: http://nodejs.org/api/url.html#url_url_resolve_from_to
[3]: https://github.com/mikeal/request#requestoptions-callback
[4]: https://github.com/ExactTarget/Fuel-Node-Auth#api
