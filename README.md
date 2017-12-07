# Simple Contact Service Example

[![Build Status](https://img.shields.io/travis/carbon-io-examples/contacts-service-simple/master.svg?style=flat-square)](https://travis-ci.org/carbon-io-examples/contacts-service-simple) ![Carbon Version](https://img.shields.io/badge/carbon--io-0.7-blue.svg?style=flat-square)

This example walks you through the process of creating a simple RESTful API with Carbon.io. Developers new to Carbon.io should start here as we will introduce different Carbon.io concepts along the way.

This example is Part 1 in a four-part series. You can find the subsequent series parts in the table below:

| Series Parts |
|---|
| __Part 1:__ __Building a REST API with Carbon.io__ |
| __Part 2:__ [Building a React App with a Carbon.io API](https://github.com/carbon-io-examples/react-contacts-simple) |
| __Part 3:__ Securing Carbon.io APIs (Coming Soon) |
| __Part 4:__ User Login and Routing with React (Coming Soon) |

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Project structure and setup](#project-structure-and-setup)
- [Create the Contact Service (REST API)](#create-the-contacts-service)
- [Define the Contacts Endpoint](#define-the-contacts-endpoint)
- [Run the Contacts Service](#run-the-contacts-service)
- [Create tests for the Contacts Service](#create-tests-for-the-contacts-service)
- [Genereate documentation](#generate-documentation)
- [Recap](#recap)
- [Next steps](#next-steps)

## Introduction

We will create a RESTful API that allows for basic CRUD operations on a contact list. The API will support two [Endpoints](https://docs.carbon.io/en/latest/packages/carbond/docs/guide/endpoints.html) (or URIs) and some HTTP [Operations](https://docs.carbon.io/en/latest/packages/carbond/docs/guide/operations.html):

Endpoint 1: /contacts
* GET - get all contacts
* POST - create a new contact

Sub-endpoint 1: /contacts/:contact
* GET - get one contact by ID
* PUT - update a contact by ID
* DELETE - delete a contact by ID

## Prerequisites

You will need to install the following software before starting this tutorial:

* [Node.js](https://nodejs.org/en/download/)
* [MongoDB](https://www.mongodb.com/download-center#community)

This example uses MongoDB as the underlying database technology, however with some work you can also modify the example to use any database technology.

## Project structure and setup

Carbon.io projects often follow this directory and file structure:

* lib/ - source code for the project
* test/ - test code for the project
* docs/ - documentation for the project
* package.json - project metadata and dependency list

To bootstrap the project, we'll follow the structure outlined above for our local development environment. Create the directories and copy the `package.json` file from the project repository:

```sh
$ mkdir lib test docs
$ curl https://raw.githubusercontent.com/carbon-io-examples/contacts-service-simple/master/package.json > package.json
```

Next, we'll install the project's dependencies. To install, run the following:

```sh
$ npm install
```

## Create the Contacts Service (REST API)

A Carbon.io Service is an HTTP server that exposes a JSON REST API. Services are defined as a tree of Endpoints (distinct URIs) - in this case, our Contacts Service is made up of the "/contacts" Endpoint and "/contacts/:contact" sub-endpoint.

Create the `lib/ContactService.js` file with the following code. We have provided the command to copy the file as well.

```sh
$ curl https://raw.githubusercontent.com/carbon-io-examples/contacts-service-simple/master/lib/ContactService.js > lib/ContactService.js
```

```javascript
const carbon = require('carbon-io')
const __  = carbon.fibers.__(module)
const _o  = carbon.bond._o(module)
const o   = carbon.atom.o(module).main // Note the .main here since this is the main application 

__(function() {
  module.exports = o({

    /**********************************************************************
     * _type
     */
    _type: carbon.carbond.Service,
    
    /**********************************************************************
     * description
     */        
    description: "A public API for managing Contacts",

    /**********************************************************************
     * environmentVariables
     */
    environmentVariables: {
      DB_URI: {
        help: "URI for the MongoDB database to connect to. Defaults to 'mongodb://localhost:27017/contacts'",
        required: false
      },
    },
    
    /**********************************************************************
     * port
     */
    port: 9900,
    
    /**********************************************************************
     * dbUri
     */
    dbUri: _o('env:DB_URI') || 'mongodb://localhost:27017/contacts',

    /**********************************************************************
     * endpoints
     *
     * The URL structure for this API will be:
     *
     * /contacts
     * /contacts/:contact
     *
     */
    endpoints : {
      contacts: _o('./ContactsEndpoint')
    }
  })
})
```

There's quite a bit of code above, so we'll break it down by section.

### Preamble

Carbon.io is built on several core infrastructure components, three of which are introduced in the preamble. We will cover each component briefly and talk more about each component when it's relevant. If you'd like an in-depth exploration on these components, you can visit the Carbon.io documentation on [Application structure](https://docs.carbon.io/en/latest/packages/carbond/docs/guide/application-structure.html).

[Fibers](https://docs.carbon.io/en/latest/packages/carbon-core/docs/packages/fibers/docs/guide/index.html) - "__" function - a wrapper for the [Node Fibers](https://github.com/laverdet/node-fibers) library, which manages the complexity of Node.js concurrency under the hood. Fibers allow you to write code that is logically synchronous.

[Bond](https://docs.carbon.io/en/latest/packages/carbon-core/docs/packages/bond/docs/index.html) - "_o" function -  the universal name resolver component for Carbon.io. Bond allows for objects to be resolved from names in a variety of namespaces.

[Atom](https://docs.carbon.io/en/latest/packages/carbon-core/docs/packages/atom/docs/index.html) - "o" function - the universal object factory, used to instantiate objects and to create components. Components are simply objects bound in the Node.js module namespace via module.exports.

Following the preamble, we define the different properties of the Contacts Service. Notice that Carbon.io favors a declarative programming style that allows users to specify "what, not how".

### Environment variables

A list of process environment variables that the Contacts Service supports. We configure one variable `DB_URI`, which contains the value of our [MongoDB connection string URI](https://docs.mongodb.com/manual/reference/connection-string/). 

### Port

The port number that the Contacts Service listens on.

### Database URI

The database URI to connect to at Service startup. We use the Bond operator to resolve the "DB_URI" variable value.

### Endpoints

The list of Endpoints that make up the Service. Both the "/contacts" Endpoint and "/contacts/:contact" sub-endpoint are defined in the `lib/ContactsEndpoint.js` file that we create in the next step. We use the Bond operator to resolve the ContactsEndpoint file location.

## Define the Contacts Endpoint

With our Service set up, we'll now define the "/contacts" Endpoint and "/contacts/:contact" sub-endpoint. Each Endpoint can support any of the following HTTP operations: GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS.

Create the `lib/ContactsEndpoint.js` file and copy the code:

```sh
curl https://raw.githubusercontent.com/carbon-io-examples/contact-service-simple/master/lib/ContactsEndpoint.js > lib/ContactsEndpoint.js
```

```javascript
const carbon = require('carbon-io')
const HttpErrors = carbon.HttpErrors
const _o  = carbon.bond._o(module)
const o   = carbon.atom.o(module)

module.exports = o({

  /****************************************************************************************************************
   * _type
   */
  _type: carbon.carbond.mongodb.MongoDBCollection,

  /****************************************************************************************************************
   * collection
   *
   * The name of the MongoDB collection storing Contacts.
   */
  collection: 'contacts',

  /****************************************************************************************************************
   * enabled
   */
  enabled: {
    insert: false,       // We do not support bulk inserts to this collection
    find: true,
    save: false,         // We do not support bulk replace of this collection
    update: false,       // We do not support bulk updates to this collection
    remove: false,       // We do not support bulk removes to this collection
    insertObject: true,
    saveObject: true,
    findObject: true,
    updateObject: false, // We do not allow for updates, only saving back the whole object.
    removeObject: true,
  },

  /****************************************************************************************************************
   * schema
   *
   * Schema for the API interface to Contacts. Notice this is not the same as the db schema.
   */
  schema: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string', format: 'email' },
      phoneMobile: { type: 'string' },
      phoneWork: { type: 'string' }
    },
    required: [ '_id', 'firstName' ],
    additionalProperties: false
  },

  /****************************************************************************************************************
   * idGenerator
   */
  idGenerator: o({
    _type: carbon.carbond.ObjectIdGenerator,
    generateStrings: true
  }),

  /****************************************************************************************************************
   * insertObjectConfig
   */
  insertObjectConfig: {
    returnsInsertedObject: true
  },

  /*****************************************************************************
   * findConfig
   */
  findConfig: {
    supportsQuery: true,
    supportsPagination: false,
    queryParameter: {
      query: {
        schema: {type: 'string'},
        location: 'query',
        required: false,
        default: undefined
      }
    }
  },

  /*****************************************************************************
   * preFind
   *
   * Supports an optional query. Returns the entire set of matching contacts as an array. No pagination is used,
   * as this dataset should be relatively small.
   */
  preFind: function(options) {
    if (options.query !== undefined) {
      options.query = {
        $or: [
          {firstName: options.query},
          {lastName: options.query},
          {email: options.query}
        ],
        user: options.user
      }
    }
    // This overrides any sort that the user may submit
    options.sort = {firstName: 1}
  },

  /*****************************************************************************
   * saveObjectConfig
   */
  saveObjectConfig: {
    // We do not want clients to be able to create new contacts this way. We want to be in control
    // of the _id values.
    supportsInsert: false
  }

})
```

### MongoDBCollection 

To help us implement the Endpoints we will use the Carbon.io [MongoDBCollection](https://docs.carbon.io/en/master/packages/carbond/docs/guide/collections.html#mongodbcollection) class, which extends the Collection class. Both classes provide a high-level abstraction for defining Endpoints that behave like a RESTful collection of resources. When you define a Collection you may define the following methods:

* insert(obj, reqCtx)
* find(query, reqCtx)
* update(query, update, reqCtx)
* remove(query, reqCtx)
* saveObject(obj, reqCtx)
* findObject(id, reqCtx)
* updateObject(id, update, reqCtx)
* removeObject(id, reqCtx)

Which results in the following tree of Endpoints and Operations:

* /<collection>
  * POST which maps to insert
  * GET which maps to find
  * PATCH which maps to update
  * DELETE which maps to remove
* /<collection>/:_id
  * PUT which maps to saveObject
  * GET which maps to findObject
  * PATCH which maps to updateObject
  * DELETE which maps to removeObject

### Enabled operations

Recall that our Contacts Service will support the following Operations:

Endpoint 1: /contacts

* GET - get all contacts
* POST - create a new contact

Sub-endpoint 1: /contacts/:contact

* GET - get one contact by ID
* PUT - update a contact by ID
* DELETE - delete a contact by ID

So, we will specify the MongoDBCollection operations we want to support under the "enabled" property by flagging them as `true`:

* find
* insertObject
* findObject
* saveObject
* removeObject

### Schema and id

Collections also allow you to define a schema. This is not a database schema, but rather the schema that the Service will validate against whenever data is sent to or from the Endpoint. The default Carbon.io schema for resources requires an "_id" field, which is also the default id field for MongoDB. Instead of generating our own ids, we'll use the built-in Carbon.io [ObjectIdGenerator](https://docs.carbon.io/en/master/packages/carbond/docs/ref/carbond.ObjectIdGenerator.html) which will automatically generate and append an [ObjectId](https://docs.mongodb.com/manual/reference/method/ObjectId/) string whenever our Service inserts into the database.

### Operation configuration

You can configure each operation using the config property for that operation (e.g. insertObjectConfig for the insertObject operation). For the `insertObject` operation we configure the [returnsInsertedObject](https://docs.carbon.io/en/master/packages/carbond/docs/ref/carbond.collections.InsertObjectConfig.html) property to be true, which ensures that the HTTP layer returns (via HTTP response) the object that was inserted. See more about [operation configuration](https://docs.carbon.io/en/latest/packages/carbond/docs/guide/collections.html) in the documentation.

### Operation hooks

For the `find` operation we have configured a `preFind` hook, which has the following signature:

`pre<OPERATION NAME>Operation(config, req, res)`

In this case, the pre operation hook changes the behavior of the Collection `find` operation to query for first name, last name, or email. The hook builds the `options` parameter based on the incoming request and config for the operation (in this case the find config). As such, the return value for this method should be the initialized `operations` parameter that will be passed on to the handler. See more about [operation hooks](https://docs.carbon.io/en/latest/packages/carbond/docs/guide/collections.html) in the documentation.

## Run the Contacts Service

Now that our example is complete, we can run the Contacts Service and see it in action. To run the example:

```sh
node lib/ContactService.js
```

Some example commands:

```sh
curl localhost:9900/contacts -H "Content-Type: application/json" -d '{"firstName": "Alan", "lastName": "Turing"}'

curl localhost:9900/contacts
```

## Create tests for the Contacts Service
Carbon.io comes with a testing framework called [Test-Tube](https://github.com/carbon-io/test-tube). Test-Tube is a generic unit testing framework that comes as part of the Carbon Core.

Create the `test/ContactServiceTest.js` file and copy the code:

```sh
curl https://raw.githubusercontent.com/carbon-io-guides/example__simple-rest-service/master/test/ContactServiceTest.js > test/ContactServiceTest.js
```

```javascript
var assert = require('assert')
var carbon = require('carbon-io')
var o      = carbon.atom.o(module)
var _o     = carbon.bond._o(module)
var __     = carbon.fibers.__(module)


/***************************************************************************************************
 * Test
 */
__(function() {
  module.exports = o.main({

    /***************************************************************************
     * _type
     */
    _type: carbon.carbond.test.ServiceTest,

    /***************************************************************************
     * name
     */
    name: "ContactServiceTests",

    /***************************************************************************
     * service
     */
    service: _o('../lib/ContactService.js'),

    /***************************************************************************
     * setup
     */
    setup: function() {
      carbon.carbond.test.ServiceTest.prototype.setup.call(this)
      this.service.db.command({dropDatabase: 1})
    },

    /***************************************************************************
     * teardown
     */
    teardown: function() {
      this.service.db.command({dropDatabase: 1})
      carbon.carbond.test.ServiceTest.prototype.teardown.call(this)
    },

    /***************************************************************************
     * suppressServiceLogging
     */
    suppressServiceLogging: false,

    /***************************************************************************
     * tests
     */
    tests: [

      /*************************************************************************
       * POST /contacts
       *
       * Test adding a new contact.
       */
      {
        name: "POST /contacts",
        reqSpec: function(context) {
          return {
            url: `/contacts`,
            method: "POST",
            body: {
              firstName: "Mary",
              lastName: "Smith",
              email: "mary@smith.com",
              phoneMobile: "415-555-5555"
            }
          }
        },
        resSpec: {
          statusCode: 201
        }
      },

      /*************************************************************************
       * GET /contacts?query=mary@smith.com
       *
       * Test finding the previously added contact by email.
       */
      {
        name: "GET /contacts?query=mary@smith.com",
        reqSpec: function(context) {
          return {
            url: `/contacts`,
            method: "GET",
            parameters: {
              query: "mary@smith.com"
            }
          }
        },
        resSpec: {
          statusCode: 200,
        }
      },

      /*************************************************************************
       * GET /contacts/:_id
       *
       * Test finding the previously added contact by _id.
       */
      {
        name: "GET /contacts/:_id",
        reqSpec: function(context) {
          return {
            url: context.httpHistory.getRes(-2).headers.location,
            method: "GET"
          }
        },
        resSpec: function(response, context) {
          var previousResponse = context.httpHistory.getRes(-1)
          assert.deepEqual(response.body, previousResponse.body[0])
        }
      },

      /*************************************************************************
       * PUT /contacts/:_id
       *
       * Test saving changes to the contact via PUT. Here we are saving back the
       * entire object.
       */
      {
        name: "PUT /contacts/:_id",
        reqSpec: function(context) {
          return {
            url: context.httpHistory.getRes(-3).headers.location,
            method: "PUT",
            body: {
              _id: context.httpHistory.getRes(-1).body._id,
              firstName: "Mary",
              lastName: "Smith",
              email: "mary.smith@gmail.com", // We are changing email
              phoneMobile: "415-555-5555"
            }
          }
        },
        resSpec: {
          statusCode: 200
        }
      },

      /*************************************************************************
       * DELETE /contacts/:_id
       *
       * Test removing the contact.
       */
      {
        name: "DELETE /contacts/:_id",
        reqSpec: function(context) {
          return {
            url: context.httpHistory.getRes(-4).headers.location,
            method: "DELETE"
          }
        },
        resSpec: {
          statusCode: 200
        }
      },

      /*************************************************************************
       * DELETE /contacts/:_id
       *
       * Test that the contact is gone.
       */
      {
        name: "DELETE /contacts/:_id",
        reqSpec: function(context) {
          return {
            url: context.httpHistory.getRes(-5).headers.location,
            method: "DELETE"
          }
        },
        resSpec: {
          statusCode: 404 // We should get 404 since this contact is already removed.
        }
      },
    ]
  })
})
```

The [ServiceTest](https://docs.carbon.io/en/master/packages/carbond/docs/ref/carbond.test.ServiceTest.html) class is an extension of [Test Tube](https://docs.carbon.io/en/master/packages/carbon-core/docs/packages/test-tube/docs/guide/index.html)’s `HttpTest` class that you can use to write declarative HTTP-based unit tests.

Each test consists of a request (reqSpec) and response (resSpec) spec. The reqSpec has only one required property `method`, which should be an HTTP verb (e.g. GET, PUT, POST, etc.). You may optionally specify: query parameters with the `parameters` property, headers with the `headers` property, and a body with the `body` property.

A `resSpec` can be an `Object`, `Function`, or an `Object` whose properties are `Functions`. It can be configured to either expect a `statusCode` or compare the value of each property for a returned `Object`.

One neat Test Tube feature to highlight is the httpHistory property - it records all previously executed request/response pairs for a HttpTest. In some of our tests above we use the httpHistory getRes() method to retrieve a previous response and use it to create a new test request.

To run the test:

```sh
node lib/ContactServiceTest.js
```

We'll receive the following test report:

```
Test Report
[*] Test: ContactServiceTests (432ms)
  [*] Test: POST /contacts (280ms)
  [*] Test: GET /contacts?query=mary@smith.com (36ms)
  [*] Test: GET /contacts/:_id (33ms)
  [*] Test: PUT /contacts/:_id (29ms)
  [*] Test: DELETE /contacts/:_id (35ms)
  [*] Test: DELETE /contacts/:_id (19ms)
```

## Generate documentation

Carbon.io Services are also capable of generating their own documentation. There are currently two flavors users can choose from: Github Flavored Markdown and static HTML with aglio. For this example we are going to use [aglio](https://github.com/danielgtaylor/aglio). Note: the installation may take a couple of minutes.

```sh
npm install aglio --no-optional
```

Once aglio is installed, you can generate the docs with the following command:

```sh
node lib/ContactService gen-static-docs --flavor aglio --out docs/index.html
```

You can view the docs in the generated [docs/index.html file](http://htmlpreview.github.io/?https://raw.githubusercontent.com/carbon-io-examples/contacts-service-simple/master/docs/index.html).

## Recap

Congrats! You've created a simple Carbon.io Service. We'll do a quick recap to cover all the work you've done:

* Created a Contact Service consisting of the "/contacts" Endpoint and "/contact/:contact" sub-endpoint
* Learned about core infrastructure components:
  * Fibers - coroutine library that enables synchronous coding in an asynchronous environment
  * Atom - universal object factory used to instantiate objects and to create components- objects bound in the Node.js module namespace via module.exports
  * Bond - universal name resolver
* Implemented HTTP Operations for both Endpoints using Leafnode - a synchronous MongoDB driver that wraps the Node Native driver.
* Created a test suite using Test Tube
* Generated static HTML documentation using aglio

## Next steps

If you're looking for a next step in furthering your knowledge on Carbon.io, check out our examples: https://docs.carbon.io/en/master/examples.html.

If you'd like to learn how to create a React front-end for the Contacts Service, check out Part 2 of our blog series: https://github.com/carbon-io-examples/react-contacts-simple.
