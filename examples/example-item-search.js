var util = require('util'),
    OperationHelper = require('../lib/apac').OperationHelper;

var opHelper = new OperationHelper({
  awsId: '[YOUR AWS ID HERE]',
  awsSecret: '[YOUR AWS SECRET HERE]',
  assocId: '[YOUR ASSOCIATE TAG HERE]'
});

opHelper.execute('ItemSearch', {
  'SearchIndex': 'Books',
  'Keywords': 'harry potter',
  'ResponseGroup': 'ItemAttributes,Offers'
}, function(err, results) {
	console.log(results);
});
