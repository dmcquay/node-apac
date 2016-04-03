[![Build Status](https://travis-ci.org/dmcquay/node-apac.svg?branch=master)](https://travis-ci.org/dmcquay/node-apac)

# node-apac - Node.js client for the Amazon Product Advertising API.

apac (Amazon Product Advertising Client) will allow you to access the Amazon Product Advertising API from Node.js. It
supports the newly required Request Signatures which can be a bit tedious to generate on your own.
[Learn more about the Amazon Product Advertising API](https://affiliate-program.amazon.com/gp/advertising/api/detail/main.html).

node-apac is just a thin wrapper around Amazon's API. The only intent is to take care of request signatures, performing
the HTTP requests, processing the responses and parsing the XML. You should be able to run any operation because the
operation and all parameters are passed directly to the execute method just as they will be passed to Amazon. The result
is that you feel like you're working directly with the API, but you don't have to worry about some of the more tedious
tasks.

## Changelog

**v1.1.0**

 - OperationHelper.execute now supports promises
 - Internal improvements such as more robust testing

**v1.0.0**

 - Errors are now returned as the first parameter of the callback function, instead of being processed by a separate
   OnError function. Note: This breaks backwards compatibility with previous versions where errors are processed by a
   separate function. If you still need the old OnError function, you'll need to grab an old version from git.

## Installation

Install using npm:
```bash
$ npm install apac
```

## Quick Start

Here's a quick example:
```javascript
var util = require('util'),
    OperationHelper = require('apac').OperationHelper;

var opHelper = new OperationHelper({
    awsId:     '[YOUR AWS ID HERE]',
    awsSecret: '[YOUR AWS SECRET HERE]',
    assocId:   '[YOUR ASSOCIATE TAG HERE]',
    // xml2jsOptions: an extra, optional, parameter for if you want to pass additional options for the xml2js module. (see https://github.com/Leonidas-from-XIV/node-xml2js#options)
    version:   '2013-08-01'
    // your version of using product advertising api, default: 2013-08-01
});


// execute(operation, params)
// operation: select from http://docs.aws.amazon.com/AWSECommerceService/latest/DG/SummaryofA2SOperations.html
// params: parameters for operation (optional)
// callback(err, parsed, raw): callback function handling results. err = potential errors raised from xml2js.parseString() or http.request(). parsed = xml2js parsed response. raw = raw xml response.

opHelper.execute('ItemSearch', {
  'SearchIndex': 'Books',
  'Keywords': 'harry potter',
  'ResponseGroup': 'ItemAttributes,Offers'
}).then((response) => {
	console.log(response.results);

	// raw xml response is also available
	// console.log(response.responseBody);
}).catch((err) => {
    console.error(err);
});

// output:
// { ItemSearchResponse: 
//    { '$': { xmlns: 'http://webservices.amazon.com/AWSECommerceService/2011-08-01' },
//      OperationRequest: [ [Object] ],
//      Items: [ [Object] ] } }
```

Results are returned as a JSON object (XML results parsed using xml2js -- thanks pierrel).

Error Handling:
Note that there are three possible types of errors that can arise from opHelper.execute(). 
1: xml2js.parseString() raised an error. 
2: http.request to Amazon raised an error. (ex. a 404 error) 
3: An error returned by Amazon after successfully sending the request. (ex. You provided invalid AWS keys.)

Both error 1 and 2 are returned in the promise catch callback, and error 3 would be in "results" as you successfully
received a response from Amazon. (Note: old callback interface is still supported. See examples/example-item-search.js.)

## Obtaining credentials

Sign up here:
https://affiliate-program.amazon.com/gp/advertising/api/detail/main.html
This will also direct you where to get your security credentials (accessKeyId and secretAccessKey)
You will also need to go here: http://docs.aws.amazon.com/AWSECommerceService/latest/DG/becomingAssociate.html
and click on one of the locale specific associate websites to sign up as an associate and get an associate ID,
which is required for all API calls.

## Throttling / Request Limits

By default, Amazon limits you to one request per second per IP. This limit increases with revenue performance. Learn
more here: http://docs.aws.amazon.com/AWSECommerceService/latest/DG/TroubleshootingApplications.html

To help you ensure you don't exceed the request limit, we provide an automatic throttling feature. By default, apac will
not throttle. To enable throttling, set the maxRequestsPerSecond param when constructing your OperationHelper.

```javascript
var opHelper = new OperationHelper({
    awsId:     '[YOUR AWS ID HERE]',
    awsSecret: '[YOUR AWS SECRET HERE]',
    assocId:   '[YOUR ASSOCIATE TAG HERE]',
    maxRequestsPerSecond: 1
});
```

## Contributing

Feel free to submit a pull request. If you'd like, you may discuss the change with me first by submitting an issue.
Please test all your changes. Current tests are located in lib/*.specs.js (next to each file under test).

Execute tests with `npm test`

Execute acceptance tests with `npm run test:acceptance`.
For acceptance tests, you must set these environment variables first:

```
AWS_ACCESS_KEY_ID=[VALUE]
AWS_SECRET_ACCESS_KEY=[VALUE]
AWS_ASSOCIATE_ID=[VALUE]
```

You can set these values in your environment or in `test/acceptance/.env`.

## API Documentation

Because we don't define any specific operations, we also don't document them. What a waste
when you can find them all here:
[API Reference](http://docs.amazonwebservices.com/AWSECommerceService/latest/DG/index.html?ProgrammingGuide.html)

## License

Copyright (c) 2016 Dustin McQuay. All rights reserved.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
