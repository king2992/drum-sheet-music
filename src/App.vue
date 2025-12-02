<script setup lang="ts">
import { ref } from 'vue'
import DrumEditor from './components/DrumEditor.vue'
import DrumPreview from './components/DrumPreview.vue'

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

    <!-- 메인 컨텐츠 -->
    <main class="app-main">
      <div class="content-wrapper">
        <!-- 왼쪽: 악보 에디터 -->
        <div class="editor-panel">
          <DrumEditor />
        </div>
        
        <!-- 오른쪽: 미리보기 -->
        <div class="preview-panel">
          <DrumPreview />
        </div>
      </div>
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
  max-width: 100%;
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
  width: 100%;
  margin: 0;
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

/* 메인 컨텐츠 */
.app-main {
  flex: 1;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
}

.content-wrapper {
  display: flex;
  height: calc(100vh - 64px - 60px); /* 헤더와 푸터 높이 제외 */
  gap: 0;
  width: 100%;
  max-width: 100%;
}

.editor-panel {
  flex: 0 0 35%;
  overflow-y: auto;
  background: #f9f9f9;
  border-right: 1px solid #e0e0e0;
}

.preview-panel {
  flex: 1;
  overflow: hidden;
  background: #ffffff;
  padding: 0;
  width: 100%;
}

/* 푸터 */
.app-footer {
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 20px 24px;
  margin-top: auto;
}

.footer-content {
  width: 100%;
  margin: 0;
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
