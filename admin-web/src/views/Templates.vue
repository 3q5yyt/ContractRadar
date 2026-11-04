<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../api/http'

const loading = ref(false)
const saving = ref(false)
const keyword = ref('')
const templates = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive({
  id: null,
  name: '',
  category: '',
  content: '',
  status: 1,
})

function formatTime(value) {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 16)
}

async function load() {
  loading.value = true
  try {
    templates.value = await http.get('/admin/templates', {
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
  form.name = ''
  form.category = ''
  form.content = ''
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
  if (!form.name.trim()) {
    ElMessage.warning('请输入模板名称')
    return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await http.put(`/admin/templates/${form.id}`, form)
      ElMessage.success('模板已更新')
    } else {
      await http.post('/admin/templates', form)
      ElMessage.success('模板已新增')
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
    await ElMessageBox.confirm(`确定删除模板「${row.name}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await http.delete(`/admin/templates/${row.id}`)
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
        <h2 class="page-title">合同模板</h2>
        <p class="page-subtitle">维护租房合同模板和条款分类，供客户端选择使用</p>
      </div>
      <el-button type="primary" @click="openCreate">新增模板</el-button>
    </div>

    <el-card shadow="never">
      <div class="toolbar">
        <el-input
          v-model="keyword"
          placeholder="搜索模板名称或分类"
          clearable
          style="width: 320px"
          @keyup.enter="load"
        />
        <el-button @click="load">搜索</el-button>
      </div>

      <el-table v-loading="loading" :data="templates" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="模板名称" min-width="220" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="170">
          <template #default="{ row }">{{ formatTime(row.updatedAt) }}</template>
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
      :title="isEdit ? '编辑合同模板' : '新增合同模板'"
      width="680px"
      destroy-on-close
    >
      <el-form label-width="90px">
        <el-form-item label="模板名称" required>
          <el-input v-model="form.name" placeholder="例如：标准租房合同（北京）" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="form.category" placeholder="例如：整租、合租、简易" />
        </el-form-item>
        <el-form-item label="模板内容">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="10"
            placeholder="填写合同条款内容，客户端将基于模板进行分析"
          />
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