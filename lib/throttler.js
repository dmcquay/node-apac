"use strict"

const getNowMillis = () => {
    return (new Date()).getTime()
}

class Throttler {
    constructor(maxRequestsPerSecond) {
        this.maxRequestsPerSecond = maxRequestsPerSecond || 0
        this._timeBetweenRequestsInMilliSeconds = 1 / this.maxRequestsPerSecond * 1000
        this._nextAvailableRequestMillis = getNowMillis()
    }
    
    execute(cb) {
        let nowMillis = getNowMillis()
        if (this.maxRequestsPerSecond === 0) {
            return Promise.resolve(cb())
        } else if (nowMillis >= this._nextAvailableRequestMillis) {
            this._nextAvailableRequestMillis = getNowMillis() + this._timeBetweenRequestsInMilliSeconds
            return Promise.resolve(cb())
        } else {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(cb())
                }, this._nextAvailableRequestMillis - nowMillis)
                this._nextAvailableRequestMillis += this._timeBetweenRequestsInMilliSeconds
            })
        }
    }
}

module.exports = Throttler