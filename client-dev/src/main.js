import Vue from 'vue'
import App from './App'
import Appoint from './components/Appoint'
import Manage from './components/Manage'
import Order from './components/Order'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'
import filters from './filters'
Object.keys(filters).forEach((k) => Vue.filter(k, filters[k]))

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
  },
  '/order': {
  	component: Order
  }
})

router.start(App, '#app')

