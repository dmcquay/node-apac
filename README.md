# node-apac - Node.js client for the Amazon Product Advertising API.

apac (Amazon Product Advertising Client) will allow you to access the Amazon Product Advertising API from Node.js. It supports the newly required Request Signatures which can be a bit tedious to generate on your own. [Learn more about the Amazon Product Advertising API](https://affiliate-program.amazon.com/gp/advertising/api/detail/main.html).

node-apac is just a thin wrapper around Amazon's API. The only intent is to take care of request signatures, performing the HTTP requests, processing the responses and parsing the XML. You should be able to run any operation becuase the operation and all parameters are passed directly to the execute method just as they will be passed to Amazon. The result is that you feel likely you're working directly with the API, but you don't have to worry about some of the more teadious tasks.

## Changelog
**v1.0.0** 
Errors are now returned as the first parameter of the callback function, instead of being processed by a seperate OnError function.
Note: This will break backwards compatibility with previous implementations where errors are processed by a sepearte funciton. Because of this, **version 1.0.0 will not be uploaded to NPM yet**, until more core features are added. Those who would like the new error processing implementation can get the module by cloning GitHub.

## Installation

Install using npm:
```bash
$ npm install apac@latest
```

If you try to install without "@latest", it will try to install the most recent stable
version, but there is no stable version yet. So for now you must specify latest.

## Quick Start

Here's a quick example:
```javascript
var util = require('util'),
    OperationHelper = require('apac').OperationHelper;

var opHelper = new OperationHelper({
    awsId:     '[YOUR AWS ID HERE]',
    awsSecret: '[YOUR AWS SECRET HERE]',
    assocId:   '[YOUR ASSOCIATE TAG HERE]'
    // xml2jsOptions: an extra, optional, parameter for if you want to pass additional options for the xml2js module. (see https://github.com/Leonidas-from-XIV/node-xml2js#options)
});


// execute(operation, params, callback)
// operation: select from http://docs.aws.amazon.com/AWSECommerceService/latest/DG/SummaryofA2SOperations.html
// params: parameters for operation (optional)
// callback(err, parsed, raw): callback function handling results. err = potential errors raised from xml2js.parseString() or http.request(). parsed = xml2js parsed response. raw = raw xml response.

opHelper.execute('ItemSearch', {
  'SearchIndex': 'Books',
  'Keywords': 'harry potter',
  'ResponseGroup': 'ItemAttributes,Offers'
}, function(err, results) { // you can add a third parameter for the raw xml response, "results" here are currently parsed using xml2js
	console.log(results);
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

Both error 1 and 2 are returned as the first parameter to the callback funciton in v1.0.0, and error 3 would be in "results" as you successfully recieved a response from Amazon.

## API Documentation

Because we don't define any specific operations, we also don't document them. What a waste
when you can find them all here:
[API Reference](http://docs.amazonwebservices.com/AWSECommerceService/latest/DG/index.html?ProgrammingGuide.html)

## License

Copyright (c) 2010 Dustin McQuay. All rights reserved.

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
