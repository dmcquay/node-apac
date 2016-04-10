"use strict"

var assert = require('assert'),
    RSH = require('./request-signature-helper').RequestSignatureHelper

describe('RequestSignatureHelper', () => {
    let rsh
    const secretKey = 'this is a secret key'
    const accessKeyId = 'this is an access key'
    const endPoint = ''
    const params = {
        [RSH.kAWSAccessKeyId]: accessKeyId,
        [RSH.kAWSSecretKey]: secretKey,
        [RSH.kEndPoint]: endPoint
    }

    before(() => {
        rsh = new RSH(params)
    })

    it('should create an instance', () => {
        expect(rsh).to.be.an.instanceOf(RSH)
    })

    describe('#canonicalize', () => {
        it('should return a string', () => {
            expect(rsh.canonicalize({'a': 'b'})).to.be.a('string')
        })

        it('should produce a query string format', () => {
            expect(rsh.canonicalize({'a': 'b'})).to.equal('a=b')
        })

        it('should produce a query string with multiple parameters', () => {
            expect(rsh.canonicalize({'a': 'b', 'c': 'd'})).to.equal('a=b&c=d')
        })

        it('should sort the parameters', () => {
            expect(rsh.canonicalize({'f': 'b', 'a': 'q'})).to.equal('a=q&f=b')
        })
    })

    describe('#digest', () => {
        let testStr = 'this is a test string'
        let digest = 'faew2bQnf2IfFY9Wm8CrIL6AWWp6N+2JFOEwEmMJyKA='

        it('should return a string', () => {
            expect(rsh.digest(testStr)).to.be.a('string')
        })

        it('should create the correct digest', () => {
            expect(rsh.digest(testStr)).to.equal(digest)
        })
    })

    describe('#zeroPad', () => {
        it('should pad correctly', () => {
            expect(rsh.zeroPad(1, 3)).to.equal('001')
        })
    })

    describe('#generateTimestamp', () => {
        it('should format the timestamp correctly', () => {
            expect(rsh.generateTimestamp()).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/)
        })
    })

    describe('#sign', () => {
        let params

        before(() => {
            params = rsh.sign({'d': 'a', 'c': 'f'});
        })

        it('should return an object', () => {
            expect(params).to.be.an('object')
        })

        it('should add timestamp to the params', () => {
            expect(params[RSH.kTimestampParam]).to.be.a('string')
            expect(params[RSH.kTimestampParam]).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/)
        })

        it('should add signature to the params', () => {
            expect(params[RSH.kSignatureParam]).to.be.a('string')
        })
    })
})