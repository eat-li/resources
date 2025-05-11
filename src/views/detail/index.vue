<script setup>
import { ref, onMounted, getCurrentInstance, nextTick, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getBuildingElectricityConsumption, getBuildingWaterConsumption, getBuildingInfo } from '@/api/buildingApi';
import throttle from '@/utils/throttle';
// 获取路由参数
const route = useRoute();
const router = useRouter();




// 获取全局挂载的echarts
const { proxy } = getCurrentInstance();

// 定义数据变量
const buildingId = ref(null);
const buildingInfo = ref(null);
const electricityData = ref([]);
const waterData = ref([]);
const loading = ref(true);
const error = ref(null);

// 图表容器的ref
const electricityChartRef = ref(null);
const waterChartRef = ref(null);
const electricityCostChartRef = ref(null);
const waterCostChartRef = ref(null);

// 返回首页
const goBack = () => {
  router.push('/');
};

// 存储所有图表实例
const chartInstances = ref([]);

// 定义节流函数，窗口大小变化时最多执行一次
const handleResize = throttle(() => {
  // 遍历所有图表实例，调整大小
  chartInstances.value.forEach(chart => {
    chart && chart.resize();
  });
}, 300); // 300ms的节流时间

// 获取数据的方法
const fetchData = async () => {
  try {
    // 获取建筑物id
    buildingId.value = route.params.buildingId;
    // 获取建筑半年的电率消耗和水费数据
    const ElectricityConsumption = await getBuildingElectricityConsumption(buildingId.value);
    const WaterConsumption = await getBuildingWaterConsumption(buildingId.value);
    // 更新数据变量
    electricityData.value = ElectricityConsumption.data;
    waterData.value = WaterConsumption.data;
    loading.value = false;
    error.value = null;

    // 获取建筑信息
    const buildingInfoResponse = await getBuildingInfo(buildingId.value);
    buildingInfo.value = buildingInfoResponse.data;


  }
  catch (error) {
    console.error(error);
    error.value = '获取数据失败，请稍后再试。';
  }

};

// 初始化图表
const initCharts = () => {
  // 使用 nextTick 确保 DOM 已经渲染完成
  nextTick(() => {
    // 初始化电力消耗图表
    initElectricityChart();

    // 初始化水资源消耗图表
    initWaterChart();

    // 初始化电费图表
    initElectricityCostChart();

    // 初始化水费图表
    initWaterCostChart();
  });
};

// 初始化电力消耗图表
const initElectricityChart = () => {
  // 确保DOM已经渲染
  if (!electricityChartRef.value) return;

  // 初始化echarts实例
  const electricityChart = proxy.$echarts.init(electricityChartRef.value);
  // 将图表实例添加到数组中
  chartInstances.value.push(electricityChart);

  // 处理数据
  const months = electricityData.value.map(item => item.month.substring(5)); // 只显示月份部分
  const electricityValues = electricityData.value.map(item => item.electricity);
  const peakHoursValues = electricityData.value.map(item => item.peak_hours_usage);

  // 设置图表选项
  const option = {
    title: {
      text: '月度用电量趋势(kWh)',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['总用电量', '高峰时段用电量'],
      bottom: '0%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: {
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '用电量(kWh)'
    },
    series: [
      {
        name: '总用电量',
        type: 'bar',
        data: electricityValues,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '高峰时段用电量',
        type: 'bar',
        data: peakHoursValues,
        itemStyle: {
          color: '#E6A23C'
        }
      }
    ]
  };

  // 设置图表
  electricityChart.setOption(option);

  // 不再单独添加事件监听器
  // window.addEventListener('resize', () => {
  //   electricityChart.resize();
  // });
};

// 初始化水资源消耗图表
const initWaterChart = () => {
  // 确保DOM已经渲染
  if (!waterChartRef.value) return;

  // 初始化echarts实例
  const waterChart = proxy.$echarts.init(waterChartRef.value);
  // 将图表实例添加到数组中
  chartInstances.value.push(waterChart);

  // 处理数据
  const months = waterData.value.map(item => item.month.substring(5)); // 只显示月份部分
  const waterValues = waterData.value.map(item => item.water);
  const dailyAvgValues = waterData.value.map(item => item.daily_avg);

  // 设置图表选项
  const option = {
    title: {
      text: '月度用水量趋势(吨)',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['总用水量', '日均用水量'],
      bottom: '0%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: {
        rotate: 30
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '总用水量(吨)',
        position: 'left'
      },
      {
        type: 'value',
        name: '日均用水量(吨)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '总用水量',
        type: 'bar',
        data: waterValues,
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '日均用水量',
        type: 'line',
        yAxisIndex: 1,
        data: dailyAvgValues,
        smooth: true,
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  };

  // 设置图表
  waterChart.setOption(option);

  // 不再单独添加事件监听器
  // window.addEventListener('resize', () => {
  //   waterChart.resize();
  // });
};

// 初始化电费图表
const initElectricityCostChart = () => {
  // 确保DOM已经渲染
  if (!electricityCostChartRef.value) return;

  // 初始化echarts实例
  const electricityCostChart = proxy.$echarts.init(electricityCostChartRef.value);
  // 将图表实例添加到数组中
  chartInstances.value.push(electricityCostChart);

  // 处理数据
  const months = electricityData.value.map(item => item.month.substring(5)); // 只显示月份部分
  const costValues = electricityData.value.map(item => item.cost);
  const unitCostValues = electricityData.value.map(item => (item.cost / item.electricity).toFixed(2));

  // 设置图表选项
  const option = {
    title: {
      text: '月度电费支出(元)',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        let result = params[0].name + '<br/>';
        params.forEach(param => {
          if (param.seriesName === '电费') {
            result += param.seriesName + ': ' + param.value.toLocaleString() + ' 元<br/>';
          } else {
            result += param.seriesName + ': ' + param.value + ' 元/kWh<br/>';
          }
        });
        return result;
      }
    },
    legend: {
      data: ['电费', '单位电费'],
      bottom: '0%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: {
        rotate: 30
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '电费(元)',
        position: 'left'
      },
      {
        type: 'value',
        name: '单位电费(元/kWh)',
        position: 'right',
        min: 0,
        max: Math.max(...unitCostValues) * 1.2
      }
    ],
    series: [
      {
        name: '电费',
        type: 'bar',
        data: costValues,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '单位电费',
        type: 'line',
        yAxisIndex: 1,
        data: unitCostValues,
        smooth: true,
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  };

  // 设置图表
  electricityCostChart.setOption(option);

  // 不再单独添加事件监听器
  // window.addEventListener('resize', () => {
  //   electricityCostChart.resize();
  // });
};

// 初始化水费图表
const initWaterCostChart = () => {
  // 确保DOM已经渲染
  if (!waterCostChartRef.value) return;

  // 初始化echarts实例
  const waterCostChart = proxy.$echarts.init(waterCostChartRef.value);

  // 处理数据
  const months = waterData.value.map(item => item.month.substring(5)); // 只显示月份部分
  const costValues = waterData.value.map(item => item.cost);
  const unitCostValues = waterData.value.map(item => (item.cost / item.water).toFixed(2));

  // 设置图表选项
  const option = {
    title: {
      text: '月度水费支出(元)',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        let result = params[0].name + '<br/>';
        params.forEach(param => {
          if (param.seriesName === '水费') {
            result += param.seriesName + ': ' + param.value.toLocaleString() + ' 元<br/>';
          } else {
            result += param.seriesName + ': ' + param.value + ' 元/吨<br/>';
          }
        });
        return result;
      }
    },
    legend: {
      data: ['水费', '单位水费'],
      bottom: '0%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: {
        rotate: 30
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '水费(元)',
        position: 'left'
      },
      {
        type: 'value',
        name: '单位水费(元/吨)',
        position: 'right',
        min: 0,
        max: Math.max(...unitCostValues) * 1.2
      }
    ],
    series: [
      {
        name: '水费',
        type: 'bar',
        data: costValues,
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '单位水费',
        type: 'line',
        yAxisIndex: 1,
        data: unitCostValues,
        smooth: true,
        itemStyle: {
          color: '#E6A23C'
        }
      }
    ]
  };

  // 设置图表
  waterCostChart.setOption(option);

  // 不再单独添加事件监听器
  // window.addEventListener('resize', () => {
  //   waterCostChart.resize();
  // });
};

// 页面加载时获取数据
onMounted(() => {
  // 添加全局的resize事件监听器
  window.addEventListener('resize', handleResize);

  fetchData().then(() => {
    // 确保数据加载完成后再初始化图表
    if (electricityData.value.length > 0 || waterData.value.length > 0) {
      // 使用 nextTick 确保 DOM 已经渲染
      nextTick(() => {
        initCharts();
      });
    }
  });
});

// 组件卸载时清理资源
onUnmounted(() => {
  // 移除事件监听器
  window.removeEventListener('resize', handleResize);

  // 销毁所有图表实例
  chartInstances.value.forEach(chart => {
    chart && chart.dispose();
  });
  chartInstances.value = [];
});
</script>

<template>
  <div class="detail-container">
    <div class="header-section">
      <button class="back-btn" @click="goBack">返回首页</button>
      <h2 class="page-title" v-if="buildingInfo">{{ buildingInfo.name }}教学楼({{ buildingInfo.type }})能耗详情</h2>
      <h2 class="page-title" v-else>教学楼能耗详情</h2>
    </div>

    <div v-if="loading" class="loading">
      加载中...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="content">
      <!-- 建筑信息卡片 -->
      <div class="building-info-card">
        <div class="info-item">
          <span class="label">建筑名称:</span>
          <span class="value">{{ buildingInfo.name }}教学楼</span>
        </div>
        <div class="info-item">
          <span class="label">建筑类型:</span>
          <span class="value">{{ buildingInfo.type }}</span>
        </div>
        <div class="info-item">
          <span class="label">建筑面积:</span>
          <span class="value">{{ buildingInfo.area.toLocaleString() }} m²</span>
        </div>
        <div class="info-item">
          <span class="label">楼层数:</span>
          <span class="value">{{ buildingInfo.floors }} 层</span>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-container">
        <h3 class="section-title">电力消耗分析</h3>
        <div class="chart-row">
          <div class="chart-card">
            <div ref="electricityChartRef" class="chart"></div>
          </div>
          <div class="chart-card">
            <div ref="electricityCostChartRef" class="chart"></div>
          </div>
        </div>

        <h3 class="section-title">水资源消耗分析</h3>
        <div class="chart-row">
          <div class="chart-card">
            <div ref="waterChartRef" class="chart"></div>
          </div>
          <div class="chart-card">
            <div ref="waterCostChartRef" class="chart"></div>
          </div>
        </div>
      </div>

      <!-- 详细数据表格 -->
      <div class="tables-container">
        <h3 class="section-title">电力消耗详细数据</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>月份</th>
              <th>总用电量(kWh)</th>
              <th>高峰时段用电量(kWh)</th>
              <th>电费(元)</th>
              <th>高峰用电占比</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in electricityData" :key="item.id">
              <td>{{ item.month }}</td>
              <td>{{ item.electricity.toLocaleString() }}</td>
              <td>{{ item.peak_hours_usage.toLocaleString() }}</td>
              <td>{{ item.cost.toLocaleString() }}</td>
              <td>{{ ((item.peak_hours_usage / item.electricity) * 100).toFixed(2) }}%</td>
            </tr>
          </tbody>
        </table>

        <h3 class="section-title">水资源消耗详细数据</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>月份</th>
              <th>总用水量(吨)</th>
              <th>日均用水量(吨)</th>
              <th>水费(元)</th>
              <th>单位成本(元/吨)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in waterData" :key="item.id">
              <td>{{ item.month }}</td>
              <td>{{ item.water.toLocaleString() }}</td>
              <td>{{ item.daily_avg.toLocaleString() }}</td>
              <td>{{ item.cost.toLocaleString() }}</td>
              <td>{{ (item.cost / item.water).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-container {
  padding: 20px;
}

.header-section {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.back-btn {
  background-color: #409EFF;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 16px;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: #66B1FF;
}

.page-title {
  margin: 0;
  color: #303133;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #909399;
}

.error {
  color: #F56C6C;
}

.building-info-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
}

.info-item {
  flex: 1;
  min-width: 200px;
  margin-bottom: 12px;
}

.label {
  font-weight: bold;
  color: #606266;
  margin-right: 8px;
}

.value {
  color: #303133;
}

.section-title {
  margin-top: 24px;
  margin-bottom: 16px;
  color: #303133;
  font-size: 18px;
}

.charts-container {
  margin-bottom: 24px;
  color: #000;
}

.chart-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  flex: 1;
  min-width: 45%;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart {
  width: 100%;
  height: 350px;
}

.tables-container {
  margin-top: 24px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
}

/* Element Plus表格自定义样式 */
:deep(.data-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

:deep(.data-table .el-table__header-wrapper th) {
  background-color: #F5F7FA;
  color: #606266;
  font-weight: 500;
}

:deep(.data-table .el-table__row:hover) {
  background-color: #F5F7FA;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  text-align: center;
  border-bottom: 1px solid #EBEEF5;
}

.data-table th {
  background-color: #F5F7FA;
  color: #606266;
  font-weight: 500;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover {
  background-color: #F5F7FA;
}

@media (max-width: 768px) {
  .chart-card {
    min-width: 100%;
  }

  .info-item {
    min-width: 100%;
  }
}
</style>
