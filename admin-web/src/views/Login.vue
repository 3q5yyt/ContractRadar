<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import http from '../api/http'

const router = useRouter()
const loading = ref(false)
const form = reactive({
  username: 'admin',
  password: 'admin123',
})

async function submit() {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  loading.value = true
  try {
    const data = await http.post('/admin/auth/login', {
      username: form.username,
      password: form.password,
    })
    localStorage.setItem('cr_admin_token', data.token)
    localStorage.setItem('cr_admin_name', data.name || data.username)
    localStorage.setItem('cr_admin_username', data.username)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (error) {
    // 错误提示由 http 拦截器统一处理
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <div class="brand-mark">CR</div>
        <div>
          <div class="brand-title">合同雷达</div>
          <div class="brand-sub">租房合同风险审查管理端</div>
        </div>
      </div>

      <div class="login-title">管理员登录</div>
      <div class="login-desc">登录后可维护用户、合同模板、风险规则、法条库和分析反馈。</div>

      <el-form label-position="top" class="login-form" @submit.prevent="submit">
        <el-form-item label="用户名">
          <el-input v-model="form.username" size="large" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            size="large"
            type="password"
            show-password
            placeholder="请输入密码"
            @keyup.enter="submit"
          />
        </el-form-item>
        <el-button type="primary" size="large" class="login-button" :loading="loading" @click="submit">
          登录
        </el-button>
      </el-form>

      <div class="login-hint">默认账号：admin / admin123</div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 20% 20%, rgba(31, 95, 139, 0.35), transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(15, 42, 74, 0.55), transparent 45%),
    #0b2a4a;
}

.login-card {
  width: 420px;
  background: #ffffff;
  border-radius: 20px;
  padding: 30px 32px 26px;
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.28);
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #0b2a4a;
  color: #ffffff;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.brand-title {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.brand-sub {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

.login-title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.login-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.7;
  margin: 8px 0 22px;
}

.login-form :deep(.el-form-item__label) {
  color: #475569;
  font-weight: 600;
}

.login-button {
  width: 100%;
  margin-top: 8px;
  height: 44px;
  border-radius: 10px;
}

.login-hint {
  margin-top: 18px;
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
}
</style>