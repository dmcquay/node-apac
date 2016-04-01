"use strict"

var crypto = require('crypto')

class RSH {
    constructor(params) {
        this.init(params)
    }

    init(params) {
        // enforce required params
        if (typeof(params[RSH.kAWSAccessKeyId]) === 'undefined') {
            throw new Error('Need access key id argument')
        }
        if (typeof(params[RSH.kAWSSecretKey]) === 'undefined') {
            throw new Error('Need secret key argument')
        }
        if (typeof(params[RSH.kEndPoint]) === 'undefined') {
            throw new Error('Need end point argument')
        }

        // set params
        this[RSH.kAWSAccessKeyId] = params[RSH.kAWSAccessKeyId]
        this[RSH.kAWSSecretKey] = params[RSH.kAWSSecretKey]
        this[RSH.kEndPoint] = params[RSH.kEndPoint].toLowerCase()
        this[RSH.kRequestMethod] = params[RSH.kRequestMethod] || 'GET'
        this[RSH.kRequestUri] = params[RSH.kRequestUri] || '/onca/xml'
    }

    sign(params) {
        // append params
        params[RSH.kTimestampParam] = this.generateTimestamp()
        // generate signature
        var canonical = this.canonicalize(params)
        var stringToSign = [
            this[RSH.kRequestMethod],
            this[RSH.kEndPoint],
            this[RSH.kRequestUri],
            canonical
        ].join('\n')
        params[RSH.kSignatureParam] = this.digest(stringToSign)

        return params
    }

    zeroPad(num, length) {
        num = num + ''
        while (num.length < length) {
            num = '0' + num
        }
        return num
    }

    generateTimestamp() {
        var now = new Date(),
            year = now.getUTCFullYear(),
            month = this.zeroPad(now.getUTCMonth() + 1, 2),
            day = this.zeroPad(now.getUTCDate(), 2),
            hours = this.zeroPad(now.getUTCHours(), 2),
            mins = this.zeroPad(now.getUTCMinutes(), 2),
            secs = this.zeroPad(now.getUTCSeconds(), 2)
        return [year, month, day].join('-') + 'T' +
            [hours, mins, secs].join(':') + 'Z'
    }


    /**
     * Port of PHP rawurlencode().
     */
    escape(x) {
        return encodeURIComponent(x).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A')
    }

    digest(x) {
        var secretKey = this[RSH.kAWSSecretKey]
        var hmac = crypto.createHmac('sha256', secretKey)
        hmac.update(x)
        return hmac.digest('base64')
    }

    canonicalize(params) {
        var parts = []
        for (var key in params) {
            parts.push([this.escape(key), this.escape(params[key])].join('='))
        }
        return parts.sort().join('&')
    }
}

RSH.kAWSAccessKeyId = 'AWSAccessKeyId'
RSH.kAWSSecretKey = 'AWSSecretKey'
RSH.kEndPoint = 'EndPoint'
RSH.kRequestMethod = 'RequestMethod'
RSH.kRequestUri = 'RequestUri'
RSH.kTimestampParam = 'Timestamp'
RSH.kSignatureParam = 'Signature'

exports.RequestSignatureHelper = RSH