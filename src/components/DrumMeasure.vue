<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Measure, Section } from '@/types/drum'
import { DrumPart } from '@/types/drum'
import DrumStaff from './DrumStaff.vue'

const props = defineProps<{
  measure: Measure
  section?: Section
  isFirstInSection?: boolean
  width?: number
}>()

const emit = defineEmits<{
  toggleNote: [part: DrumPart, beat: number]
  toggleRest: [beat: number]
  removeMeasure: []
  clearMeasure: []
  toggleRepeatStart: []
  toggleRepeatEnd: []
}>()

// 박자표 표시
const timeSignatureText = computed(() => {
  const { beats, noteValue } = props.measure.timeSignature
  if (beats === 4 && noteValue === 4) {
    return 'C' // Common time
  }
  return `${beats}/${noteValue}`
})

// 쉼표 모드 토글
const isRestMode = ref(false)

function handleNoteClick(part: DrumPart, beat: number) {
  if (isRestMode.value) {
    emit('toggleRest', beat)
  } else {
    emit('toggleNote', part, beat)
  }
}

function handleRestClick(beat: number) {
  emit('toggleRest', beat)
}
</script>

<template>
  <div class="drum-measure">
    <div class="measure-container">
      <!-- 섹션 레이블 (첫 번째 마디일 때만) -->
      <div v-if="isFirstInSection && section" class="section-label-wrapper">
        <div class="section-label-text">{{ section.label }}</div>
      </div>
      
      <!-- 박자표 -->
      <div class="time-signature-wrapper">
        <span class="time-signature">{{ timeSignatureText }}</span>
      </div>
      
      <!-- 5선 보표 -->
      <div class="staff-wrapper">
        <DrumStaff
          :measure="measure"
          :width="width || 200"
          @note-click="handleNoteClick"
          @rest-click="(beat) => emit('toggleRest', beat)"
        />
      </div>
      
      <!-- 컨트롤 버튼 -->
      <div class="measure-controls">
        <button
          @click="emit('toggleRepeatStart')"
          :class="['control-btn', { active: measure.hasRepeatStart }]"
          title="반복 시작"
        >
          ⟲
        </button>
        <button
          @click="emit('toggleRepeatEnd')"
          :class="['control-btn', { active: measure.hasRepeatEnd }]"
          title="반복 끝"
        >
          ⟳
        </button>
        <button
          @click="isRestMode = !isRestMode"
          :class="['control-btn', { active: isRestMode }]"
          title="쉼표 모드"
        >
          𝄽
        </button>
        <button
          @click="emit('clearMeasure')"
          class="control-btn clear-btn"
          title="마디 초기화"
        >
          🗑️
        </button>
        <button
          @click="emit('removeMeasure')"
          class="control-btn remove-btn"
          title="마디 삭제"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drum-measure {
  display: flex;
  margin-bottom: 24px;
  background: white;
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.measure-container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}

.section-label-wrapper {
  display: flex;
  align-items: center;
  min-width: 60px;
  padding-right: 8px;
}

.section-label-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  font-weight: bold;
  font-size: 12px;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.time-signature-wrapper {
  display: flex;
  align-items: center;
  min-width: 30px;
  padding-right: 8px;
}

.time-signature {
  font-weight: bold;
  font-size: 18px;
  color: #333;
  font-family: 'Times New Roman', serif;
}

.staff-wrapper {
  flex: 1;
  min-width: 0;
}

.measure-controls {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 8px;
}

.control-btn {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #666;
}

.control-btn:hover {
  background: #e0e0e0;
  border-color: #999;
}

.control-btn.active {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
}

.clear-btn {
  background: #ff9800;
  color: white;
  border-color: #ff9800;
}

.clear-btn:hover {
  background: #f57c00;
  border-color: #f57c00;
}

.remove-btn {
  background: #ff4444;
  color: white;
  border-color: #ff4444;
}

.remove-btn:hover {
  background: #cc0000;
  border-color: #cc0000;
}
</style>
