"use strict"

const util = require('util')
const OperationHelper = require('../lib/apac').OperationHelper

let opHelper = new OperationHelper({
    awsId: '[YOUR AWS ID HERE]',
    awsSecret: '[YOUR AWS SECRET HERE]',
    assocId: '[YOUR ASSOCIATE TAG HERE]'
})

const operation = 'ItemSearch'
const params = {
    'SearchIndex': 'Books',
    'Keywords': 'harry potter',
    'ResponseGroup': 'ItemAttributes,Offers'
}

opHelper.execute(operation, params).then((results, responseBody) => {
    console.log(results)
    console.log(responseBody)
}).catch((err) => {
    console.error(err)
})

// or if you have async/await support...

try {
    let response = await
    opHelper.execute(operation, params)
    console.log(response.results)
    console.log(response.responseBody)
} catch(err) {
    console.error(err)
}

// traditional callback style is also supported for backwards compatibility

opHelper.execute('ItemSearch', {
    'SearchIndex': 'Books',
    'Keywords': 'harry potter',
    'ResponseGroup': 'ItemAttributes,Offers'
}, function (err, results) {
    console.log(results)
})