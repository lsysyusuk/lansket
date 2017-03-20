import Vue from 'vue'
import App from './App'
import Appoint from './components/Appoint'
import Manage from './components/Manage'
import Order from './components/Order'
import MyOrders from './components/MyOrders'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'
import filters from './filters'
Object.keys(filters).forEach((k) => Vue.filter(k, filters[k]))

const FastClick = require('fastclick')
FastClick.attach(document.body)

Vue.use(VueResource)
Vue.use(VueRouter)
Vue.http.options.timeout = 10000;
Vue.http.options.emulateJSON = true;
Vue.http.interceptors.push(function (request, next) {
    let timeout;
    if (request.timeout) {
        timeout = setTimeout(function () {
            next(request.respondWith(request.body, {
                 status: 408,
                 statusText: '请求超时'
            }));
            
        }, request.timeout);
    }
    next(function (response) {
　　　　if (response.status == 408) {
        this.$root.loading = false;
        this.$root.$emit('doToast', '请求超时，请检查您的网络连接', 'warn')
      } else {
        clearTimeout(timeout)
      }
　　　　return response;
    })
})

const router = new VueRouter()

router.map({
  '/': {
    component: Appoint
  },
  '/manage': {
  	component: Manage
  },
  '/order/:code': {
  	name: 'order',
  	component: Order
  },
  '/my': {
    component: MyOrders
  }
})

router.start(App, '#app')

