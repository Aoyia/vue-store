<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/login.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px': '200px'">
          <div class="toggle_button" @click="toggleCollapse">
              <i class="el-icon-s-fold"></i>
          </div>
        <el-menu
          class="el-menu-vertical-demo"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#03A0D6"
          unique-opened="true"
          :collapse ="isCollapse"
          :collapse-transition = "false"
          router
          :default-active="this.$route.path"
          
        >
        <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="(item,index) in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[index]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index= " '/' + subItem.path " v-for="subItem in item.children" :key="subItem.id">
               <template slot="title">
              <i class="el-icon-menu"></i>
              <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧边内容主体 -->
      <el-main>
          <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menuList: [],
      iconsObj:[
          'iconfont icon-shuangren',
          'iconfont icon-tijikongjian',
          'iconfont icon-shangpin',
          'iconfont icon-danju-tianchong',
          'iconfont icon-baobiao',
      ],
      isCollapse: false
    };
  },
  created() {
    this.getMenuList();
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push('/login');
    },
    // 获取所有的菜单
    async getMenuList() {
      const {data:res} = await this.$http.get('menus');
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menuList = res.data;
    },
    // 折叠与展开
    toggleCollapse(){
        this.isCollapse = !this.isCollapse
    }
  }
};
</script>

<style long="less" scoped>
.home-container {
  height: 100%;
}
.toggle_button i{
    color: #fff;
    font-size: 26px;
    display: block;
    text-align: center;
    font-weight:100;
}
.el-header {
  background-color: #333744;
  color: #fff;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  font-size: 20px;
}
.el-header div {
  display: flex;
  align-items: center;
}
.el-header img {
  height: 50px;
  width: 53px;
  padding: 8px 10px 0 8px;
  border-radius: 100%;
}

.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #FFFFFF;
}
</style>
