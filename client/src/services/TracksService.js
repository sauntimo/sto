const axios = require('axios')

export default {
    getTracks () {
        return axios.get( 'http://tsvm:8081/lastfm' );
    }
}
