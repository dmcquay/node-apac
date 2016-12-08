"use strict"

const http = require('http')
const EventEmitter = require('events')
const xml2js = require('xml2js')
const proxyquire = require('proxyquire')
const RSH = require('./request-signature-helper').RequestSignatureHelper

const OperationHelper = require('./operation-helper').OperationHelper
const locale = require('./locale')

const getNowMillis = () => {
    return (new Date()).getTime()
}

describe('OperationHelper', function () {
    const awsId = 'testAwsId'
    const awsSecret = 'testAwsSecret'
    const assocId = 'testAssocId'

    let baseParams = {
        awsId,
        awsSecret,
        assocId
    }

    describe('#constructor', () => {
        it('sets correct default endpoint', () => {
            let opHelper = new OperationHelper(baseParams)
            expect(opHelper.endPoint).to.equal('webservices.amazon.com')
        })

        it('sets endpoint by locale', () => {
            let opHelper = new OperationHelper(Object.assign({}, baseParams, {
                locale: 'IT'
            }))
            expect(opHelper.endPoint).to.equal('webservices.amazon.it')
        })

        it('sets endpoint directly', () => {
            let opHelper = new OperationHelper(Object.assign({}, baseParams, {
                locale: 'IT',
                endPoint: 'test.endpoint.com'
            }))
            expect(opHelper.endPoint).to.equal('test.endpoint.com')
        })

        it('sets scheme directly', () => {
            let opHelper = new OperationHelper(Object.assign({}, baseParams, {
                scheme: 'http'
            }))
            expect(opHelper.scheme).to.equal('http')
        })
    })

    describe('#getSignatureHelper', () => {
        const mockRSHInstance = {}
        let mockRSHConstructor
        let OperationHelper2, initialSignatureHelper, secondSignatureHelper

        before(() => {
            mockRSHConstructor = sinon.stub().returns(mockRSHInstance)
            mockRSHConstructor.kAWSAccessKeyId = RSH.kAWSAccessKeyId
            mockRSHConstructor.kAWSSecretKey = RSH.kAWSSecretKey
            mockRSHConstructor.kEndPoint = RSH.kEndPoint

            OperationHelper2 = proxyquire('./operation-helper', {
                './request-signature-helper': {
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
                [RSH.kEndPoint]: locale.DEFAULT_ENDPOINT
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
        let requestMock, responseMock, result, outputResponseBody
        const responseBody = '<it><is><some>xml</some></is></it>'
        const xml2jsOptions = {foo: 'bar'}
        const expectedXml2jsOptions = Object.assign({explicitArray: false}, xml2jsOptions)

        context('happy path', () => {
            let opHelper

            beforeEach(() => {
                opHelper = new OperationHelper({
                    awsId: 'testAwsId',
                    awsSecret: 'testAwsSecret',
                    assocId: 'testAssocId',
                    scheme: 'http',
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
            })

            afterEach(() => {
                http.request.restore()
                xml2js.parseString.restore()
            })

            const doAssertions = () => {
                it('should creqte an http request with the correct options', () => {
                    expect(http.request.callCount).to.equal(1)
                    expect(http.request.firstCall.args[0]).to.eql({
                        hostname: locale.DEFAULT_ENDPOINT,
                        method: 'GET',
                        path: 'testUri',
                        scheme: 'http'
                    })
                })

                it('should set the response encoding to utf8', () => {
                    expect(responseMock.setEncoding.calledWith('utf8'))
                })

                it('should provide the raw response body', () => {
                    expect(outputResponseBody).to.equal(responseBody)
                })

                it('should pass the xml2jsOptions to xml2js', () => {
                    expect(xml2js.parseString.firstCall.args[1]).to.eql(expectedXml2jsOptions)
                })

                it('should parse XML and return result as object', () => {
                    expect(result).to.eql({
                        it: {
                            is: {
                                some: 'xml'
                            }
                        }
                    })
                })
            }

            context('(traditional callback)', () => {
                beforeEach((done) => {
                    opHelper.execute('ItemSearch', {
                        'SearchIndex': 'Books',
                        'Keywords': 'harry potter',
                        'ResponseGroup': 'ItemAttributes,Offers'
                    }, function (err, _results, _rawResponseBody) {
                        result = _results
                        outputResponseBody = _rawResponseBody
                        done()
                    })
                })

                doAssertions()
            })

            context('(promise)', () => {
                beforeEach(() => {
                    return opHelper.execute('ItemSearch', {
                        'SearchIndex': 'Books',
                        'Keywords': 'harry potter',
                        'ResponseGroup': 'ItemAttributes,Offers'
                    }).then((response) => {
                        result = response.result
                        outputResponseBody = response.responseBody
                    })
                })

                doAssertions()
            })
        })

        context('when the request has an error', () => {
            const error = new Error('testErrorMessage')
            let thrownError, opHelper

            beforeEach(() => {
                opHelper = new OperationHelper({
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
            })

            afterEach(() => {
                http.request.restore()
            })

            context('(traditional callback)', () => {
                beforeEach((done) => {
                    opHelper.execute('ItemSearch', {
                        'SearchIndex': 'Books',
                        'Keywords': 'harry potter',
                        'ResponseGroup': 'ItemAttributes,Offers'
                    }, function (err) {
                        thrownError = err
                        done()
                    })
                })

                it('should call the callback with the error', () => {
                    expect(thrownError).to.equal(error)
                })
            })

            context('(promise)', () => {
                beforeEach(() => {
                    return opHelper.execute('ItemSearch', {
                        'SearchIndex': 'Books',
                        'Keywords': 'harry potter',
                        'ResponseGroup': 'ItemAttributes,Offers'
                    }).catch((err) => {
                        thrownError = err
                    })
                })

                it('should call the callback with the error', () => {
                    expect(thrownError).to.equal(error)
                })
            })
        })

        context('when there is an error parsing the response', () => {
            const malformedResponseBody = '<it><is><some>xml</some* 4$></is></it>'
            const testError = new Error('test error')
            let returnedError, opHelper

            beforeEach(() => {
                opHelper = new OperationHelper({
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
            })

            afterEach(() => {
                http.request.restore()
                xml2js.parseString.restore()
            })

            context('(traditional callback)', () => {
                beforeEach((done) => {
                    opHelper.execute('ItemSearch', {
                        'SearchIndex': 'Books',
                        'Keywords': 'harry potter',
                        'ResponseGroup': 'ItemAttributes,Offers'
                    }, function (err) {
                        returnedError = err
                        done()
                    })
                })

                it('should call the callback with the error', () => {
                    expect(returnedError).to.equal(testError)
                })
            })

            context('(promise)', () => {
                beforeEach(() => {
                    return opHelper.execute('ItemSearch', {
                        'SearchIndex': 'Books',
                        'Keywords': 'harry potter',
                        'ResponseGroup': 'ItemAttributes,Offers'
                    }).catch((err) => {
                        returnedError = err
                    })
                })

                it('should call the callback with the error', () => {
                    expect(returnedError).to.equal(testError)
                })
            })
        })

        context('when throttling is necessary', () => {
            let opHelper, startTimeMillis

            beforeEach(() => {
                opHelper = new OperationHelper(Object.assign({}, baseParams, {
                    maxRequestsPerSecond: 10
                }))

                const buildReqAndResp = () => {
                    let responseMock = new EventEmitter()
                    responseMock.setEncoding = sinon.spy()

                    let requestMock = new EventEmitter()
                    requestMock.end = () => {
                        responseMock.emit('data', responseBody)
                        responseMock.emit('end')
                    }

                    return {
                        req: requestMock,
                        res: responseMock
                    }
                }

                sinon.stub(http, 'request')
                const reqRes1 = buildReqAndResp()
                const reqRes2 = buildReqAndResp()
                const reqRes3 = buildReqAndResp()
                http.request.onFirstCall().callsArgWith(1, reqRes1.res).returns(reqRes1.req)
                http.request.onSecondCall().callsArgWith(1, reqRes2.res).returns(reqRes2.req)
                http.request.onThirdCall().callsArgWith(1, reqRes3.res).returns(reqRes3.req)

                sinon.stub(opHelper, 'generateUri').returns('testUri')

                const operation = 'ItemSearch'
                const params = {
                    'SearchIndex': 'Books',
                    'Keywords': 'harry potter',
                    'ResponseGroup': 'ItemAttributes,Offers'
                }

                startTimeMillis = getNowMillis()
                return Promise.all([
                    opHelper.execute(operation, params),
                    opHelper.execute(operation, params),
                    opHelper.execute(operation, params)
                ])
            })

            afterEach(() => {
                http.request.restore()
            })

            it('should take at least (1 / maxRequestsPerSecond) * (numOperations - 1) seconds to complete', () => {
                const durationMillis = getNowMillis() - startTimeMillis
                expect(durationMillis).to.be.at.least(199)
                expect(durationMillis).to.be.at.most(300)
            })
        })
    })
})
