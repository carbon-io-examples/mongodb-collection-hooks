var carbon = require('carbon-io')
var HttpErrors = carbon.HttpErrors
var __  = carbon.fibers.__(module)
var _o  = carbon.bond._o(module)
var o   = carbon.atom.o(module).main // Note the .main here since this is the main application 

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
      contacts: o({

        /****************************************************************************************************************
         * _type
         */
        _type: carbon.carbond.collections.Collection,

        /****************************************************************************************************************
         * enabled
         */
        enabled: {
          insert: true,
          find: true,
          update: false,       // We do not support bulk updates to this collection
          remove: false,       // We do not support bulk removes to this collection
          saveObject: true,
          findObject: true,
          updateObject: false, // We do not allow for updates, only saving back the whole object.
          removeObject: true,
        },

        /****************************************************************************************************************
         * collection
         *
         * The name of the MongoDB collection storing Contacts.
         */
        collection: 'contacts',

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
         * insertConfig
         */
        insertConfig: {
          returnsInsertedObject: true
        },
        
        /****************************************************************************************************************
         * insert
         */
        insert: function(obj, reqCtx) {
          var result = this.getCollection().insertObject(obj)
          return this._publicView(result)
        },

        /****************************************************************************************************************
         * findConfig
         */
        findConfig: {
          supportsQuery: true,
          querySchema: {
            type: 'string', // Allows for ?query=<string> which will search for a match in firstName, lastName, and email.
          }
        },

        /****************************************************************************************************************
         * find
         *
         * Supports an optional query. Returns the entire set of matching contacts as an array. No pagination is used,
         * as this dataset should be relatively small.
         */
        find: function(query, reqCtx) {
          var self = this

          var result = []
          if (query) {
            result = this.getCollection()
              .find({ $or: [
                { firstName: query }, 
                { lastName: query },
                { email: query }
              ]})
              .sort({ firstName: 1 })
              .toArray()
          } else {
            result = this.getCollection().find({}).sort({ firstName: 1 }).toArray()
          }

          result = result.map(function(contact) {
            return self._publicView(contact)
          })

          return result
        },

        /****************************************************************************************************************
         * saveObject
         */
        saveObject: function(obj, reqCtx) {
          // Be careful not to call save() or saveObject() on the database collection here. Those methods allow
          // for upsert which we do not want since we do not want clients to be able to create new contacts this
          // way. We want to be in control of the _id values.
          try {
            return this.getCollection().updateObject(obj._id, obj)
          } catch (e) {
            throw new HttpErrors.NotFound(obj._id) 
          }
        },

        /****************************************************************************************************************
         * findObject
         */
        findObject: function(id) {
          var result = this.getCollection().findOne({ _id: id })
          return this._publicView(result)
        },

        /****************************************************************************************************************
         * removeObject
         */
        removeObject: function(id) {
          try {
            return this.getCollection().removeObject(id)
          } catch (e) {
            throw new HttpErrors.NotFound(id) 
          }
        },

        /****************************************************************************************************************
         * getCollection
         */
        getCollection: function() {
          return this.service.db.getCollection(this.collection)
        },

        /****************************************************************************************************************
         * _publicView
         */
        _publicView: function(obj) {
          var result = {
            _id: obj._id,
            phoneNumbers: obj.phoneNumbers || {}
          }

          if (obj.firstName) {
            result.firstName = obj.firstName
          }

          if (obj.lastName) {
            result.lastName = obj.lastName
          }

          if (obj.email) {
            result.email = obj.email
          }

          return result
        }

      })
    }
  })
})