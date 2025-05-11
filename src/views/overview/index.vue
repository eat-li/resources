<script setup>
import { ref, onMounted, getCurrentInstance, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getAllElectricityConsumption, getAllWaterConsumption, getAllBuildings } from '@/api/buildingApi';

// 导入节流
import throttle from '@/utils/throttle';

// 定义路由
const router = useRouter();

// 获取全局挂载的echarts
const { proxy } = getCurrentInstance();

// 定义数据变量
const electricityData = ref([]);
const waterData = ref([]);
const buildingsData = ref([]);

// 使用计算属性替代普通变量和calculateTotals方法
const totalElectricity = computed(() =>
  electricityData.value.reduce((sum, item) => sum + item.electricity, 0)
);

const totalElectricityCost = computed(() =>
  electricityData.value.reduce((sum, item) => sum + item.cost, 0)
);

const totalWater = computed(() =>
  waterData.value.reduce((sum, item) => sum + item.water, 0)
);

const totalWaterCost = computed(() =>
  waterData.value.reduce((sum, item) => sum + item.cost, 0)
);

// 总费用也可以使用计算属性
const totalCost = computed(() =>
  totalElectricityCost.value + totalWaterCost.value
);

// 合并后的建筑物数据（包含用电和用水信息）
const buildingsWithConsumption = computed(() =>
  buildingsData.value.map(building => {
    // 获取该建筑物的所有电力消耗记录
    const buildingElectricity = electricityData.value.filter(item => item.building_id === building.id);
    // 获取该建筑物的所有水资源消耗记录
    const buildingWater = waterData.value.filter(item => item.building_id === building.id);

    // 计算该建筑物的总电量和总电费
    const totalElectricity = buildingElectricity.reduce((sum, item) => sum + item.electricity, 0);
    const totalElectricityCost = buildingElectricity.reduce((sum, item) => sum + item.cost, 0);

    // 计算该建筑物的总水量和总水费
    const totalWater = buildingWater.reduce((sum, item) => sum + item.water, 0);
    const totalWaterCost = buildingWater.reduce((sum, item) => sum + item.cost, 0);

    // 返回合并后的数据
    return {
      ...building,
      totalElectricity,
      totalElectricityCost,
      totalWater,
      totalWaterCost,
      totalCost: totalElectricityCost + totalWaterCost
    };
  })
);

// 图表容器的ref
const electricityChartRef = ref(null);
const waterChartRef = ref(null);
const monthlyConsumptionChartRef = ref(null);

// 存储所有图表实例
const chartInstances = ref([]);

// 定义节流函数，窗口大小变化时最多执行一次
const handleResize = throttle(() => {
  // 遍历所有图表实例，调整大小
  chartInstances.value.forEach(chart => {
    chart && chart.resize();
  });
}, 300);

// 获取数据的方法
const fetchData = async () => {
  try {
    // 获取电力消耗数据
    const electricityRes = await getAllElectricityConsumption();
    electricityData.value = electricityRes.data || [];

    // 获取水资源消耗数据
    const waterRes = await getAllWaterConsumption();
    waterData.value = waterRes.data || [];

    // 获取建筑物数据
    const buildingsRes = await getAllBuildings();
    buildingsData.value = buildingsRes.data || [];




    // 初始化图表
    initCharts();
  } catch (error) {
    console.error('获取数据失败:', error);
  }
};


// 跳转到详情页
const goToDetail = (buildingId) => {
  router.push(`/detail/${buildingId}`);
};

// 初始化图表
const initCharts = () => {
  // 初始化月度用电量对比图表
  initElectricityChart();

  // 初始化月度用水量对比图表
  initWaterChart();

  // 初始化各建筑物月度能耗对比图表
  initMonthlyConsumptionChart();
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
  const months = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'];
  const buildingNames = buildingsData.value.map(building => building.name);

  // 准备系列数据
  const series = buildingsData.value.map(building => {
    const data = months.map(month => {
      const record = electricityData.value.find(item =>
        item.building_id === building.id && item.month === month
      );
      return record ? record.electricity : 0;
    });

    return {
      name: building.name,
      type: 'bar',
      data: data
    };
  });

  // 设置图表选项
  const option = {
    title: {
      text: '各教学楼月度用电量对比(kWh)',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: buildingNames,
      top: 'bottom'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months.map(month => month.substring(5)), // 只显示月份部分
      axisLabel: {
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '用电量(kWh)'
    },
    series: series
  };

  // 设置图表
  electricityChart.setOption(option);

  // 移除单独的事件监听
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
  const months = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'];
  const buildingNames = buildingsData.value.map(building => building.name);

  // 准备系列数据
  const series = buildingsData.value.map(building => {
    const data = months.map(month => {
      const record = waterData.value.find(item =>
        item.building_id === building.id && item.month === month
      );
      return record ? record.water : 0;
    });

    return {
      name: building.name,
      type: 'line',
      data: data,
      smooth: true
    };
  });

  // 设置图表选项
  const option = {
    title: {
      text: '各教学楼月度用水量对比(吨)',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: buildingNames,
      top: 'bottom'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months.map(month => month.substring(5)), // 只显示月份部分
      axisLabel: {
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '用水量(吨)'
    },
    series: series
  };

  // 设置图表
  waterChart.setOption(option);

  // 移除单独的事件监听
  // window.addEventListener('resize', () => {
  //   waterChart.resize();
  // });
};

// 初始化各建筑物月度能耗对比图表
const initMonthlyConsumptionChart = () => {
  // 确保DOM已经渲染
  if (!monthlyConsumptionChartRef.value) return;

  // 初始化echarts实例
  const monthlyChart = proxy.$echarts.init(monthlyConsumptionChartRef.value);
  // 将图表实例添加到数组中
  chartInstances.value.push(monthlyChart);

  // 处理数据
  const buildingNames = buildingsData.value.map(building => building.name);

  // 计算每个建筑物的总费用
  const totalCosts = buildingsWithConsumption.value.map(building => building.totalCost);

  // 设置图表选项
  const option = {
    title: {
      text: '各教学楼能耗费用占比',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} 元 ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom',
      data: buildingNames
    },
    series: [
      {
        name: '能耗费用',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: buildingNames.map((name, index) => ({
          value: totalCosts[index],
          name: name
        }))
      }
    ]
  };

  // 设置图表
  monthlyChart.setOption(option);

  // 移除单独的事件监听
  // window.addEventListener('resize', () => {
  //   monthlyChart.resize();
  // });
};

// 页面加载时获取数据
onMounted(() => {
  // 添加全局的resize事件监听器
  window.addEventListener('resize', handleResize);

  fetchData();
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
  <div class="overview-container">
    <h2 class="page-title">2025上半年校园能耗总览</h2>

    <div class="summary-cards">
      <!-- 电力消耗卡片 -->
      <div class="card electricity-card">
        <h3>总用电量</h3>
        <div class="card-value">{{ totalElectricity.toLocaleString() }} kWh</div>
        <div class="card-cost">总费用: {{ totalElectricityCost.toLocaleString() }} 元</div>
      </div>

      <!-- 水资源消耗卡片 -->
      <div class="card water-card">
        <h3>总用水量</h3>
        <div class="card-value">{{ totalWater.toLocaleString() }} 吨</div>
        <div class="card-cost">总费用: {{ totalWaterCost.toLocaleString() }} 元</div>
      </div>

      <!-- 总费用卡片 -->
      <div class="card total-cost-card">
        <h3>总耗费金额</h3>
        <div class="card-value">{{ totalCost.toLocaleString() }} 元</div>
      </div>
    </div>
    <!-- 建筑物能耗表格 -->
    <div class="buildings-table-container">
      <h3 class="section-title">各教学楼能耗情况</h3>
      <el-table 
        :data="buildingsWithConsumption" 
        style="width: 100%" 
        @row-click="(row) => goToDetail(row.id)"
        class="buildings-table"
      >
        <el-table-column prop="name" label="教学楼" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="area" label="面积 (m²)">
          <template #default="scope">
            {{ scope.row.area.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="totalElectricity" label="用电量 (kWh)">
          <template #default="scope">
            {{ scope.row.totalElectricity.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="totalElectricityCost" label="电费 (元)">
          <template #default="scope">
            {{ scope.row.totalElectricityCost.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="totalWater" label="用水量 (吨)">
          <template #default="scope">
            {{ scope.row.totalWater.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="totalWaterCost" label="水费 (元)">
          <template #default="scope">
            {{ scope.row.totalWaterCost.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="totalCost" label="总费用 (元)">
          <template #default="scope">
            {{ scope.row.totalCost.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click.stop="goToDetail(scope.row.id)"
              class="detail-btn"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 将每个教学楼的各个月份echart图表总览渲染到这里 -->
    <div class="charts-container">
      <!-- 饼图展示各教学楼能耗费用占比 -->
      <div class="chart-card">
        <div ref="monthlyConsumptionChartRef" class="chart"></div>
      </div>

      <!-- 柱状图展示各教学楼月度用电量对比 -->
      <div class="chart-card">
        <div ref="electricityChartRef" class="chart"></div>
      </div>

      <!-- 折线图展示各教学楼月度用水量对比 -->
      <div class="chart-card">
        <div ref="waterChartRef" class="chart"></div>
      </div>
    </div>


  </div>
</template>

<style scoped>
.overview-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 24px;
  color: #303133;
}

.summary-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  flex: 1;
  min-width: 250px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card h3 {
  margin-top: 0;
  color: #606266;
  font-size: 16px;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  margin: 10px 0;
  color: #303133;
}

.card-cost {
  font-size: 14px;
  color: #909399;
}

.electricity-card {
  border-top: 4px solid #409EFF;
}

.water-card {
  border-top: 4px solid #67C23A;
}

.total-cost-card {
  border-top: 4px solid #E6A23C;
}

/* 表格容器样式 */
.buildings-table-container {
  margin-top: 30px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
  font-size: 18px;
}

/* Element Plus表格自定义样式 */
:deep(.buildings-table) {
  width: 100%;
  border-collapse: collapse;
}

:deep(.buildings-table .el-table__row) {
  cursor: pointer;
}

:deep(.buildings-table .el-table__row:hover) {
  background-color: #F5F7FA;
}

:deep(.detail-btn) {
  padding: 6px 12px;
  font-size: 12px;
}

.buildings-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  color: #000;
}

.buildings-table th,
.buildings-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #EBEEF5;
}

.buildings-table th {
  background-color: #F5F7FA;
  color: #606266;
  font-weight: 500;
}

.building-row {
  cursor: pointer;
  transition: background-color 0.3s;
}

.building-row:hover {
  background-color: #F5F7FA;
}

.detail-btn {
  background-color: #409EFF;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.detail-btn:hover {
  background-color: #66B1FF;
}

/* 图表容器样式 */
.charts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart {
  width: 100%;
  height: 400px;
}
</style>