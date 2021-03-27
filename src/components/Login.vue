<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区 -->
      <div class="avatar_box">
        <img src="../assets/login.png" alt="" />
      </div>
      <!-- 登陆表单区 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="LoginFormRlues" class="login_form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-touxiang"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input type="password" v-model="loginForm.password" prefix-icon="iconfont icon-suo" suffix-icon="iconfont icon-showpassword"></el-input>
        </el-form-item>
        <!-- 按钮区 -->
        <el-form-item class="btns">
            <el-button type="primary" @click="login" >登陆</el-button>
            <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    我是登录组件
  </div>
</template>

<script>
export default {
    data(){
        return {
        
          loginForm :{
              username : 'admin',
              password : '123456'
          },
        //   验证规则
          LoginFormRlues:{
              username: [
                  { required:true, message: "请输入登陆名称", trigger :"blur" },
                  { min:3 , max : 10, message: "长度在3到10个字符", trigger :"blur" }
              ],
              password: [
                  { required:true, message: "请输入登陆密码", trigger :"blur" },
                  { min:6, max : 16, message: "长度在6到16个字符", trigger :"blur" }
              ]
          }  
        }
    },
    methods:{
        // 重置表单
        resetLoginForm(){
            this.$refs.loginFormRef.resetFields()
        },
        // 校验表单 valid为结果
        login(){
            this.$refs.loginFormRef.validate(async valid =>{
                if(!valid) return;
                const {data : res} = await this.$http.post('login',this.loginForm)
                if(res.meta.status !== 200) return this.$message.error('登陆失败');
                this.$message.success('登陆成功')
                
                console.log(res);
                // 保存token值到客户端的sessionStorage
                window.sessionStorage.setItem('token',res.data.token)
                //  通过编程式导航跳转到后台主页，路由地址是 /home
                this.$router.push('/home')
            })
        }
    }
};
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: rgb(231, 231, 231);
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.avatar_box {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #eee;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #fff;
  }
}

.login_form
{
    position:absolute;
    bottom: 5px;
    width: 100%;
    padding:  0  20px;
    box-sizing: border-box;
}
.btns{
    display: flex;
    justify-content: flex-end;
}
</style>
