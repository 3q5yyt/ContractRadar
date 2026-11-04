<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../api/http'

const loading = ref(false)
const keyword = ref('')
const users = ref([])

function formatTime(value) {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 16)
}

async function load() {
  loading.value = true
  try {
    users.value = await http.get('/admin/users', {
      params: { keyword: keyword.value || undefined },
    })
  } catch (error) {
    // 拦截器已提示
  } finally {
    loading.value = false
  }
}

async function changeStatus(row, value) {
  try {
    await http.put(`/admin/users/${row.id}/status`, { status: value ? 1 : 0 })
    ElMessage.success(value ? '已启用用户' : '已停用用户')
    await load()
  } catch (error) {
    await load()
  }
}

async function remove(row) {
  try {
    await ElMessageBox.confirm(`确定删除用户「${row.username}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await http.delete(`/admin/users/${row.id}`)
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
        <h2 class="page-title">用户管理</h2>
        <p class="page-subtitle">查看客户端注册用户，支持搜索、启用/停用和删除</p>
      </div>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-card shadow="never">
      <div class="toolbar">
        <el-input
          v-model="keyword"
          placeholder="搜索用户名、昵称或手机号"
          clearable
          style="width: 320px"
          @keyup.enter="load"
        />
        <el-button type="primary" @click="load">搜索</el-button>
      </div>

      <el-table v-loading="loading" :data="users" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="140" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              active-text="启用"
              inactive-text="停用"
              inline-prompt
              @change="(value) => changeStatus(row, value)"
            />
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="170">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>