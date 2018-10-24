import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/HelloWorld'
import Posts from '@/components/Posts'
import Tracks from '@/components/Tracks'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Hello',
            component: Hello
        },
        {
            path: '/posts',
            name: 'Posts',
            component: Posts
        },
        {
            path: '/tracks',
            name: 'Tracks',
            component: Tracks
        }
    ]
})
