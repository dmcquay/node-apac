"use strict"

const path = require('path')

const OperationHelper = require('../../').OperationHelper

require('dotenv').config({
    silent: true,
    path: path.join(__dirname, '.env')
})

const e = process.env

let config = {
    AWS_ACCESS_KEY_ID: e.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: e.AWS_SECRET_ACCESS_KEY,
    AWS_ASSOCIATE_ID: e.AWS_ASSOCIATE_ID
}

describe('OperationHelper', () => {
    describe('execute a typical query', () => {
        let result

        before(() => {
            let opHelper = new OperationHelper({
                awsId: config.AWS_ACCESS_KEY_ID,
                awsSecret: config.AWS_SECRET_ACCESS_KEY,
                assocId: config.AWS_ASSOCIATE_ID
            })

            return opHelper.execute('ItemSearch', {
                'SearchIndex': 'Books',
                'Keywords': 'harry potter',
                'ResponseGroup': 'ItemAttributes,Offers'
            }).then((response) => {
                result = response.result
            })
        })

        it('returns a sane looking response', () => {
            expect(result.ItemSearchResponse).to.exist
            expect(result.ItemSearchResponse.Items.Item.length).to.be.at.least(1)
            expect(result.ItemSearchResponse.Items.Item[0].ItemAttributes.Author[0]).to.equal('J.K. Rowling')
        })
    })
})
