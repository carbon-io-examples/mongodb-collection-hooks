var carbon = require('carbon-io')
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
      contacts: _o('./ContactsEndpoint')
    }
  })
})