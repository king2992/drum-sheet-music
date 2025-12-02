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
  measureNumber?: number
}>()

const emit = defineEmits<{
  toggleNote: [part: DrumPart, beat: number]
  toggleRest: [beat: number]
  removeMeasure: []
  clearMeasure: []
  toggleRepeatStart: []
  toggleRepeatEnd: []
  changeTimeSignature: [beats: number, noteValue: number]
  duplicateMeasure: []
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

// 박자 변경 다이얼로그
const showTimeSignatureDialog = ref(false)
const newBeats = ref(4)
const newNoteValue = ref(4)

function openTimeSignatureDialog() {
  newBeats.value = props.measure.timeSignature.beats
  newNoteValue.value = props.measure.timeSignature.noteValue
  showTimeSignatureDialog.value = true
}

function applyTimeSignature() {
  emit('changeTimeSignature', newBeats.value, newNoteValue.value)
  showTimeSignatureDialog.value = false
}

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
    <!-- 마디 번호 -->
    <div v-if="measureNumber" class="measure-number">{{ measureNumber }}</div>

    <div class="measure-container">
      <!-- 섹션 레이블 (첫 번째 마디일 때만) -->
      <div v-if="isFirstInSection && section" class="section-label-wrapper">
        <div class="section-label-text">{{ section.label }}</div>
      </div>

      <!-- 박자표 -->
      <div class="time-signature-wrapper">
        <span class="time-signature" @click="openTimeSignatureDialog" :title="'박자 변경 (현재: ' + timeSignatureText + ')'">
          {{ timeSignatureText }}
        </span>
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
          @click="emit('duplicateMeasure')"
          class="control-btn copy-btn"
          title="마디 복사"
        >
          📋
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

    <!-- 박자 변경 다이얼로그 -->
    <div v-if="showTimeSignatureDialog" class="dialog-overlay" @click="showTimeSignatureDialog = false">
      <div class="dialog" @click.stop>
        <h3>박자 변경</h3>
        <div class="dialog-content">
          <div class="form-group">
            <label>분자 (박자 수):</label>
            <input v-model.number="newBeats" type="number" min="1" max="16" />
          </div>
          <div class="form-group">
            <label>분모 (기준 음표):</label>
            <select v-model.number="newNoteValue">
              <option :value="2">2 (2분음표 기준)</option>
              <option :value="4">4 (4분음표 기준)</option>
              <option :value="8">8 (8분음표 기준)</option>
              <option :value="16">16 (16분음표 기준)</option>
            </select>
          </div>
        </div>
        <div class="dialog-actions">
          <button @click="showTimeSignatureDialog = false" class="btn btn-cancel">취소</button>
          <button @click="applyTimeSignature" class="btn btn-apply">적용</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drum-measure {
  position: relative;
  display: flex;
  background: #f9f9f9;
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

.measure-number {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 11px;
  font-weight: bold;
  color: #999;
  background: white;
  padding: 2px 6px;
  border-radius: 3px;
  border: 1px solid #ddd;
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
  min-width: 70px;
  padding-right: 12px;
}

.section-label-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  font-weight: 900;
  font-size: 14px;
  color: #1976d2;
  text-transform: uppercase;
  letter-spacing: 2px;
  padding: 8px 4px;
  background: linear-gradient(to right, #e3f2fd, transparent);
  border-left: 4px solid #1976d2;
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
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.time-signature:hover {
  background: #e3f2fd;
  color: #1976d2;
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

.copy-btn {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}

.copy-btn:hover {
  background: #45a049;
  border-color: #45a049;
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

/* 다이얼로그 스타일 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog {
  background: white;
  border-radius: 8px;
  padding: 24px;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dialog h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.form-group input,
.form-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #999;
  color: white;
}

.btn-cancel:hover {
  background: #777;
}

.btn-apply {
  background: #1976d2;
  color: white;
}

.btn-apply:hover {
  background: #1565c0;
}
</style>
