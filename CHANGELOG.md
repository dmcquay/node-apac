## 3.0.2

- Mindor documentation updates
- Update dependencies

## 3.0.0

This is only a major version bump because we are not longer returning promises when using the
callback interface.

- Allow overriding the http request scheme (see https://github.com/dmcquay/node-apac/pull/75)
- When providing a callback, a promise will no longer be returned. You must pick one or the other.
  The purpose of this is to avoid unhandle rejection warnings.
- Upgrade `xml2js` from `0.4.16` to `0.4.17`

## 2.0.2

- Document locales

## 2.0.1

- Fix throttle mechanism

## 2.0.0

NOTE: In v2.0.0, we changed the default for xml2js to set explicitArray to false. Before v.2.0.0, you would get a
response like this instead (note the extra arrays you have to drill into):

```javascript
{
    ItemSearchResponse: {
        OperationRequest: [ [Object] ],
        Items: [ [Object] ]
    }
}
```

You can change back to the old behavior by setting explitArray to true like this:

```javascript
var opHelper = new OperationHelper({
    awsId:     '[YOUR AWS ID HERE]',
    awsSecret: '[YOUR AWS SECRET HERE]',
    assocId:   '[YOUR ASSOCIATE TAG HERE]',
    xml2jsOptions: { explicitArray: true }
});
```

# 1.0.0

- Errors are now returned as the first parameter of the callback function, instead of being processed by a seperate OnError function.

## 0.0.3 - 0.0.14

- Changes were not documented, refer to GitHub commits.

## 0.0.2

- Added parsing of XML results using xml2js. Thanks pierrel.

## 0.0.1

- Initial release
