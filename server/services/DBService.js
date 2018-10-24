const axios       = require('axios')
const dotenv      = require('dotenv').config()
const MongoClient = require('mongodb').MongoClient

const db_un       = encodeURIComponent( process.env.DB_USERNAME );
const db_pwd      = encodeURIComponent( process.env.DB_PASSWORD );
const db_host     = process.env.DB_HOST
const db_database = process.env.DB_DATABASE
const db_url      = `mongodb://${db_un}:${db_pwd}@${db_host}/${db_database}`;


/***
  *  @hint local (non-exposed) function to connect to the db
  *  @return promise with formatted response and client object or error
***/   

async function connect(){

    return new Promise( ( resolve, reject ) => {
        
        // connect to the database
        MongoClient.connect( db_url, { useNewUrlParser: true }, ( error, client ) => {
            // if the connection failed, reject the promise with the error message
            if( error ){ 
                reject( error.message );
            }

            // resolve with the client object
            resolve( client );
        })

    }).then(
        // promise resolved
        ( client ) => {
            return {
                "success" : true,
                "msg"     : 'Successfully connected to the db',
                "data"    : [ client ]
            };
        },
        // promise rejected
        ( error ) => {
            return {
                "success" : false,
                "msg"     : 'Failed to connected to the db: ' + error,
                "data"    : []
            };
        }
    )
}

// to avoid repeating lots of boilerplate db code, it tuns out we can 
// just keep a small struct of action functions and use the one 
// we're interested in at the time.
const skv_actions = {
    "find" : function( collection, callback, data ){
        collection.find().toArray( callback )
    },
    "insertMany" : function( collection, callback, data ){
        collection.insertMany( data, callback )
    },
    "drop" : function( collection, callback, data ){
        collection.drop( callback );
    },
    "deleteMany" : function( collection, callback, data ){
        collection.deleteMany( data, callback )
    }
}

// define these in the global scope to use them outside the function in return messages
let _COLLECTION = ''
let _ACTION = ''

module.exports = {

    /***
     *    Saves supplied array of data to a given collection
     *    @param collection the collection to save the data to
     *    @param data an array of data items to save
     *
     * TODO: 
     *    1. refactor the connection part to make it reusable
    ***/

    async action( collection_name, action, payload ){

        _COLLECTION = collection_name;
        _ACTION = action;

        // await the result of the promise, formatted in to nice objects
        const rst_save = await new Promise( async ( resolve, reject ) => {

            let rst_connect = await connect();

            // if we failed to connect to the db, reject the save promise            
            if( !rst_connect.success ){
                reject( rst_connect.msg );
            } 

            // if we did connect, get the db client object which was  returned
            const db_client = rst_connect.data[0];

            // get the appropriate database
            const db = db_client.db( process.env.DB_DATABASE );
            const collection = db.collection( collection_name );

            const callback = ( error, result ) => {
                // if the save failed
                if( error ){
                    // reject the promise with the error message
                    reject( error.message );
                }
                // otherwise resolve the promise with the result
                resolve( result );
            }

            // get the action function from a struct of actions
            // and call it with three args
            skv_actions[ action ]( collection, callback, payload );

            // close the database connection
            db_client.close()
                .then(
                    // success: do nothing
                    () => {},
                    // fail: log the error
                    ( error ) => {
                        console.log( 'failed to close db connection: ' + error.message );
                    }
                )

        // then is called on the promise when it is settled (ie resolved or rejected)
        }).then(

            // db save was successfull (promise was resolved)
            ( result ) => {
                return {
                    "success" : true,
                    "msg"     : 'Success. Collection: ' + _COLLECTION + ' action: ' + _ACTION,
                    "data"    : [ result ]
                };
            },

            // db save failed (promise was rejected)
            ( error ) => {
                return {
                    "success" : false,
                    "msg"     : 'Failed: Promise rejection. Collection: ' + _COLLECTION + ' action: ' + _ACTION + ' error: ' + error,
                    "data"    : []
                };
            }

        ).catch(

            ( error ) => {
                return {
                    "success" : false,
                    "msg"     : 'Failed: caught unhandled error. Collection: ' + _COLLECTION + ' action: ' + _ACTION + ' error: ' + error,
                    "data"    : []
                };
            }

        )

        // return the formatted objects
        return rst_save;
    }
}
