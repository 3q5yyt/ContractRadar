<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../api/http'

const loading = ref(false)
const saving = ref(false)
const keyword = ref('')
const laws = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive({
  id: null,
  lawName: '',
  articleNo: '',
  content: '',
  keywords: '',
  effectiveDate: '',
  status: 1,
})

async function load() {
  loading.value = true
  try {
    laws.value = await http.get('/admin/laws', {
      params: { keyword: keyword.value || undefined },
    })
  } catch (error) {
    // 拦截器已提示
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.id = null
  form.lawName = ''
  form.articleNo = ''
  form.content = ''
  form.keywords = ''
  form.effectiveDate = ''
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
  if (!form.lawName.trim() || !form.articleNo.trim()) {
    ElMessage.warning('请填写法律名称和条号')
    return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await http.put(`/admin/laws/${form.id}`, form)
      ElMessage.success('法条已更新')
    } else {
      await http.post('/admin/laws', form)
      ElMessage.success('法条已新增')
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
    await ElMessageBox.confirm(`确定删除「${row.lawName}${row.articleNo}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await http.delete(`/admin/laws/${row.id}`)
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
        <h2 class="page-title">法条库</h2>
        <p class="page-subtitle">维护法律名称、条号、原文和关键词，为合同分析提供依据</p>
      </div>
      <el-button type="primary" @click="openCreate">新增法条</el-button>
    </div>

    <el-card shadow="never">
      <div class="toolbar">
        <el-input
          v-model="keyword"
          placeholder="搜索法律名称、条号、关键词或原文"
          clearable
          style="width: 360px"
          @keyup.enter="load"
        />
        <el-button @click="load">搜索</el-button>
      </div>

      <el-table v-loading="loading" :data="laws" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="lawName" label="法律名称" min-width="220" />
        <el-table-column prop="articleNo" label="条号" width="120" />
        <el-table-column prop="keywords" label="关键词" min-width="180" />
        <el-table-column prop="content" label="条文原文" min-width="300" show-overflow-tooltip />
        <el-table-column prop="effectiveDate" label="生效时间" width="120" />
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
      :title="isEdit ? '编辑法条' : '新增法条'"
      width="720px"
      destroy-on-close
    >
      <el-form label-width="90px">
        <el-form-item label="法律名称" required>
          <el-input v-model="form.lawName" placeholder="例如：《中华人民共和国民法典》" />
        </el-form-item>
        <el-form-item label="条号" required>
          <el-input v-model="form.articleNo" placeholder="例如：第五百八十五条" />
        </el-form-item>
        <el-form-item label="条文原文">
          <el-input v-model="form.content" type="textarea" :rows="6" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="form.keywords" placeholder="多个关键词用英文逗号分隔" />
        </el-form-item>
        <el-form-item label="生效时间">
          <el-input v-model="form.effectiveDate" placeholder="例如：2021-01-01" />
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