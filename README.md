# MongoDBCollection Hooks

[![Build Status](https://img.shields.io/travis/carbon-io-examples/mongodb-collection-hooks/master.svg?style=flat-square)](https://travis-ci.org/carbon-io-examples/mongodb-collection-hooks) ![Carbon Version](https://img.shields.io/badge/carbon--io-0.7-blue.svg?style=flat-square)


This example illustrates how to use pre and post handler hooks in `MongoDBCollection`. If you want to add functionality to operation handlers (such as `insert` or `findObject`), you should not override those methods. Instead, implement the pre or post hooks to add extra functionality.

Each handler has a pre and post hook. They are named `pre<HandlerName>` and `post<HandlerName>`. For example, the hooks for `findObject` are `preFindObject` and `postFindObject`.

You can use these hooks to run code before or after handlers, to modify the arguments sent to the handlers, or to modify the results returned from the handlers before they are sent in the HTTP response.

For example, if you wanted to add a `_createdAt` field to every document inserted into the database, you could define this `preInsertObject` hook on the `MongoDBCollection`:

```js
preInsertObject: function(object, options) {
  object._createdAt = Date()
  return { object, options }
}
```

If you wanted to remove the `email` field from each document after a `find`, you could define this `postFind` hook:

```js
postFind: function(results, options) {
  results.forEach(result => {
    delete result.email
  })
  return results
}
```

Pre hooks take the same arguments as the handlers themselves. So `updateObject(id, update, options)` and `preUpdateObject(id, update, options)` have the same arguments signature. `preUpdateObject` returns an object with all the arguments that will be sent to `updateObject`. It looks like:

```js
{
  id: ...,
  update: ...,
  options: ...
}
```

Post hooks take the same arguments as the handlers themselves except their first argument is a `result` object. So the signature is `postUpdateObject(result, id, update, options)`. Post hooks just have to return a `result` object.

## Pre and Post Operation Hooks (Advanced)

Most functionality can be added by implementing pre and post hooks. However in some cases you'll need access to the request and response objects. In this case, you'll need to override the pre and post _Operation_ hooks. They are named `pre<HandlerName>Operation` and `post<HandlerName>Operation`. For example, the hooks for `findObject` are `preFindObjectOperation` and `postFindObjectOperation`.

The signatures for the pre and post operation hooks are:

- `pre<HandlerName>Operation(config, req, res) -> options`
- `post<HandlerName>Operation(result, config, req, res) -> result`

The order of methods is:

1. `pre<HandlerName>Operation`
2. `pre<HandlerName>`
3. `<HandlerName>`
4. `post<HandlerName>`
5. `post<HandlerName>Operation`

Say you wanted to log the request headers for every request to `saveObject`. You could implement the following `preSaveObjectOperation` method:

```js
preSaveObjectOperation: function(config, req, res) {
  this.getService().logInfo(req.headers)
  
  let options = MongoDBCollection.prototype.preSaveObjectOperation.call(this, config, req, res)
  return options
}
```

Note that you should always call the superclass' `preSaveObjectOperation` to take advantage of the built-in method for generating options.

Say you wanted to send a custom header with the response from `saveObject`. You could implement this `postSaveObjectOperation` method:

```js
postSaveObjectOperation: function(result, config, req, res) {
  res.header('X-Service-Name', 'My Service Name')
  
  result = MongoDBCollection.prototype.postSaveObjectOperation.call(this, result, config, req, res)
  return result
}
```

Note again that we call the superclass' `postSaveObjectOperation` to generate the `result` object.

**You can view a `MongoDBCollection` with examples of pre/post hooks in [`lib/ContactsEndpoint.js`](lib/ContactsEndpoint.js). You can also read more in the [documentation](https://docs.carbon.io/en/master/packages/carbond/docs/guide/collections/collection-operation-hooks.html).**

## Installing the service

We encourage you to clone the git repository so you can play around
with the code.

```
$ git clone git@github.com:carbon-io-examples/mongodb-collection-hooks.git
$ cd mongodb-collection-hooks
$ npm install
```

## Setting up your environment

This example expects a running MongoDB database. The code will honor a `DB_URI` environment variable. The default URI is
`mongodb://localhost:27017/contacts`.

To set the environment variable to point the app at a database different from the default (on Mac):
```
$ export DB_URI=mongodb://localhost:27017/mydb
```

## Running the service

To run the service:

```sh
$ node lib/ContactService
```

For cmdline help:

```sh
$ node lib/ContactService -h
```

## Accessing the service

You can interact with the service via HTTP. Here is an example using curl to create a new user:

```
$ curl localhost:9900/contacts -H "Content-Type: application/json" -d '{"firstName": "Ada", "email": "foo@bar.com"}'
```

## Running the unit tests

This example comes with a simple unit test written in Carbon.io's test framework called TestTube. It is located in the `test` directory.

```
$ node test/ContactServiceTest
```

or

```
$ npm test
```

## Generating API documentation (aglio flavor)

To generate documentation using aglio, install it as a devDependency:

```
$ npm install -D --no-optional aglio
```

Using `--no-optional` speeds up aglio's install time significantly. Then generate the docs using this command:

```sh
$ node lib/ContactService gen-static-docs --flavor aglio --out docs/index.html
```

* [View current documentation](
http://htmlpreview.github.io/?https://raw.githubusercontent.com/carbon-io-examples/mongodb-collection-hooks/blob/carbon-0.7/docs/index.html)
