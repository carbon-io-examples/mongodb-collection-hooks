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
    service: _o('../app.js'),
  
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
    suppressServiceLogging: true,

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
              phoneNumbers: {
                mobile: "415-555-5555"
              }
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
              phoneNumbers: {
                mobile: "415-555-5555"
              }
            }
          }
        },
        resSpec: {
          statusCode: 204
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
          statusCode: 204
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
