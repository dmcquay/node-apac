"use strict"

const Throttler = require('./throttler')

describe('Throttler', function () {
      describe('#constructor', () => {
        it('sets default max requests per second', () => {
            let throttler = new Throttler()
            expect(throttler.maxRequestsPerSecond).to.equal(0)
        })

        it('computes correct time between requests in milliseconds, defaults', () => {
            let throttler = new Throttler()
            expect(throttler._timeBetweenRequestsInMilliSeconds).to.equal(Infinity)
        })

        it('computes correct next available request time, defaults, -/+1 ms tolerance', () => {
            let throttler = new Throttler(0)
            let requestTime = (new Date()).getTime()

            expect(throttler._nextAvailableRequestMillis).to.be.within(requestTime-1, requestTime+1)
        })

        it('sets max requests per second - 10 req/s', () => {
            let throttler = new Throttler(10)
            expect(throttler.maxRequestsPerSecond).to.equal(10)
        })

        it('computes correct time between requests in milliseconds, 10 req/sec', () => {
            let throttler = new Throttler(10)
            expect(throttler._timeBetweenRequestsInMilliSeconds).to.equal(100)
        })

        it('computes correct next available request time, 10 req/sec, -/+1 ms tolerance', () => {
            let throttler = new Throttler(10)
            let requestTime = (new Date()).getTime()

            expect(throttler._nextAvailableRequestMillis).to.be.within(requestTime-1, requestTime+1)
        })
    })

    describe('#execute', () => {
      it('executes passed function immediately, -/+5 ms tolerance', () => {
        let throttler = new Throttler()
        let passedFunction = () => { return true }
        let startTime = (new Date()).getTime()
        let endTime

        return throttler.execute(passedFunction).then(function(result) {
          endTime = (new Date()).getTime()
    
          expect(result).to.equal(true)
          expect(endTime).to.be.within(startTime-5, startTime+5)
        })
      })

      it('executes multiple passed functions immediately, -/+5 ms tolerance', () => {
        let throttler = new Throttler()
        let passedFunction = () => { return true }
        let startTime = (new Date()).getTime()
        let endTime

        return Promise.all([
          throttler.execute(passedFunction),
          throttler.execute(passedFunction),
        ]).then(function(result) {
          endTime = (new Date()).getTime()

          expect(result).to.deep.equal([true, true])
          expect(endTime).to.be.within(startTime-5, startTime+5)
        })
      })

      it('executes passed function with empty queue, -/+5 ms tolerance', () => {
        let throttler = new Throttler(1)
        let passedFunction = () => { return true }
        let startTime = (new Date()).getTime()
        let endTime

        return throttler.execute(passedFunction).then(function(result) {
          endTime = (new Date()).getTime()

          expect(result).to.equal(true)
          expect(endTime).to.be.within(startTime-5, startTime+5)
        })
      })

      it('executes passed function with one request in queue, -/+5 ms tolerance', () => {
        let throttler = new Throttler(10)
        let passedFunction = () => { return true }
        let startTime = (new Date()).getTime()
        let endTime

        return Promise.all([
          throttler.execute(passedFunction),
          throttler.execute(passedFunction),
        ]).then(function(result) {
          endTime = (new Date()).getTime()

          expect(result).to.deep.equal([true, true])
          expect(endTime).to.be.within(startTime+(100-5), startTime+(100+5))
        })
      })

      it('executes passed function with multiple requests in queue, -/+5 ms tolerance', () => {
        let throttler = new Throttler(10)
        let passedFunction = () => { return true }
        let startTime = (new Date()).getTime()
        let endTime

        return Promise.all([
          throttler.execute(passedFunction),
          throttler.execute(passedFunction),
          throttler.execute(passedFunction),
        ]).then(function(result) {
          endTime = (new Date()).getTime()

          expect(result).to.deep.equal([true, true, true])
          expect(endTime).to.be.within(startTime+(200-5), startTime+(200+5))
        })
      })
    })

    describe('#getQueueSize', () => {
      it('returns -1 when throttler is disabled', () => {
        let throttler = new Throttler()
        
        expect(throttler.getQueueSize()).to.equal(-1)
      })

      it('returns 0 when queue is empty, nothing executing', () => {
        let throttler = new Throttler(1)
        
        expect(throttler.getQueueSize()).to.equal(0)
      })

      it('returns 0 when queue is empty, executing function', () => {
        let throttler = new Throttler(1)
        let wait = function(ms){
          var start = new Date().getTime();
          var end = start;
          while(end < start + ms) {
            end = new Date().getTime();
          }
        }
        let passedFunction = () => { wait(500); return true }
        
        throttler.execute(passedFunction)

        expect(throttler.getQueueSize()).to.equal(0)
      })

      it('returns 1 when queue is loaded with 1 request', () => {
        let throttler = new Throttler(1)
        let wait = function(ms){
          var start = new Date().getTime();
          var end = start;
          while(end < start + ms) {
            end = new Date().getTime();
          }
        }
        let passedFunction = () => { wait(500); return true }
        
        throttler.execute(passedFunction)
        throttler.execute(passedFunction)

        expect(throttler.getQueueSize()).to.equal(1)
      })
    })
});