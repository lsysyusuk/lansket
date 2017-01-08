import Vue from 'vue'
import App from './App'
import Home from './components/HelloFromVux'
// import Home from './components/Hello'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'

const FastClick = require('fastclick')
FastClick.attach(document.body)

Vue.use(VueResource)
Vue.use(VueRouter)

Vue.http.options.emulateJSON = true;

const router = new VueRouter()

router.map({
  '/': {
    component: Home
  }
})

router.start(App, '#app')

