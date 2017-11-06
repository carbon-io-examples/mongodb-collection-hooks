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
