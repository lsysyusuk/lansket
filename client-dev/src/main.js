import Vue from 'vue'
import App from './App'
import Appoint from './components/Appoint'
import Manage from './components/Manage'
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
    component: Appoint
  },
  '/manage': {
  	component: Manage
  }
})

router.start(App, '#app')

