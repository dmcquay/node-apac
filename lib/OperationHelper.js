var RSH = require('./RequestSignatureHelper').RequestSignatureHelper,
    http = require('http');

var OperationHelper = function(params) {
    this.init(params);
};

OperationHelper.version = '2010-01-25';
OperationHelper.service = 'AWSECommerceService';
OperationHelper.defaultEndPoint = 'ecs.amazonaws.com';
OperationHelper.defaultBaseUri = '/onca/xml';

OperationHelper.prototype.init = function(params) {
    params = params || {};

    // check requried params
    if (typeof(params.awsId)     === 'undefined') { throw 'Missing AWS Id param' }
    if (typeof(params.awsSecret) === 'undefined') { throw 'Missing AWS Secret param' }
    if (typeof(params.assocId)   === 'undefined') { throw 'Missing Associate Id param' }

    // set instance variables from params
    this.awsId     = params.awsId;
    this.awsSecret = params.awsSecret;
    this.assocId   = params.assocId;
    this.endPoint  = params.endPoint || OperationHelper.defaultEndPoint;
    this.baseUri   = params.baseUri || OperationHelper.defaultBaseUri;
};

OperationHelper.prototype.getSignatureHelper = function() {
    if (typeof(this.signatureHelper) === 'undefined') {
        var params = {}; 
        params[RSH.kAWSAccessKeyId] = this.awsId;
        params[RSH.kAWSSecretKey]   = this.awsSecret;
        params[RSH.kEndPoint]       = this.endPoint;
        this.signatureHelper = new RSH(params);
    }
    return this.signatureHelper;
};

OperationHelper.prototype.generateParams = function(operation, params) {
    params.Service = OperationHelper.service;
    params.Version = OperationHelper.version;
    params.Operation = operation;
    params.AWSAccessKeyId = this.awsId;
    params.AssociateTag = this.assocId;
    return params;
};

OperationHelper.prototype.execute = function(operation, params, callback) {
    if (typeof(operation) === 'undefined') { throw 'Missing operation parameter' }
    if (typeof(params) === 'undefined') { params = {} }
    params = this.generateParams(operation, params);
    var helper = this.getSignatureHelper();
    params = helper.sign(params);
    var queryString = helper.canonicalize(params);
    var uri = this.baseUri + '?' + queryString;
    var host = this.endPoint;
    var amazonClient = http.createClient(80, host);
    var request = amazonClient.request('GET', uri, {'host':host});
    request.end();
    request.addListener('response', function(response) {
        var responseBody = '';
        response.addListener('data', function(chunk) {
            responseBody = responseBody + chunk;
        });
        response.addListener('end', function() {
            //TODO: parse the response body and return as an object instead of raw XML
            //      having a hard time finding an XML parser. Here's an iffy one I
            //      found: http://github.com/sdepold/node-aws/blob/master/lib/vendor/restler/vendor/xml2json.js
            //      Just found a much better one: http://libxmljs.squishtech.com/
            //TODO: check XML for error, not just status code
            var statusCode = response.statusCode == 200 ? null : response.statusCode;
            callback(statusCode, responseBody);
        });
        response.setEncoding('utf8');
    });
};

exports.OperationHelper = OperationHelper;
