var sys = require('sys'),
    OperationHelper = require('apac').OperationHelper;

var opHelper = new OperationHelper({
    awsId:     '[YOUR AWS ID HERE]',
    awsSecret: '[YOUR AWS SECRET HERE]',
    assocId:   '[YOUR ASSOCIATE TAG HERE]',
});

opHelper.execute('ItemSearch', {
    'SearchIndex': 'Books',
    'Keywords': 'harry potter',
    'ResponseGroup': 'ItemAttributes,Offers'
}, function(error, results) {
    if (error) { sys.print('Error: ' + error + "\n") }
    sys.print("Results:\n" + sys.inspect(results) + "\n");
});
