const axios = require('axios')
const dotenv = require('dotenv').config()

module.exports = {

    /***
     *    Gets recently played tracks from Last.fm api for given user
     *
     *    TODO: 
     *      1. put social url / feed information in to a database
     *      2. save the min and max uts of content retrieved, 
     * 	       only get content newer/older to prevent duplication 
    ***/

    async getContent() {

        // define parts of Last.fm API url
        const base_url = 'http://ws.audioscrobbler.com/2.0/';
        const method   = '?method=user.getrecenttracks';
        const user     = `&user=${process.env.LASTFM_USERNAME}`;
        const api_key  = `&api_key=${process.env.LASTFM_API_KEY}`;
        const format   = '&format=json';

        // concat parts into usable url string
        const lastfm_api_url = base_url + method + user + api_key + format;

        // make api call        
        const response = await axios.get( lastfm_api_url )

        // if that returned successfully
        if( response.status === 200 ){

            // refactor the data in to an array and return it
            const arr_tracks = response.data.recenttracks.track.map( function( item ){
                return {
                  "source" : 'lastfm',
                  "uts"    : item.date.uts,
                  "data"   : item
                };
            });

            // return the data
            return {
                "success" : true,
                "msg"     : 'Retrieved recent tracks from Last.fm',
                "data"    : arr_tracks
            }
        }

        // if the API call faield, return failed
        if( response.status !== 200 ){
            return {
                "success" : false,
                "msg"     : 'Faield to retrieve tracks from Last.fm',
                "data"    : [ response.status ]
            }
        }
    }
}
