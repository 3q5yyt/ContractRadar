<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import http from '../api/http'

const loading = ref(false)
const stats = ref({
  userCount: 0,
  templateCount: 0,
  riskRuleCount: 0,
  lawCount: 0,
  analysisCount: 0,
  feedbackCount: 0,
  riskDistribution: [],
  dailyAnalyses: [],
})
const recent = ref([])
const riskChartRef = ref(null)
const dailyChartRef = ref(null)

let riskChart = null
let dailyChart = null

const cards = computed(() => [
  { label: '用户总数', value: stats.value.userCount, color: '#1f5f8b' },
  { label: '合同模板', value: stats.value.templateCount, color: '#2e7d5b' },
  { label: '风险规则', value: stats.value.riskRuleCount, color: '#d98a1d' },
  { label: '法条数量', value: stats.value.lawCount, color: '#6d5bd0' },
  { label: '分析记录', value: stats.value.analysisCount, color: '#c2416b' },
  { label: '用户反馈', value: stats.value.feedbackCount, color: '#0f766e' },
])

function formatTime(value) {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 16)
}

function levelColor(name) {
  if (name === '高风险') return '#d93f3f'
  if (name === '中风险') return '#d98a1d'
  return '#2e7d5b'
}

function renderCharts() {
  if (riskChartRef.value) {
    if (riskChart) riskChart.dispose()
    riskChart = echarts.init(riskChartRef.value)
    riskChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, icon: 'circle' },
      series: [
        {
          type: 'pie',
          radius: ['42%', '66%'],
          center: ['50%', '44%'],
          label: { formatter: '{b}\n{c}' },
          data: (stats.value.riskDistribution || []).map((item) => ({
            name: item.name,
            value: item.value,
            itemStyle: { color: levelColor(item.name) },
          })),
        },
      ],
    })
  }

  if (dailyChartRef.value) {
    if (dailyChart) dailyChart.dispose()
    dailyChart = echarts.init(dailyChartRef.value)
    const daily = stats.value.dailyAnalyses || []
    dailyChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 24, bottom: 30 },
      xAxis: {
        type: 'category',
        data: daily.map((item) => String(item.name).slice(5)),
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b' },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: { lineStyle: { color: '#eef2f6' } },
        axisLabel: { color: '#64748b' },
      },
      series: [
        {
          type: 'bar',
          barWidth: 22,
          data: daily.map((item) => item.value),
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: '#1f5f8b',
          },
        },
      ],
    })
  }
}

async function load() {
  loading.value = true
  try {
    stats.value = await http.get('/admin/stats')
    const records = await http.get('/admin/analyses')
    recent.value = (records || []).slice(0, 5)
    await nextTick()
    renderCharts()
  } catch (error) {
    // 拦截器已提示
  } finally {
    loading.value = false
  }
}

function resize() {
  riskChart?.resize()
  dailyChart?.resize()
}

onMounted(() => {
  load()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  riskChart?.dispose()
  dailyChart?.dispose()
})
</script>

<template>
  <div v-loading="loading">
    <div class="page-header">
      <div>
        <h2 class="page-title">数据看板</h2>
        <p class="page-subtitle">用户、模板、规则、法条、分析和反馈的整体运行情况</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-row :gutter="14">
      <el-col v-for="card in cards" :key="card.label" :span="8">
        <el-card class="stat-card" shadow="never">
          <div class="stat-label">{{ card.label }}</div>
          <div class="stat-value" :style="{ color: card.color }">{{ card.value }}</div>
          <div class="stat-bar" :style="{ background: card.color }"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="14" class="chart-row">
      <el-col :span="10">
        <el-card shadow="never">
          <template #header>
            <div class="card-title">风险规则分布</div>
          </template>
          <div ref="riskChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card shadow="never">
          <template #header>
            <div class="card-title">近 7 天分析次数</div>
          </template>
          <div ref="dailyChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="recent-card">
      <template #header>
        <div class="card-title">最近分析记录</div>
      </template>
      <el-table :data="recent" stripe>
        <el-table-column prop="contractName" label="合同名称" min-width="220" />
        <el-table-column prop="userId" label="用户 ID" width="100" />
        <el-table-column label="风险分" width="100">
          <template #default="{ row }">
            <span class="score">{{ row.overallScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="来源" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.source === 'api' ? 'success' : 'info'">
              {{ row.source === 'api' ? 'AI 实时' : '示例' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="170">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.stat-card {
  margin-bottom: 14px;
  position: relative;
  overflow: hidden;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  margin-top: 8px;
}

.stat-bar {
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  opacity: 0.85;
}

.chart-row {
  margin-top: 2px;
}

.chart {
  height: 300px;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.recent-card {
  margin-top: 14px;
}

.score {
  font-weight: 700;
  color: #0f172a;
}
</style>