


<template>
    <div class="tracks">
        <h1>Tracks</h1>
        <p>The last 100 tracks I listend to on last.fm</p>
        <div v-for="track in tracks" :key="track.uts">
            <a :href="track.data.url" target="_blank">
                <span class="track-card">
                    <artist :name="track.data.artist['#text']"></artist> -
                    <trackname :trackname="track.data.name"></trackname>
                </span>
            </a>
        </div>
    </div>
</template>

<script>

import TracksService from '@/services/TracksService'

const artist = {
    props: [ 'name' ],
    template: `<span><b>{{name}}</b></span>`
}

const trackname = {
    props: [ 'trackname' ],
    template: `<span>{{trackname}}</span>`
}


export default {
    name: 'tracks',
    components: {
        "trackname" : trackname,
        "artist"    : artist
    },
    data () {
        return {
            tracks: []
        }
    },
    mounted () {
        this.getTracks()
    },
    methods: {
        async getTracks () {
            const response = await TracksService.getTracks()
            
            console.log( response );
            this.tracks = response.data.data[0];
        }
    }
}
</script>


<style scoped>
    
    .track-card {
        float: left;
        margin: 5px;
        padding: 5px;
        border-radius: 4px;
        border: 1px solid #999;
        background-color: #ddd;
        cursor: pointer;
        color: #111;
    }

    .track-card:hover {
        color: #111;
        background-color: #ccc;
    }

</style>