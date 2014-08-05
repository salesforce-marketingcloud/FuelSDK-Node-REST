Fuel REST Client (for Node.js)
=============

This library allows users access to ExactTarget's REST API at a low level.

## API

**new FuelRest( authOptions, restEndpoint )** - Initialization

* *authOptions*
    * required: yes
    * type: `Object`
    * properties need to match [FuelAuth Initialization][1]
* *restEndpoint*
    * required: no
    * type: `String`
    * default: https://www.exacttargetapis.com

### HTTP Methods

#### Methods

See next section for shared parameters

* **get( uri, options, callback )**
* **post( uri, data, options, callback )**
* **put( uri, data, options, callback )**
* **delete( uri, data, options, callback )**
* **apiRequest( type, uri, options, callback )** -- used by get, post, put, delete
    * *type*
        * required: yes
        * type: `String`
        * http method of request

#### Shared Parameters

***Shared by all methods***

* *uri*
    * required: yes
    * type: `String`
    * will merge to the restEndpoint provided using [url.resolve][2]
* *options*
    * required: no
    * type: `Object`
    * when using callback `null` will need to be passed if not needed
    * *properties*
        * requestOptions
            *  type: `Object`
            * options passed during call to REST API. See [request modules options][3]
        * authOptions
            *  type: `Object`
            * options passed when [Fuel Auth requests token][4]. See [request modules options][3]
                * requestOptions - not required
                * forceRequest - not required
* *callback( error, data )*
    * required: no
    * type: `Function`
    * function that will be executed after request completes
    * *parameters*
        * error - error encountered. `null` if no error
        * data - object with data and response
            * res ( data.res ) - full response from API call
            * body ( data.body ) - parsed payload from API call

***Shared by post, put, delete***

* *data*
    * required: no
    * type: `Object`
    * is data the will be posted to REST API
        * will be deep merged into `options.requestOptions.json`

## Setting up the client

```js
var FuelRest = require( 'fuel-rest' );
var alternateEndpoint;
var options = {
    requestOptions: {
        // options you want on the REST call
    }
    , authOptions: {
        // options you want on the Auth call
    }
};

var RestClient = new FuelRest({
    clientId: 'clientId'
    , clientSecret: 'clientSecret'
}, alternateEndpoint );
```


## Examples

### Using Events

```js
RestClient.once( 'response', function( response ) {
	// will be delivered with 200, 400, 401, 500, etc status codes
	// response.body === payload from response
	// response.res === full response from request client
	console.log( response );
});

RestClient.once( 'error', function( error ) {
	// error here
	console.log( error );
})

RestClient.get( '/platform/v1/endpoints', options );
```

#### Events Emitted

| Event | Fired When... | Data Returned |
| ----- | ------------- | ---- |
| response | a request was successfully made to the API and a payload was returned (200, 400, 401, 500) | payload from API (200, 400, 401, 500) |
| error | an error occured in any part of the module | `Error Object`. Error object will have property `errorPropagatedFrom` letting you know where the error originated from (hopefully easier debugging) |

### Using Callbacks
```js
RestClient.get( '/platform/v1/endpoints', options, function( err, response ) {
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

Waiting until first release

[1]: https://github.com/ExactTarget/Fuel-Node-Auth#api
[2]: http://nodejs.org/api/url.html#url_url_resolve_from_to
[3]: https://github.com/mikeal/request#requestoptions-callback
[4]: https://github.com/ExactTarget/Fuel-Node-Auth#api
