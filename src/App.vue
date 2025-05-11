<script setup>
import { ref } from 'vue';
const currentYear = ref(new Date().getFullYear());
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="logo">
        <h1>校园能耗可视化平台</h1>
      </div>
    </header>

    <main class="app-main">
      <router-view>
      </router-view>
    </main>

    <footer class="app-footer">
      <p>© {{ currentYear }} 校园能耗可视化平台 - 后勤管理部门</p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: #409EFF;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
}

.app-main {
  flex: 1;
  background-color: #f5f7fa;
}

.app-footer {
  background-color: #f5f7fa;
  color: #606266;
  text-align: center;
  padding: 1rem;
  border-top: 1px solid #e4e7ed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
