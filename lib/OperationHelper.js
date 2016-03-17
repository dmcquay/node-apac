var RSH = require('./RequestSignatureHelper').RequestSignatureHelper,
    http = require('http'),
    xml2js = require('xml2js');

var OperationHelper = function(params) {
    this.init(params);
};

OperationHelper.version = '2013-08-01';
OperationHelper.service = 'AWSECommerceService';
OperationHelper.defaultEndPoint = 'ecs.amazonaws.com';
OperationHelper.defaultBaseUri = '/onca/xml';

/**
 * Set instance
 *
 * ####Example:
 *
 *     opHelper.set('endPoint', 'webservices.amazon.de')
 *
 * @param {String} key
 * @param {String} value
 * @api public
 */

OperationHelper.prototype.set = function(key, value) {
    if (arguments.length === 1) {
        return this._options[key];
    }
    this._options[key] = value;
    return value;
};


/**
 * Gets instance
 *
 * ####Example:
 *
 *     opHelper.get('endPoint')
 *
 * @param {String} key
 * @method get
 * @api public
 */

OperationHelper.prototype.get = OperationHelper.prototype.set;

OperationHelper.prototype.init = function(params) {
    params = params || {};
    this._options = {};

    // check requried params
    if (typeof(params.awsId)     === 'undefined') { throw new Error('Missing AWS Id param') }
    if (typeof(params.awsSecret) === 'undefined') { throw new Error('Missing AWS Secret param') }
    if (typeof(params.assocId)   === 'undefined') { throw new Error('Missing Associate Id param') }

    // set instance variables from params
    this.awsId     = params.awsId;
    this.awsSecret = params.awsSecret;
    this.assocId   = params.assocId;
    this.endPoint  = params.endPoint || OperationHelper.defaultEndPoint;
    this.baseUri   = params.baseUri || OperationHelper.defaultBaseUri;
    this.xml2jsOptions   = params.xml2jsOptions || {};

    // set version
    if (typeof(params.version) === 'string') OperationHelper.version = params.version;
};


OperationHelper.prototype.getSignatureHelper = function() {
    if (typeof(this.signatureHelper) === 'undefined' || (this.get('endPoint') !== this.endPoint)) {
        var params = {};
        params[RSH.kAWSAccessKeyId] = this.awsId;
        params[RSH.kAWSSecretKey]   = this.awsSecret;
        params[RSH.kEndPoint]       = this.get('endPoint') || this.endPoint;
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

OperationHelper.prototype.generateUri = function(operation, params) {
    params = this.generateParams(operation, params);
    var helper = this.getSignatureHelper();
    params = helper.sign(params);
    var queryString = helper.canonicalize(params);
    var uri = this.baseUri + '?' + queryString;
    return uri;
}

OperationHelper.prototype.execute = function(operation, params, callback) {
    if (typeof(operation) === 'undefined') { throw new Error('Missing operation parameter') }
    if (typeof(params) === 'undefined') { params = {} }

    var uri = this.generateUri(operation, params);
    var xml2jsOptions = this.xml2jsOptions;

    var options = {
        hostname: this.get('endPoint') || this.endPoint,
        path: uri,
        method: 'GET'
    };

    var responseBody = '';

    var request = http.request(options, function (response) {
        response.setEncoding('utf8');

        response.on('data', function (chunk) {
            responseBody += chunk;
        });

        response.on('end', function() {
            xml2js.parseString(responseBody, xml2jsOptions, function(err, result){
                callback(err, result, responseBody);
            });
        });

    });

    request.on('error', function (err) {
        callback(err);
    });

    request.end();
};

exports.OperationHelper = OperationHelper;
