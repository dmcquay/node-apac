var sys = require('sys'),
    OperationHelper = require('../lib/Amazon/OperationHelper').OperationHelper;

var awsId = '[YOUR AWS ID HERE]',
    awsSecret = '[YOUR AWS SECRET HERE]',
    associateTag = '[YOUR ASSOCIATE TAG HERER]';

var opHelper = new OperationHelper({
    awsId:     awsId,
    awsSecret: awsSecret,
    assocId:   associateTag
});

opHelper.execute('ItemSearch', {
    'SearchIndex': 'Books',
    'Keywords': 'harry potter',
    'ResponseGroup': 'ItemAttributes,Offers'
}, function(error, results) {
    if (error) { sys.print('Error: ' + error + "\n") }
    sys.print("Results:\n" + results + "\n");
});
