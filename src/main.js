import Vue from 'vue'
import App from './App.vue'

import router from './router/index.js';

//导入全局样式表 
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

import axios from 'axios'
// 配置请求的根路径
// axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 设置为网络api
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'

Vue.prototype.$http = axios

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

Vue.config.productionTip = false


new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
