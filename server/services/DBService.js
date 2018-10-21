const axios       = require('axios')
const dotenv      = require('dotenv').config()
const MongoClient = require('mongodb').MongoClient

const db_un       = encodeURIComponent( process.env.DB_USERNAME );
const db_pwd      = encodeURIComponent( process.env.DB_PASSWORD );
const db_host     = process.env.DB_HOST
const db_database = process.env.DB_DATABASE
const db_url      = `mongodb://${db_un}:${db_pwd}@${db_host}/${db_database}`;

module.exports = {

    /***
     *    Saves supplied array of data to a given collection
     *    @param collection the collection to save the data to
     *    @param data an array of data items to save
     *
     * TODO: 
     *    1. refactor the connection part to make it reusable
    ***/

    async save( collection, data ) {

        // await the result of the promise, formatted in to nice objects
        const rst_save = await new Promise( ( resolve, reject ) => {

            // connect to the database
            MongoClient.connect( db_url, { useNewUrlParser: true }, (err, client) => {
                // if the connection failed, reject the promise with the error message
                if( err ){ 
                    reject( err.message );
                }

                // set the db to the given db
                db = client.db( process.env.DB_DATABASE )   

                // save the data
                db.collection( collection ).insertMany( data, (err, result) => {
                    // if the save failed
                    if( err ){
                        // reject the promise with the error message
                        reject( err.message );
                    }
                    // otherwise resolve the promise with the result
                    resolve( result );
                })

                // close the database connection
                client.close()
                    .then(
                        // success: do nothing
                        () => {},
                        // fail: log the error
                        ( error ) => {
                            console.log( 'failed to close db connection: ' + error.message );
                        }
                    )

            })

        // then is called on the promise when it is settled (ie resolved or rejected)
        }).then(

            // db save was successfull (promise was resolved)
            ( result ) => {
                return {
                    "success" : true,
                    "msg"     : 'Saved data to collection',
                    "data"    : result
                };
            },

            // db save failed (promise was rejected)
            ( error ) => {
                return {
                    "success" : false,
                    "msg"     : 'Failed to save data to collection',
                    "data"    : error
                };
            }

        )

        // return the formatted objects
        return rst_save;
    }
}
