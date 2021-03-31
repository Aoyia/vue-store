<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
      <el-breadcrumb-item>活动详情</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区  -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="15">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
            class="input-with-select"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" stripe style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180"></el-table-column>
        <el-table-column prop="mobile" label="手机号码" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱地址"></el-table-column>
        <el-table-column prop="create_time" label="创建时间"></el-table-column>
        <el-table-column prop="role_name" label="用户权限"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            ></el-switch>
            <!-- {{scope.row}} -->
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row)"
              size="mini"
              circle
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="removeUserById(scope.row.id)"
              size="mini"
              circle
            ></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" circle></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <div class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 8]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>

      <!-- 添加用户的对话框       -->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
        :close-on-click-modal="false"
      >
        <!-- 内容主题区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password" type="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改用户的对话框   -->

      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        :before-close="handleClose"
        @close="editDialogClosed"
      >
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名称" label-width="100px">
            <el-input v-model="editForm.username" disabled="false"></el-input>
          </el-form-item>
          <el-form-item label="用户手机" prop="mobile" label-width="100px">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
          <el-form-item label="用户邮箱" prop="email" label-width="100px">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    const checkEmail = (rule, value, cb) => {
      const regEmail = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
      if (regEmail.test(value)) {
        // 合法的输入
        return cb();
      }
      cb(new Error('清输入合法的邮箱!'));
    };
    // 验证手机号的规则
    const checkMobile = (rule, value, cb) => {
      const regMobile = /^1(?:3\d|4[4-9]|5[0-35-9]|6[67]|7[013-8]|8\d|9\d)\d{8}$/;
      if (regMobile.test(value)) {
        // 合法的输入
        return cb();
      }
      cb(new Error('清输入合法的手机号!'));
    };

    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 8,
      },
      userList: [],
      total: 0,
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      // 添加用户表单的验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'change' },
          { min: 3, max: 10, message: '用户名长度在3~10个字符', trigger: 'change' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'change' },
          { min: 6, max: 16, message: '密码长度在6~16个字符', trigger: 'change' },
        ],
        email: [{ required: true, message: '请输入邮箱地址', trigger: 'change' }],
        mobile: [{ required: true, message: '请输入手机号码', trigger: 'change' }],
      },
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改对话框的数据
      editForm: {},
      // 修改对话框的验证规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败');
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    // 监听状态改变
    async userStateChanged(userinfo) {
      userinfo.id;
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`);
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error('更新用户状态失败');
      }
      return this.$message.success('更新用户状态成功');
    },
    // 监听页码值 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 页面值变化 触发此事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      // 重置表单
      this.$refs.addFormRef.resetFields();
    },
    // 点击按钮添加新用户
    addUser() {
      // 先是进行表单的预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        // 添加用户的请求
        const { data: res } = await this.$http.post('users', this.addForm);
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败');
        }
        this.getUserList();
        this.addDialogClosed();
        this.$message.success('添加用户成功');
      });
    },
    showEditDialog(data) {
      this.editForm = data;
      this.editDialogVisible = true;
    },
    editDialogVisible() {
      this.editDialogVisible = false;
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile,
        });
        if (res.meta.status !== 200) return this.$message.error('修改数据失败');
        this.$message.success('修改数据成功');
      });
      this.getUserList();
      this.editDialogVisible = false;
    },
    // 根据id删除用户
    async removeUserById(id) {
      const confirmResult =  await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch(err => err);
      if(confirmResult !== 'confirm'){
        return this.$message.error('已取消删除')
      }
      const {data : res} = await this.$http.delete('users/'+id)
      if(res.meta.status !== 200 ) return this.$message.error(res.meta.msg)
      this.getUserList()
      this.$message.success('删除成功')
    },
  },
};
</script>

<style lang="less" scoped></style>
