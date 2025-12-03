<script setup lang="ts">
import { ref } from 'vue'
import DrumEditor from './components/DrumEditor.vue'

const isLoggedIn = ref(false)
const userName = ref('사용자')
</script>

<template>
  <div class="app">
    <!-- 헤더 -->
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="logo">🥁 드럼 악보</h1>
          <nav class="main-nav">
            <a href="#" class="nav-link active">홈</a>
            <a href="#" class="nav-link">내 악보</a>
            <a href="#" class="nav-link">공유 악보</a>
            <a href="#" class="nav-link">도움말</a>
          </nav>
        </div>
        <div class="header-right">
          <div v-if="isLoggedIn" class="user-info">
            <span class="user-name">{{ userName }}</span>
            <button class="btn-logout">로그아웃</button>
          </div>
          <div v-else class="auth-buttons">
            <button class="btn-login">로그인</button>
            <button class="btn-signup">회원가입</button>
          </div>
        </div>
      </div>
    </header>

    <!-- 메인 컨텐츠 (풀사이즈 에디터) -->
    <main class="app-main">
      <DrumEditor />
    </main>

    <!-- 푸터 -->
    <footer class="app-footer">
      <div class="footer-content">
        <p>&copy; 2024 드럼 악보 에디터. All rights reserved.</p>
        <div class="footer-links">
          <a href="#">이용약관</a>
          <a href="#">개인정보처리방침</a>
          <a href="#">문의하기</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f5f5;
  color: #333;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

/* 헤더 */
.app-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1800px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  color: #1976d2;
  margin: 0;
}

.main-nav {
  display: flex;
  gap: 24px;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  font-size: 14px;
  transition: color 0.2s;
  padding: 8px 0;
}

.nav-link:hover {
  color: #1976d2;
}

.nav-link.active {
  color: #1976d2;
  border-bottom: 2px solid #1976d2;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.btn-login,
.btn-signup,
.btn-logout {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-login {
  background: transparent;
  color: #1976d2;
}

.btn-login:hover {
  background: #e3f2fd;
}

.btn-signup {
  background: #1976d2;
  color: white;
}

.btn-signup:hover {
  background: #1565c0;
}

.btn-logout {
  background: #f5f5f5;
  color: #666;
}

.btn-logout:hover {
  background: #e0e0e0;
}

/* 메인 컨텐츠 - 풀사이즈 */
.app-main {
  flex: 1;
  width: 100%;
  overflow-y: auto;
}

/* 푸터 */
.app-footer {
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 20px 24px;
  margin-top: auto;
}

.footer-content {
  max-width: 1800px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-links a {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #1976d2;
}
</style>
