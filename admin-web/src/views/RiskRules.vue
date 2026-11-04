<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../api/http'

const loading = ref(false)
const saving = ref(false)
const keyword = ref('')
const levelFilter = ref('')
const rules = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive({
  id: null,
  riskType: '',
  keywords: '',
  level: 'medium',
  explanation: '',
  suggestion: '',
  status: 1,
})

const levelOptions = [
  { label: '高风险', value: 'high' },
  { label: '中风险', value: 'medium' },
  { label: '低风险', value: 'low' },
]

function levelLabel(level) {
  return levelOptions.find((item) => item.value === level)?.label || level
}

function levelTagType(level) {
  if (level === 'high') return 'danger'
  if (level === 'medium') return 'warning'
  return 'success'
}

function formatTime(value) {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 16)
}

async function load() {
  loading.value = true
  try {
    rules.value = await http.get('/admin/risk-rules', {
      params: {
        keyword: keyword.value || undefined,
        level: levelFilter.value || undefined,
      },
    })
  } catch (error) {
    // 拦截器已提示
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.id = null
  form.riskType = ''
  form.keywords = ''
  form.level = 'medium'
  form.explanation = ''
  form.suggestion = ''
  form.status = 1
}

function openCreate() {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

async function save() {
  if (!form.riskType.trim()) {
    ElMessage.warning('请输入风险类型')
    return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await http.put(`/admin/risk-rules/${form.id}`, form)
      ElMessage.success('风险规则已更新')
    } else {
      await http.post('/admin/risk-rules', form)
      ElMessage.success('风险规则已新增')
    }
    dialogVisible.value = false
    await load()
  } catch (error) {
    // 拦截器已提示
  } finally {
    saving.value = false
  }
}

async function remove(row) {
  try {
    await ElMessageBox.confirm(`确定删除风险规则「${row.riskType}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await http.delete(`/admin/risk-rules/${row.id}`)
    ElMessage.success('已删除')
    await load()
  } catch (error) {
    // 取消或请求失败
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h2 class="page-title">风险规则</h2>
        <p class="page-subtitle">配置风险类型、关键词、等级、解释和修改建议</p>
      </div>
      <el-button type="primary" @click="openCreate">新增规则</el-button>
    </div>

    <el-card shadow="never">
      <div class="toolbar">
        <el-input
          v-model="keyword"
          placeholder="搜索风险类型或关键词"
          clearable
          style="width: 300px"
          @keyup.enter="load"
        />
        <el-select v-model="levelFilter" placeholder="风险等级" clearable style="width: 140px">
          <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button @click="load">搜索</el-button>
      </div>

      <el-table v-loading="loading" :data="rules" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="riskType" label="风险类型" width="140" />
        <el-table-column prop="keywords" label="触发关键词" min-width="220" />
        <el-table-column label="等级" width="100">
          <template #default="{ row }">
            <el-tag :type="levelTagType(row.level)" size="small">
              {{ levelLabel(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="suggestion" label="修改建议" min-width="260" show-overflow-tooltip />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑风险规则' : '新增风险规则'"
      width="680px"
      destroy-on-close
    >
      <el-form label-width="90px">
        <el-form-item label="风险类型" required>
          <el-input v-model="form.riskType" placeholder="例如：押金与租金" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="form.keywords" placeholder="多个关键词用英文逗号分隔" />
        </el-form-item>
        <el-form-item label="风险等级">
          <el-select v-model="form.level" style="width: 160px">
            <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="风险解释">
          <el-input v-model="form.explanation" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="修改建议">
          <el-input v-model="form.suggestion" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>