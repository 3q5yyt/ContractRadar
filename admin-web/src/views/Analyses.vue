<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import http from '../api/http'

const activeTab = ref('analyses')
const loading = ref(false)
const analyses = ref([])
const feedbacks = ref([])
const detailVisible = ref(false)
const current = ref(null)

function formatTime(value) {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 16)
}

function scoreTagType(score) {
  if (score >= 70) return 'danger'
  if (score >= 40) return 'warning'
  return 'success'
}

function sourceText(source) {
  return source === 'api' ? 'AI 实时' : '示例'
}

function resultText(row) {
  if (!row || !row.resultJson) return '暂无结构化结果'
  try {
    const parsed = JSON.parse(row.resultJson)
    if (!parsed || Object.keys(parsed).length === 0) return '暂无结构化结果'
    return JSON.stringify(parsed, null, 2)
  } catch (error) {
    return row.resultJson
  }
}

async function loadAnalyses() {
  analyses.value = await http.get('/admin/analyses')
}

async function loadFeedbacks() {
  feedbacks.value = await http.get('/admin/feedback')
}

async function loadAll() {
  loading.value = true
  try {
    await Promise.all([loadAnalyses(), loadFeedbacks()])
  } catch (error) {
    // 拦截器已提示
  } finally {
    loading.value = false
  }
}

function openDetail(row) {
  current.value = row
  detailVisible.value = true
}

async function toggleFeedback(row) {
  try {
    const nextStatus = row.status === 1 ? 0 : 1
    await http.put(`/admin/feedback/${row.id}/status`, { status: nextStatus })
    ElMessage.success(nextStatus === 1 ? '已标记为已处理' : '已标记为未处理')
    await loadFeedbacks()
  } catch (error) {
    // 拦截器已提示
  }
}

onMounted(loadAll)
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h2 class="page-title">分析与反馈</h2>
        <p class="page-subtitle">查看用户合同分析记录，跟踪用户反馈和误判情况</p>
      </div>
      <el-button @click="loadAll">刷新</el-button>
    </div>

    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="分析记录" name="analyses">
          <el-table v-loading="loading" :data="analyses" stripe>
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="contractName" label="合同名称" min-width="220" />
            <el-table-column prop="userId" label="用户 ID" width="100" />
            <el-table-column label="风险分" width="100">
              <template #default="{ row }">
                <el-tag :type="scoreTagType(row.overallScore)" size="small">
                  {{ row.overallScore }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="高/中/低" width="120">
              <template #default="{ row }">
                {{ row.highCount }} / {{ row.mediumCount }} / {{ row.lowCount }}
              </template>
            </el-table-column>
            <el-table-column label="来源" width="100">
              <template #default="{ row }">
                <el-tag :type="row.source === 'api' ? 'success' : 'info'" size="small">
                  {{ sourceText(row.source) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="分析时间" width="170">
              <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openDetail(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="用户反馈" name="feedback">
          <el-table v-loading="loading" :data="feedbacks" stripe>
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="analysisId" label="分析 ID" width="100" />
            <el-table-column prop="userId" label="用户 ID" width="100" />
            <el-table-column prop="content" label="反馈内容" min-width="360" show-overflow-tooltip />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'warning'" size="small">
                  {{ row.status === 1 ? '已处理' : '未处理' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="提交时间" width="170">
              <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="toggleFeedback(row)">
                  {{ row.status === 1 ? '标记未处理' : '标记已处理' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="detailVisible" title="分析记录详情" width="760px">
      <template v-if="current">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="合同名称">{{ current.contractName }}</el-descriptions-item>
          <el-descriptions-item label="用户 ID">{{ current.userId }}</el-descriptions-item>
          <el-descriptions-item label="风险分">{{ current.overallScore }}</el-descriptions-item>
          <el-descriptions-item label="来源">{{ sourceText(current.source) }}</el-descriptions-item>
          <el-descriptions-item label="高风险">{{ current.highCount }}</el-descriptions-item>
          <el-descriptions-item label="中风险">{{ current.mediumCount }}</el-descriptions-item>
          <el-descriptions-item label="低风险">{{ current.lowCount }}</el-descriptions-item>
          <el-descriptions-item label="分析时间">{{ formatTime(current.createdAt) }}</el-descriptions-item>
        </el-descriptions>
        <div class="detail-block">
          <div class="detail-label">总体结论</div>
          <div class="detail-summary">{{ current.summary || '暂无结论' }}</div>
        </div>
        <div class="detail-block">
          <div class="detail-label">结构化结果</div>
          <pre class="result-json">{{ resultText(current) }}</pre>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.detail-block {
  margin-top: 18px;
}

.detail-label {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.detail-summary {
  font-size: 13px;
  color: #475569;
  line-height: 1.8;
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px 14px;
}

.result-json {
  margin: 0;
  max-height: 260px;
  overflow: auto;
  background: #0f172a;
  color: #dbeafe;
  border-radius: 10px;
  padding: 14px;
  font-size: 12px;
  line-height: 1.6;
}
</style>