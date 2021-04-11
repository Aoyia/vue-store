<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getOrderList"
            class="input-with-select"
          >
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
        <!-- 裂变渲染 -->
        <el-table :data="orderList" stripe style="width: 100%" border stripe>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="order_number" label="订单编号"></el-table-column>
          <el-table-column prop="order_price" label="订单价格" width="100"></el-table-column>
          <el-table-column prop="order_pay" label="是否付款" width="100"></el-table-column>
          <el-table-column label="是否发货" width="100">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.is_send === 1" effect="dark" type="success">已支付</el-tag>
              <el-tag v-else type="warning">未支付</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="create_time" label="下单时间" width="180">
            <template slot-scope="scope">
              {{ scope.row.create_time | dateFormat }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <el-button
                type="primary"
                icon="el-icon-edit"
                @click="showEditDialog(scope.row)"
                size="mini"
              ></el-button>
              <el-tooltip effect="dark" content="物流进度" placement="top" :enterable="false">
                <el-button
                  type="primary"
                  icon="el-icon-location-information"
                  @click="showProgressBox(scope.row)"
                  size="mini"
                ></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
      <el-col :span="8"></el-col>

      <!-- 分页 -->
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
    </el-card>

    <!-- 修改地址的对话框   -->
    <el-dialog
      title="修改地址"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="省市区/县" prop="address1" label-width="100px">
          <el-cascader
            expandTrigger="hover"
            :options="cityData"
            v-model="editForm.address1"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2" label-width="100px">
          <el-input v-model="editForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流信息对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%"
      :before-close="handleClose"
    ></el-dialog>
  </div>
</template>

<script>
import cityData from '../../assets/citydata.js';
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 8,
      },
      orderList: [],
      total: 0,
      editDialogVisible: false,
      handleClose: false,
      editForm: {
        address1: [],
        address2: '',
      },
      editFormRules: [],
      cityData: cityData,
      progressVisible: false,
      progressInfo: []
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败');
      console.log(res);
      this.orderList = res.data.goods;
      this.total = res.data.total;
    },
    // 监听页码值 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    // 页面值变化 触发此事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      // 重置表单
      this.$refs.addFormRef.resetFields();
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
      this.getOrderList();
      this.editDialogVisible = false;
    },
    // 显示物流信息
    async showProgressBox() {
        const { data: res } = await this.$http.get('/kuaidi/itcast-g7kmck71vjaujfgoi');
      if (res.meta.status !== 200) return this.$message.error('获取物流信息失败');
      this.$message.error('获取物流信息成功')

      this.progressInfo = res.data
      this.progressVisible = true;

    },
  },
  computed: {},
};
</script>

<style lang="less" scoped></style>
