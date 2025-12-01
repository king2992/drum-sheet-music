<script setup lang="ts">
import DrumEditor from './components/DrumEditor.vue'
</script>

<template>
  <div class="app">
    <DrumEditor />
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
  background: #f9f9f9;
  color: #333;
}

.app {
  min-height: 100vh;
}
</style>
