<script setup lang="ts">
import type { Section } from '@/types/drum'

const props = defineProps<{
  section: Section
  isFirst?: boolean
}>()
</script>

<template>
  <div v-if="isFirst" class="section-label">
    <span class="label-text">{{ section.label }}</span>
  </div>
</template>

<style scoped>
.section-label {
  display: flex;
  align-items: center;
  padding-right: 16px;
  min-width: 100px;
  font-weight: bold;
  font-size: 14px;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.label-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
}
</style>

