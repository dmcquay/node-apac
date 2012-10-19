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
}, function(error, results) {
  if (error) { util.print('Error: ' + error + '\n') }
  util.print('Results:\n' + util.inspect(results) + '\n');
});
