import Vue from 'vue';
import App from './App.vue';

import router from './router/index.js';

//导入全局样式表
import './assets/css/global.css';
// 导入字体图标
import './assets/fonts/iconfont.css';

import axios from 'axios';
// 配置请求的根路径
// axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 设置为网络api
// axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
axios.defaults.baseURL = 'http://www.ysqorz.top:8888/api/private/v1/';
// 重置 http://www.ysqorz.top:8091/vueshop/reset
axios.interceptors.request.use(config => {
  // 未请求头对象，添加'token'验证的 Authorization 字段
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
});

Vue.prototype.$http = axios;

// element UI
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

// 树形表
import TreeTable from 'vue-table-with-tree-grid';
Vue.component('tree-table', TreeTable);

// 富文本组件
import VueQuillEditor from 'vue-quill-editor'
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
Vue.use(VueQuillEditor)


Vue.config.productionTip = false;

Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal);

  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1 + '').padStart(2, '0');
  const d = (dt.getDate() + '').padStart(2, '0');

  const hh = (dt.getHours() + '').padStart(2, '0');
  const mm = (dt.getMinutes() + '').padStart(2, '0');
  const ss = (dt.getSeconds() + '').padStart(2, '0');

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
});

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
