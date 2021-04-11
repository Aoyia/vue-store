<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色 -->
      <el-row :gutter="15">
        <!-- <el-col :span="8">
          <el-input
            placeholder="请输入..."
            v-model="rolesId"
            clearable
            @clear="getRolesList"
            class="input-with-select"
          >
            <el-button slot="append" icon="el-icon-search" @click="seachRolesList"></el-button>
          </el-input>
        </el-col> -->
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 添加角色的表单 -->
      <el-dialog title="提示" :visible.sync="addDialogVisible"  width="50%" :before-close="handleClose">
        <el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="100px">
          <el-form-item label="权限名称" prop="roleName" hide-required-asterisk>
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="权限描述" prop="roleDesc">
            <el-input type="textarea" v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addFormClose">取 消</el-button>
          <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class= "['bdbottom',index === 0? 'bdtop' : '','vcenter']" v-for="(item , index) in scope.row.children " :key="item.id">
              <el-col :span="3">
                <el-tag>{{item.authName}} </el-tag>
                <i class="el-icon-arrow-right"></i>
              </el-col>
              <el-col :span= "21">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row :class="[index2 === 0 ? '':'bdtop','vcenter']" v-for="(item2 , index2) in item.children" :key="item2.id">
                  <el-col :span="3">
                    <el-tag type="success">{{item2.authName}} </el-tag>
                    <i class="el-icon-arrow-right"></i>
                  </el-col>
                  <el-col :span="3" class="valign">
                    <el-tag closable @close="removeRightById(scope.row ,item3.id )" type="warning" v-for="(item3 , index3) in item2.children" :key="index3">{{item3.authName}} </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row >
          </template>
        </el-table-column>

        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" @click="removeRolesById(scope.row.id)" size="mini">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)" size="mini" >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限 -->
    <el-dialog
  title="提示"
  :visible.sync="setRightDialogVisible"
  width="50%"
  >
  <!-- 树形控件 -->
  <el-tree  ref="treeRef" show-checkbox default-expand-all :default-checked-keys ='defKeys'  :data="rightList" node-key="id" :props="treeProps" @node-click="handleNodeClick"></el-tree>

  <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      addDialogVisible: false,
      roleList: [],
      rolesId : '',
      addForm: {
        roleName: '',
        roleDesc: '',
      },
      // 控制分配权限的显示与隐藏
      setRightDialogVisible : false,
      // 所有权限的数据
      rightList: [],
      // 树形控件的属性绑定对象
      treeProps : {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的权限数组
      defKeys : [],
      // 当前分配角色权限的id
      roleId : '',
      // 验证规则
      rules: {
        roleName:[
           { required: true, message: '必填：请输入角色名', trigger: 'blur' },
          { min: 3, max: 10, message: '角色长度在3~10个字符', trigger: 'blur' }
        ],
        roleDesc : [
          { min: 8, max: 120, message: '用户名长度在8~120个字符', trigger: 'blur' }
        ]
      },
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //   获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles',{
        params : this.rolesId
      });
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败');
      this.roleList = res.data;
    },
    addFormClose () {
      this.addDialogVisible = false
      this.resetAddform()

    },
    resetAddform(){
      this.$refs.addFormRef.resetFields()
    },
     addRoles() {
      this.$refs.addFormRef.validate( async vali =>{
        if(!vali) return this.$message.error('验证失败请检查输入数据')
        // 通过验证发送请求
        const {data :res} = await this.$http.post('roles',this.addForm)
        if(res.meta.status !== 201 ) return this.$message.errror('创建失败')
        this.$message.success('创建成功')
        // 表单但收尾
        this.addFormClose()
        this.resetAddform()
        this.getRolesList()
      }) 
    },
    // 删除角色
    async removeRolesById(id) {
      const confirmResult =  await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch(err => err);
      if(confirmResult !== 'confirm'){
        return this.$message.error('已取消删除')
      }
      const {data : res} = await this.$http.delete('roles/'+id)
      if(res.meta.status !== 200 ) return this.$message.error(res.meta.msg)
      this.getRolesList()
      this.$message.success('删除成功')
    },
    async removeRightById( role ,rightId){
      const confirmResult =  await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if(confirmResult !== 'confirm') return this.$message.info(' 取消了删除')
        const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if(res.meta.status !== 200 ) return this.$message.error(res.meta.msg)
        // 
        role.children = res.data
        this.$message.success('权限删除成功')
    },
    // 展示分配权限的对话框
    async showSetRightDialog( role){
      this.roleId = role.id

      const { data: res } = await this.$http.get('rights/tree');
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败');
      this.rightList = res.data;

      // 递归 获取已有权限
      this.defKeys = []
      this.getLeafKeys(role ,this.defKeys)
      
      this.setRightDialogVisible = true

    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到defkeys 数组中
    getLeafKeys (node , arr ){
      if( !node.children){
        return arr.push(node.id)
      }
      node.children.forEach( item => {
        this.getLeafKeys(item , arr)
      });
    },
    // 点击为角色分配权限
    async allotRights (){
       const keys = [
         ...this.$refs.treeRef.getCheckedKeys(),
         ...this.$refs.treeRef.getHalfCheckedNodes()
       ]
       const idStr = keys.join(',')

       const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`,{
         rids : idStr
       });
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败');
    }
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin:7px;
  
}
.bdtop{
  border-top: 2px solid #eee;
}
.bdbottom {
  border-bottom: 2px solid #eee;
}
.vcenter{
  display: flex;
    align-items: center;
}
.valign{
  display: flex;
}
</style>></style>
