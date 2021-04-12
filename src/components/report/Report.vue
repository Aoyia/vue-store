<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区  -->
    <el-card>
      <!-- 为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="main" style="width: 800px;height:480px;"></div>
    </el-card>
  </div>
</template>

<script>
// import echarts from 'echarts';

import _ from 'lodash'
export default {
  data() {
    return {
        // 需要合并的数据
      options: {
        title: {
          text: '用户来源',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3',
            },
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            boundaryGap: false,
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
      },
    };
  },
  //   渲染之前调用的狗子函数
  created() {},

  //   渲染页面之后的狗子函数
  async mounted() {
    // 基于准备好的dom，初始化echarts实例
    let echarts = require('echarts');
    var myChart = echarts.init(document.getElementById('main'));

    // 请求数据
    const { data: res } = await this.$http.get('reports/type/1');
    if (res.meta.status !== 200) {
      return this.$message.error('获取折现图数据失败');
    }
    // 准备数据和配置项
    const result =  _.merge(res.data , this.options)
    
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(result);
  },
  methods: {},
  computed: {},
};
</script>

<style></style>
