"use strict"

const http = require('http')
const EventEmitter = require('events')
const xml2js = require('xml2js')
const proxyquire = require('proxyquire')
const RSH = require('./RequestSignatureHelper').RequestSignatureHelper

var OperationHelper = require('./OperationHelper').OperationHelper


describe('OperationHelper', function () {
    const awsId = 'testAwsId'
    const awsSecret = 'testAwsSecret'
    const assocId = 'testAssocId'

    let baseParams = {
        awsId,
        awsSecret,
        assocId
    }

    describe('#getSignatureHelper', () => {
        const mockRSHInstance = {}
        let mockRSHConstructor
        let OperationHelper2, initialSignatureHelper, secondSignatureHelper

        before(() => {
            mockRSHConstructor = sinon.stub().returns(mockRSHInstance)
            mockRSHConstructor.kAWSAccessKeyId = RSH.kAWSAccessKeyId
            mockRSHConstructor.kAWSSecretKey = RSH.kAWSSecretKey
            mockRSHConstructor.kEndPoint = RSH.kEndPoint

            OperationHelper2 = proxyquire('./OperationHelper', {
                './RequestSignatureHelper': {
                    RequestSignatureHelper: mockRSHConstructor
                }
            }).OperationHelper

            let opHelper = new OperationHelper2(baseParams)

            initialSignatureHelper = opHelper.getSignatureHelper()
            secondSignatureHelper = opHelper.getSignatureHelper()
        })

        it('should return a singleton of the signature helper', () => {
            expect(secondSignatureHelper).to.equal(initialSignatureHelper)
        })

        it('should construct the signature helper with the right parameters', () => {
            expect(mockRSHConstructor.firstCall.args[0]).to.eql({
                [RSH.kAWSAccessKeyId]: awsId,
                [RSH.kAWSSecretKey]: awsSecret,
                [RSH.kEndPoint]: OperationHelper.defaultEndPoint
            })
        })
    })

    describe('#generateParams', () => {
        let actual, expected
        const operation = 'testOperation'

        before(() => {
            expected = {
                Service: OperationHelper.service,
                Version: OperationHelper.version,
                Operation: operation,
                AWSAccessKeyId: awsId,
                AssociateTag: assocId
            }

            let opHelper = new OperationHelper(baseParams)
            actual = opHelper.generateParams(operation, {})
        })

        it('should construct the correct params', () => {
            expect(actual).to.eql(expected)
        })
    })

    describe('#generateUri', () => {
        const operation = 'testOperation'
        const params = {foo: 'bar'}
        let opHelper, mockSignatureHelper, actual, expected

        before(() => {
            opHelper = new OperationHelper(baseParams)

            sinon.stub(opHelper, 'generateParams').returnsArg(1)

            mockSignatureHelper = {
                sign: sinon.stub().returnsArg(0),
                canonicalize: sinon.stub().returns('canonicalParams')
            }
            sinon.stub(opHelper, 'getSignatureHelper').returns(mockSignatureHelper)

            actual = opHelper.generateUri(operation, params)
        })

        it('should call generateParams correctly', () => {
            expect(opHelper.generateParams.firstCall.args[0]).to.eql(operation)
            expect(opHelper.generateParams.firstCall.args[1]).to.equal(params)
        })

        it('should sign the params', () => {
            expect(mockSignatureHelper.sign.firstCall.args[0]).to.eql(params)
        })

        it('should canonicalize the params', () => {
            expect(mockSignatureHelper.canonicalize.firstCall.args[0]).to.eql(params)
        })

        it('returns the correct uri', () => {
            expect(actual).to.equal('/onca/xml?canonicalParams')
        })
    })

    describe('#execute', () => {
        let requestMock, responseMock, results, outputResponseBody
        const responseBody = '<it><is><some>xml</some></is></it>'
        const xml2jsOptions = {foo: 'bar'}

        context('happy path', () => {
            before((done) => {
                let opHelper = new OperationHelper({
                    awsId: 'testAwsId',
                    awsSecret: 'testAwsSecret',
                    assocId: 'testAssocId',
                    xml2jsOptions
                })

                responseMock = new EventEmitter()
                responseMock.setEncoding = sinon.spy()

                requestMock = new EventEmitter()
                requestMock.end = () => {
                    responseMock.emit('data', responseBody.substr(0, 5))
                    responseMock.emit('data', responseBody.substr(5))
                    responseMock.emit('end')
                }

                sinon.stub(http, 'request').returns(requestMock).callsArgWith(1, responseMock)
                sinon.stub(opHelper, 'generateUri').returns('testUri')
                sinon.spy(xml2js, 'parseString')

                opHelper.execute('ItemSearch', {
                    'SearchIndex': 'Books',
                    'Keywords': 'harry potter',
                    'ResponseGroup': 'ItemAttributes,Offers'
                }, function (err, _results, _rawResponseBody) {
                    results = _results
                    outputResponseBody = _rawResponseBody
                    done()
                })
            })

            after(() => {
                http.request.restore()
                xml2js.parseString.restore()
            })

            it('should creqte an http request with the correct options', () => {
                expect(http.request.callCount).to.equal(1)
                expect(http.request.firstCall.args[0]).to.eql({
                    hostname: OperationHelper.defaultEndPoint,
                    method: 'GET',
                    path: 'testUri'
                })
            })

            it('should set the response encoding to utf8', () => {
                expect(responseMock.setEncoding.calledWith('utf8'))
            })

            it('should provide the raw response body', () => {
                expect(outputResponseBody).to.equal(responseBody)
            })

            it('should pass the xml2jsOptions to xml2js', () => {
                expect(xml2js.parseString.firstCall.args[1]).to.eql(xml2jsOptions)
            })

            it('should parse XML and return result as object', () => {
                expect(results).to.eql({
                    it: {
                        is: [{
                            some: ['xml']
                        }]
                    }
                })
            })
        })

        context('when the request has an error', () => {
            const error = new Error('testErrorMessage')
            let thrownError

            before((done) => {
                let opHelper = new OperationHelper({
                    awsId: 'testAwsId',
                    awsSecret: 'testAwsSecret',
                    assocId: 'testAssocId'
                })

                responseMock = new EventEmitter()
                responseMock.setEncoding = sinon.spy()

                requestMock = new EventEmitter()
                requestMock.end = () => {
                    requestMock.emit('error', error)
                }

                sinon.stub(http, 'request').returns(requestMock).callsArgWith(1, responseMock)
                sinon.stub(opHelper, 'generateUri').returns('testUri')

                opHelper.execute('ItemSearch', {
                    'SearchIndex': 'Books',
                    'Keywords': 'harry potter',
                    'ResponseGroup': 'ItemAttributes,Offers'
                }, function (err) {
                    thrownError = err
                    done()
                })
            })

            after(() => {
                http.request.restore()
            })

            it('should call the callback with the error', () => {
                expect(thrownError).to.equal(error)
            })
        })

        context('when there is an error parsing the response', () => {
            const malformedResponseBody = '<it><is><some>xml</some* 4$></is></it>'
            const testError = new Error('test error')
            let returnedError

            before((done) => {
                let opHelper = new OperationHelper({
                    awsId: 'testAwsId',
                    awsSecret: 'testAwsSecret',
                    assocId: 'testAssocId'
                })

                responseMock = new EventEmitter()
                responseMock.setEncoding = sinon.spy()

                requestMock = new EventEmitter()
                requestMock.end = () => {
                    responseMock.emit('data', malformedResponseBody)
                    responseMock.emit('end')
                }

                sinon.stub(http, 'request').returns(requestMock).callsArgWith(1, responseMock)
                sinon.stub(opHelper, 'generateUri').returns('testUri')
                sinon.stub(xml2js, 'parseString').callsArgWith(2, testError)

                opHelper.execute('ItemSearch', {
                    'SearchIndex': 'Books',
                    'Keywords': 'harry potter',
                    'ResponseGroup': 'ItemAttributes,Offers'
                }, function (err) {
                    returnedError = err
                    done()
                })
            })

            after(() => {
                http.request.restore()
                xml2js.parseString.restore()
            })

            it('should call the callback with the error', () => {
                expect(returnedError).to.equal(testError)
            })
        })
    })
})