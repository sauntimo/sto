const express = require('express')
const MongoClient = require('mongodb').MongoClient
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const axios = require('axios')
const dotenv = require('dotenv').config()
const util = require('util')

if( dotenv.error ){
    console.log( dotenv.error );
}

const Lastfm = require( '../services/LastfmService' )
const DB = require( '../services/DBService' )

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cors())


app.get( '/', ( req, res ) => {
    res.send( 'this is the homepage' );
})

/***
  *     @hint synchronously loops over an array of actions 
  *           which each require an aync function call
  *     @param array arr_actions, array of structs of actions
  *     @return array arr_rst, array of structs of outcomes of actions
 ***/

async function processArrayOfActions( arr_actions ){

    let arr_rst = [];
    let skv_data = {};

    // loop over the list of actions and process them
    for( const skv_action of arr_actions ){

        // get array of arguments
        let arr_arguments = skv_action.args;

        if( 
            // if we need data from a previous action
            skv_action.hasOwnProperty( 'previous_data' ) &&
            // and we've got the data
            skv_data.hasOwnProperty( skv_action.previous_data )
        ){
            // get that data and add it to the arguments
            arr_arguments.push( skv_data[ skv_action.previous_data ] );
        }

        // make the async call this action requires, 
        // with the array of arguments we built
        let rst_action = await skv_action.fn.apply( null, arr_arguments )

        // store the result data in a struct for ease of access
        skv_data[ skv_action.name ] = rst_action.data

        // build a return item 
        var skv_return = {
            "success" : rst_action.success,
            "msg"     : rst_action.msg
        };

        // if we've been told to also return the data
        if( 
            skv_action.hasOwnProperty( 'return_data' ) &&
            skv_action.return_data
        ){
            // add it to the item
            skv_return.data = rst_action.data
        }
        
        // add the return item to the array 
        arr_rst.push( skv_return )
        
    }

    // return the result array
    return arr_rst;

}


app.get('/lastfm', async (req, res) => {

    // this array describes a list of actions with async function calls
    var arr_actions = [
        {
            "name"          : 'getLastfmTracks',
            "fn"            : Lastfm.getContent,
            "args"          : [ 'usertracks', {"limit":100} ] 
        },
        {
            "name"          : 'db_clear',
            "fn"            : DB.action,
            "args"          : [ 'activity', 'deleteMany', {} ] 
        },
        {
            "name"          : 'db_insert',
            "fn"            : DB.action,
            "args"          : [ 'activity', 'insertMany' ],
            "previous_data" : "getLastfmTracks"
        },
        {
            "name"          : 'db_find',
            "fn"            : DB.action,
            "args"          : [ 'activity', 'find', {"source":"lastfm"} ],
            "return_data"   : true
        }
    ]

    let arr_rst = await processArrayOfActions( arr_actions );

    // send the status array
    res.send( arr_rst[3] );    
})

const port = process.env.PORT || 8081

app.listen( port, () => {
console.log('listening on ' + port )
})
