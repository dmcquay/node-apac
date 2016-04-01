"use strict"

const http = require('http')
const EventEmitter = require('events')
const xml2js = require('xml2js')

var OperationHelper = require('./OperationHelper').OperationHelper


describe('OperationHelper', function () {
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