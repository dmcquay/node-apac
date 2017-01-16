[![Build Status](https://travis-ci.org/dmcquay/node-apac.svg?branch=master)](https://travis-ci.org/dmcquay/node-apac)

# node-apac - Node.js client for the Amazon Product Advertising API.

apac (Amazon Product Advertising Client) will allow you to access the Amazon Product Advertising API from Node.js.
[Learn more about the Amazon Product Advertising API](https://affiliate-program.amazon.com/gp/advertising/api/detail/main.html).

node-apac is just a thin wrapper around Amazon's API. The only intent is to take care of request signatures, performing
the HTTP requests, processing the responses and parsing the XML. You should be able to run any operation because the
operation and all parameters are passed directly to the execute method just as they will be passed to Amazon. The result
is that you feel like you're working directly with the API, but you don't have to worry about some of the more tedious
tasks.
 

## Installation

Install using npm:
```bash
$ npm install apac
```

## Quick Start

Here's a quick example:
```javascript
const {OperationHelper} = require('apac');

const opHelper = new OperationHelper({
    awsId:     '[YOUR AWS ID HERE]',
    awsSecret: '[YOUR AWS SECRET HERE]',
    assocId:   '[YOUR ASSOCIATE TAG HERE]'
});

opHelper.execute('ItemSearch', {
  'SearchIndex': 'Books',
  'Keywords': 'harry potter',
  'ResponseGroup': 'ItemAttributes,Offers'
}).then((response) => {
    console.log("Results object: ", response.result);
    console.log("Raw response body: ", response.responseBody);
}).catch((err) => {
    console.error("Something went wrong! ", err);
});
```

Example Response:

```javascript
{
    ItemSearchResponse: {
        OperationRequest: [Object],
        Items: [Object]
    }
}
```

## API Documentation

Since we just wrap the Amazon Product Advertising API, you'll reference their API docs:
[API Reference](http://docs.amazonwebservices.com/AWSECommerceService/latest/DG/index.html?ProgrammingGuide.html)

## Obtaining credentials

Sign up here: https://affiliate-program.amazon.com/gp/advertising/api/detail/main.html

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

## Locales

To use a locale other than the default (US), set the locale parameter.

```javascript
var opHelper = new OperationHelper({
    awsId:     '[YOUR AWS ID HERE]',
    awsSecret: '[YOUR AWS SECRET HERE]',
    assocId:   '[YOUR ASSOCIATE TAG HERE]',
    locale:    'IT'
});
```

**Supported Locales**

ID|Locale|Endpoint
---|---|---
BR|Brazil|webservices.amazon.com.br
CA|Canada|webservices.amazon.ca
CN|China|webservices.amazon.cn
FR|France|webservices.amazon.fr
DE|Germany|webservices.amazon.de
IN|India|webservices.amazon.in
IT|Italy|webservices.amazon.it
JP|Japan|webservices.amazon.co.jp
MX|Mexico|webservices.amazon.com.mx
ES|Spain|webservices.amazon.es
UK|United Kingdom|webservices.amazon.co.uk
US|United States|webservices.amazon.com

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
