const express = require('express')
const MongoClient = require('mongodb').MongoClient
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const axios = require('axios')
const dotenv = require('dotenv').config()

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

app.get('/lastfm', async (req, res) => {

    let arr_rst = [];

    // get data from lastfm
    const rst_lastfm = await Lastfm.getContent()

    // add to satus array
    arr_rst.push({
        "success" : rst_lastfm.success,
        "msg"     : rst_lastfm.msg
    });

    // if we got data back from last fm 
    if( rst_lastfm.success ){
        // save data in the db
        var rst_db = await DB.save( 'test', rst_lastfm.data );
        // add to satus array
        arr_rst.push({
            "success" : rst_db.success,
            "msg"     : rst_db.msg
        });
    }

    // send the status array
    res.send( arr_rst );    
})

const port = process.env.PORT || 8081

app.listen( port, () => {
console.log('listening on ' + port )
})
