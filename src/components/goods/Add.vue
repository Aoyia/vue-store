<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="消息提示的文案" type="info" center show-icon :closable="false"></el-alert>

      <!-- 步骤条区域 -->
      <el-steps :active="activeIndex - 0" finish-status="success" simple style="margin-top: 20px">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图平"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          @tab-click="TabClick"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>

            <el-form-item label="商品分类" prop="">
              <!--    级联选择器 -->
              <span class="demonstration">hover 触发子菜单</span>
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                expand-trigger="hover"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  size="small"
                  v-for="(item2, index2) in item.attr_vals"
                  :label="item2"
                  :key="index2"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 渲染表单的Item项 -->
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input border size="small" v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图平" name="3">
            <!-- 图片上传 -->
            <!-- action 图片要上传到后台的api 地址 -->
            <!-- on-preview  点击图片预览的时候触发的事件-->
            <!-- 这玩意居然用的是自己封装的 ajax 没有走 axios -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>

            <!-- 添加商品的按钮 -->
            <el-button type="primary" @click="add" class="btnAdd">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  data() {
    return {
      // 默认标签页面
      activeIndex: 0,
      //添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        //商品的详情描述
        goods_introduce: '',
        attrs: [],
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ],
        goods_price: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品的重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品的数量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }],
      },
      //   商品分类列表
      cateList: [],
      //   配置项
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
      },
      //动态参数列表数据
      manyTableData: [],
      // 静态参数的列表数据
      onlyTableData: [],
      // 上传图片的url地址
      uploadURL: 'http://www.ysqorz.top:8888/api/private/v1/upload',
      // 图片上传组建的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      previewPath: 'http://www.ysqorz.top:8888/api/private/v1/',
      // 控制图片预览的显示与隐藏
      previewVisible: false,
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //   获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories');
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败');
      this.cateList = res.data;
      this.$message.success('获取商品分类数据成功');
    },
    //级联选择器选中变化会触发这个函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        // 不是三级 清空数组
        this.addForm.goods_cat = [];
      }
    },
    // 切换tab 标签
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类');
        return false;
      }
    },
    //
    async TabClick() {
      // console.log(this.activeIndex);
      // 访问的是动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId - 0}/attributes`, {
          params: {
            sel: 'many',
          },
        });
        console.log(res, 'res');
        res.data.forEach(e => {
          e.attr_vals = e.attr_vals.length === 0 ? [] : e.attr_vals.split(',');
        });
        this.manyTableData = res.data;
      } else if (this.activeIndex === '2') {
        // 访问的是动态参数面板
        const { data: res } = await this.$http.get(`categories/${this.cateId - 0}/attributes`, {
          params: {
            sel: 'only',
          },
        });
        res.data.forEach(e => {
          e.attr_vals = e.attr_vals.length === 0 ? [] : e.attr_vals.split(',');
        });
        this.onlyTableData = res.data;
      }
    },
    // 点击图片预览的时候触发的事件
    handlePreview(file) {
      this.previewPath += file.response.data.tmp_path;
      // 显示无效token
      todo: this.previewVisible = true;
    },
    // 移除图片的时候触发的事件
    handleRemove(file) {
      const filePath = file.response.data.tmp_path;

      const i = this.addForm.pics.findIndex(x => {
        x.pic === filePath;
      });
      this.addForm.pics.splice(i, 1);
    },
    // 监听图片上传成功触发该函数
    handleSuccess(response) {
      // 1. 拼接一个图片对象的信息
      const picInfo = { pic: response.data.tmp_path };
      // 2. 将图片信息对象，push到pics数组中
      this.addForm.pics.push(picInfo);
    },
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项');
        }
        // 执行添加的业务逻辑
        // 对addForm 进行深拷贝，得到一个用于发送给服务器数据 postAddForm
        // 这里要是用一个包lodash 里面有cloneDeep(obj)
        const form = _.cloneDeep(this.addForm);
        form.goods_cat = form.goods_cat.join(',');

        // 动态参数的处理
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' '),
          };
          form.attrs.push(newInfo);
        });
        // 静态参数的处理
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };
          form.attrs.push(newInfo);
        });

        // 发起请求
        const { data: res } = await this.$http.post('goods', form);
        if (res.meta.status !== 201) return this.$message.error('添加商品失败');
        console.log(res);
        this.$message.success(res.meta.msg);
        // todo:这里必须一步一步来啊，不能跳过
        this.$router.push('/goods')
      });
    },
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.btnAdd {
  margin-top: 15px;
}
</style>
