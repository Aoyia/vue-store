import Vue from 'vue';
import Router from 'vue-router';

import Login from '../components/Login.vue';
import Home from '../components/Home.vue';
import Welcome from '../components/Welcome.vue';
import User from '../components/user/user.vue';
import Rights from '../components/power/Rights.vue';
import Roles from '../components/power/Roles.vue';
import Cate from '../components/goods/Cate.vue';
import Params from '../components/goods/Params.vue';
Vue.use(Router);

const router = new Router({
  routes: [
    { path: '/', component: Login },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect:'/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: User },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params }
      ],
    }
  ]
});

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来的
  // next 是一个函数表示放行
  if (to.path === '/login') return next();

  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) return next('/login');
  next();
});

export default router;
