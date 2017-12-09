const carbon = require('carbon-io')
const HttpErrors = carbon.HttpErrors
const _o  = carbon.bond._o(module)
const o   = carbon.atom.o(module)

const MongoDBCollection = carbon.carbond.mongodb.MongoDBCollection

module.exports = o({

  /*****************************************************************************
   * _type
   */
  _type: MongoDBCollection,

  /*****************************************************************************
   * collection
   *
   * The name of the MongoDB collection storing Contacts.
   */
  collection: 'contacts',

  /*****************************************************************************
   * enabled
   */
  enabled: {
    find: true,
    insertObject: true,
    saveObject: true,
    findObject: true,
    removeObject: true,
  },

  /*****************************************************************************
   * schema
   *
   * Schema for the API interface to Contacts. Notice this is not the same as the db schema.
   */
  schema: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      _createdAt: { type: 'string' },
      _updatedAt: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string', format: 'email' },
      phoneMobile: { type: 'string' },
      phoneWork: { type: 'string' }
    },
    required: [ '_id', 'firstName' ],
    additionalProperties: false
  },

  /*****************************************************************************
   * idGenerator
   */
  idGenerator: o({
    _type: carbon.carbond.ObjectIdGenerator,
    generateStrings: true
  }),

  /*****************************************************************************
   * findConfig
   */
  findConfig: {
    parameters: {
      $merge: {
        query: {
          schema: {type: 'string'},
          location: 'query',
          required: false,
          default: undefined
        }
      }
    }
  },
  

  /*****************************************************************************
   * preFind
   *
   * Supports an optional query. Returns the entire set of matching contacts as an array. 
   */
  preFind: function(options) {
    if (options.query !== undefined) {
      options.query = {
        $or: [
          {firstName: options.query},
          {lastName: options.query},
          {email: options.query}
        ]
      }
    }
    // This overrides any sort that the user may submit
    options.sort = {firstName: 1}
  },
  
  /*****************************************************************************
   * postFind
   *
   */
  postFind: function(results, options) {
    results.forEach(result => {
      delete result.email
    })
    return results
  },
  
  
  /*****************************************************************************
   * preInsertObject
   *
   */
  preInsertObject: function(object, options) {
    //debugger
    object._createdAt = Date()
    return { object, options }
  },
  
  /*****************************************************************************
   * postInsertObject
   *
   */
  postInsertObject: function(result, objects, options) {
    delete result.email
    return result
  },
  
  
  /*****************************************************************************
   * preSaveObject
   *
   */
  preSaveObjectOperation: function(config, req, res) {
    this.getService().logInfo(req.headers)
    config.requestTimestamp = req.timestamp
    
    let options = MongoDBCollection.prototype.preSaveObjectOperation.call(this, config, req, res)
    return options
  },
  
  /*****************************************************************************
   * preSaveObject
   *
   */
  preSaveObject: function(object, options) {
    options.lastUpdatedTime = object._updatedAt
    object._updatedAt = Date()
    return { object, options }
  },
  
  /*****************************************************************************
   * postSaveObject
   *
   */
  postSaveObject: function(result, object, options) {
    result.lastUpdatedTime = options.lastUpdatedTime
    return result
  },
  
  /*****************************************************************************
   * preSaveObject
   *
   */
  postSaveObjectOperation: function(result, config, req, res) {
    res.header('X-Last-Update-Time', result.lastUpdatedTime)
    delete result.lastUpdatedTime
    
    result = MongoDBCollection.prototype.postSaveObjectOperation.call(this, result, config, req, res)
    return result
  }
  
})
