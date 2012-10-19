var assert = require('assert'),
    RSH = require('../lib/RequestSignatureHelper').RequestSignatureHelper;

// constructor
var secretKey = 'this is a secret key',
    accessKeyId = 'this is an access key',
    endPoint = '';
var params = {};
params[RSH.kAWSAccessKeyId] = accessKeyId;
params[RSH.kAWSSecretKey] = secretKey;
params[RSH.kEndPoint] = endPoint;
var rsh = new RSH(params);
assert.equal(typeof(rsh), 'object', 'instance created');

// canonicalize
assert.equal(typeof(rsh.canonicalize({'a': 'b'})), 'string', 'result of canonicalize is a string');
assert.equal(rsh.canonicalize({'a': 'b'}), 'a=b', 'result of canonicalize is a query string');
assert.equal(rsh.canonicalize({'a': 'b', 'c': 'd'}), 'a=b&c=d', 'result of canonicalize is a query string');
assert.equal(rsh.canonicalize({'f': 'b', 'a': 'q'}), 'a=q&f=b', 'result of canonicalize is sorted by key');

// digest
var testStr = 'this is a test string',
    digest = 'faew2bQnf2IfFY9Wm8CrIL6AWWp6N+2JFOEwEmMJyKA=';
assert.equal(typeof(rsh.digest(testStr)), 'string', 'digest returns a string');
assert.equal(rsh.digest(testStr), digest, 'digest is correct');

// zeroPad
assert.equal(rsh.zeroPad(1, 3), '001', 'zeroPad output is correct');

// generateTimestamp
// example of correctly formatted timestamp: 2010-06-28T23:20:31Z
assert.ok(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/.test(rsh.generateTimestamp()), 'timestamp format is correct');

// sign
params = rsh.sign({'d': 'a', 'c': 'f'});
assert.equal(typeof(params), 'object');
assert.equal(params[RSH.kAWSAccessKeyId], accessKeyId, 'accessKeyId was added to params');
assert.equal(typeof(params[RSH.kTimestampParam]), 'string', 'timestamp was added to params');
assert.ok(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/.test(params[RSH.kTimestampParam]), 'timestamp format is correct');
assert.equal(typeof(params[RSH.kSignatureParam]), 'string', 'signature was added to params');
