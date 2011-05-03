var crypto = require('crypto');

var RSH = function(params) {
  this.init(params);
};

RSH.kAWSAccessKeyId = 'AWSAccessKeyId';
RSH.kAWSSecretKey = 'AWSSecretKey';
RSH.kEndPoint = 'EndPoint';
RSH.kRequestMethod = 'RequestMethod';
RSH.kRequestUri = 'RequestUri';
RSH.kTimestampParam = 'Timestamp';
RSH.kSignatureParam = 'Signature';

RSH.prototype.init = function(params) {
  // enforce required params
  if (typeof(params[RSH.kAWSAccessKeyId]) === 'undefined') { throw 'Need access key id argument' }
  if (typeof(params[RSH.kAWSSecretKey]) === 'undefined') { throw 'Need secret key argument' }
  if (typeof(params[RSH.kEndPoint]) === 'undefined') { throw 'Need end point argument' }

  // set params
  this[RSH.kAWSAccessKeyId] = params[RSH.kAWSAccessKeyId];
  this[RSH.kAWSSecretKey] = params[RSH.kAWSSecretKey];
  this[RSH.kEndPoint] = params[RSH.kEndPoint].toLowerCase();
  this[RSH.kRequestMethod] = params[RSH.kRequestMethod] || 'GET';
  this[RSH.kRequestUri] = params[RSH.kRequestUri] || '/onca/xml';
};

RSH.prototype.sign = function(params) {
  var self = this;
  // append params
  params[RSH.kTimestampParam] = this.generateTimestamp();
  // generate signature
  var canonical = this.canonicalize(params);
  var stringToSign = [
    this[RSH.kRequestMethod],
    this[RSH.kEndPoint],
    this[RSH.kRequestUri],
    canonical
  ].join('\n');
  params[RSH.kSignatureParam] = this.digest(stringToSign);

  return params;
};

RSH.prototype.zeroPad = function(num, length) {
  num = num + '';
  while (num.length < length) {
    num = '0' + num;
  }
  return num;
};

RSH.prototype.generateTimestamp = function() {
  var now = new Date(),
      year = now.getUTCFullYear(),
      month = this.zeroPad(now.getUTCMonth() + 1, 2),
      day = this.zeroPad(now.getUTCDate(), 2),
      hours = this.zeroPad(now.getUTCHours(), 2),
      mins = this.zeroPad(now.getUTCMinutes(), 2),
      secs = this.zeroPad(now.getUTCSeconds(), 2);
  return [year, month, day].join('-') + 'T' +
      [hours, mins, secs].join(':') + 'Z';
};


/**
 * Port of PHP rawurlencode().
 */
RSH.prototype.escape = function(x) {
  return encodeURIComponent(x).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A');
};

RSH.prototype.digest = function(x) {
  var secretKey = this[RSH.kAWSSecretKey];
  var hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(x);
  return hmac.digest('base64');
};

RSH.prototype.canonicalize = function(params) {
  var parts = [];
  for (var key in params) {
    parts.push([this.escape(key), this.escape(params[key])].join('='));
  }
  return parts.sort().join('&');
};

exports.RequestSignatureHelper = RSH;
