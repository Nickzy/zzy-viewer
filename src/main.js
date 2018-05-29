import Vue from 'vue'
import App from './App.vue'
import viewer from './lib/index.js'

Vue.use(viewer)
console.log(viewer)
new Vue({
  el: '#app',
  render: h => h(App)
})
