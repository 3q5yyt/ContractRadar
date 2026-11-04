<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChatDotRound,
  DataAnalysis,
  Document,
  Reading,
  SwitchButton,
  User,
  Warning,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const adminName = ref(localStorage.getItem('cr_admin_name') || '管理员')
const active = computed(() => route.path)
const title = computed(() => route.meta.title || '管理端')

function logout() {
  localStorage.removeItem('cr_admin_token')
  localStorage.removeItem('cr_admin_name')
  localStorage.removeItem('cr_admin_username')
  router.push('/login')
}
</script>

<template>
  <el-container class="layout">
    <el-aside width="220px" class="sidebar">
      <div class="brand">
        <div class="brand-mark">CR</div>
        <div>
          <div class="brand-title">合同雷达</div>
          <div class="brand-sub">管理端</div>
        </div>
      </div>

      <el-menu
        :default-active="active"
        router
        background-color="#0b2a4a"
        text-color="#b9c9dc"
        active-text-color="#ffffff"
        class="menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据看板</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/templates">
          <el-icon><Document /></el-icon>
          <span>合同模板</span>
        </el-menu-item>
        <el-menu-item index="/risk-rules">
          <el-icon><Warning /></el-icon>
          <span>风险规则</span>
        </el-menu-item>
        <el-menu-item index="/laws">
          <el-icon><Reading /></el-icon>
          <span>法条库</span>
        </el-menu-item>
        <el-menu-item index="/analyses">
          <el-icon><ChatDotRound /></el-icon>
          <span>分析与反馈</span>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer">Contract Radar v1.0</div>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div>
          <div class="header-title">{{ title }}</div>
          <div class="header-sub">租房合同风险审查与条款修订辅助系统</div>
        </div>
        <div class="header-right">
          <span class="admin-name">{{ adminName }}</span>
          <el-button text :icon="SwitchButton" @click="logout">退出</el-button>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  height: 100vh;
}

.sidebar {
  background: #0b2a4a;
  display: flex;
  flex-direction: column;
  color: #ffffff;
}

.brand {
  height: 74px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #ffffff;
  color: #0b2a4a;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.brand-title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
}

.brand-sub {
  font-size: 11px;
  color: #8fa6bc;
  margin-top: 2px;
}

.menu {
  border-right: none;
  flex: 1;
  padding-top: 8px;
}

.menu :deep(.el-menu-item) {
  height: 46px;
  margin: 4px 12px;
  border-radius: 10px;
}

.menu :deep(.el-menu-item:hover) {
  background: #173e66;
}

.menu :deep(.el-menu-item.is-active) {
  background: #1f5f8b;
}

.sidebar-footer {
  padding: 16px 20px;
  font-size: 11px;
  color: #6f8aa4;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.header {
  height: 74px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 0 #eef2f6;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.header-sub {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 3px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-name {
  font-size: 13px;
  color: #475569;
}

.main {
  padding: 20px;
  background: #f4f6f8;
  overflow-y: auto;
}
</style>