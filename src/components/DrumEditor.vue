<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useDrumSheetStore } from '@/stores/drumSheet'
import DrumMeasure from './DrumMeasure.vue'
import type { DrumPart } from '@/types/drum'
import { NoteValue, RestValue, SectionType, DrumPart as DrumPartEnum } from '@/types/drum'

const store = useDrumSheetStore()

// 키보드 단축키 핸들러
function handleKeyDown(event: KeyboardEvent) {
  // Ctrl+Z: Undo
  if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    store.undo()
  }
  // Ctrl+Y 또는 Ctrl+Shift+Z: Redo
  if ((event.ctrlKey && event.key === 'y') || (event.ctrlKey && event.shiftKey && event.key === 'z')) {
    event.preventDefault()
    store.redo()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const handleToggleNote = (measureId: string, part: DrumPart, beat: number) => {
  store.toggleNote(measureId, part, beat)
}

const handleToggleRest = (measureId: string, beat: number) => {
  store.toggleRest(measureId, beat)
}

const handleToggleRepeatStart = (measureId: string) => {
  const measure = store.drumSheet.measures.find((m) => m.id === measureId)
  if (measure) {
    store.setRepeatStart(measureId, !measure.hasRepeatStart)
  }
}

const handleToggleRepeatEnd = (measureId: string) => {
  const measure = store.drumSheet.measures.find((m) => m.id === measureId)
  if (measure) {
    store.setRepeatEnd(measureId, !measure.hasRepeatEnd)
  }
}

const noteValues = [
  { value: NoteValue.WHOLE, label: '온음표 (1)', symbol: '𝅝' },
  { value: NoteValue.HALF, label: '2분음표 (1/2)', symbol: '𝅗𝅥' },
  { value: NoteValue.QUARTER, label: '4분음표 (1/4)', symbol: '♩' },
  { value: NoteValue.EIGHTH, label: '8분음표 (1/8)', symbol: '♪' },
  { value: NoteValue.SIXTEENTH, label: '16분음표 (1/16)', symbol: '𝅘𝅥𝅯' },
]

const restValues = [
  { value: RestValue.WHOLE, label: '온쉼표 (1)', symbol: '𝄻' },
  { value: RestValue.HALF, label: '2분쉼표 (1/2)', symbol: '𝄼' },
  { value: RestValue.QUARTER, label: '4분쉼표 (1/4)', symbol: '𝄽' },
  { value: RestValue.EIGHTH, label: '8분쉼표 (1/8)', symbol: '𝄾' },
  { value: RestValue.SIXTEENTH, label: '16분쉼표 (1/16)', symbol: '𝄿' },
]

const sectionTypes = [
  { type: SectionType.INTRO, label: 'Intro' },
  { type: SectionType.VERSE, label: 'Verse' },
  { type: SectionType.PRE_CHORUS, label: 'Pre-Chorus' },
  { type: SectionType.CHORUS, label: 'Chorus' },
  { type: SectionType.BRIDGE, label: 'Bridge' },
  { type: SectionType.OUTRO, label: 'Outro' },
  { type: SectionType.SOLO, label: 'Solo' },
]

// 드럼 파트 목록
const drumParts = [
  { part: DrumPartEnum.CRASH, label: '크래시', shortLabel: 'CC', icon: '💥' },
  { part: DrumPartEnum.RIDE, label: '라이드', shortLabel: 'RC', icon: '🔔' },
  { part: DrumPartEnum.HI_HAT, label: '하이햇', shortLabel: 'HH', icon: '🥁' },
  { part: DrumPartEnum.HIGH_TOM, label: '스몰탐', shortLabel: 'ST', icon: '🎵' },
  { part: DrumPartEnum.MID_TOM, label: '미들탐', shortLabel: 'MT', icon: '🎵' },
  { part: DrumPartEnum.LOW_TOM, label: '플로어탐', shortLabel: 'FT', icon: '🎵' },
  { part: DrumPartEnum.SNARE, label: '스네어', shortLabel: 'SD', icon: '🥁' },
  { part: DrumPartEnum.BASS, label: '베이스', shortLabel: 'BD', icon: '🎸' },
]

// 마디별 섹션 정보 계산
const measureWithSections = computed(() => {
  return store.drumSheet.measures.map((measure, index) => {
    const section = store.measureSections.get(measure.id)
    const isFirstInSection = section
      ? store.drumSheet.measures.findIndex((m) => m.sectionId === section.id) === index
      : false
    return {
      measure,
      section,
      isFirstInSection,
    }
  })
})

// 섹션 추가 다이얼로그
const showSectionDialog = ref(false)
const newSectionType = ref<SectionType>(SectionType.VERSE)
const newSectionLabel = ref('')
const selectedMeasureIds = ref<string[]>([])

function openSectionDialog() {
  showSectionDialog.value = true
  selectedMeasureIds.value = []
  newSectionLabel.value = sectionTypes.find((s) => s.type === newSectionType.value)?.label || ''
}

function createSection() {
  if (selectedMeasureIds.value.length > 0 && newSectionLabel.value) {
    store.addSection(newSectionType.value, newSectionLabel.value, selectedMeasureIds.value)
    showSectionDialog.value = false
  }
}

function toggleMeasureSelection(measureId: string) {
  const index = selectedMeasureIds.value.indexOf(measureId)
  if (index === -1) {
    selectedMeasureIds.value.push(measureId)
  } else {
    selectedMeasureIds.value.splice(index, 1)
  }
}
</script>

<template>
  <div class="drum-editor">
    <!-- 헤더 -->
    <div class="editor-header">
      <div class="title-section">
        <h1>드럼 악보 에디터</h1>
        <div class="sheet-title-display">
          <h2 class="main-title">{{ store.drumSheet.title }}</h2>
          <p v-if="store.drumSheet.artist" class="artist-name">{{ store.drumSheet.artist }}</p>
          <p class="tempo-display">J = {{ store.drumSheet.tempo }}</p>
        </div>
      </div>

      <div class="controls">
        <div class="control-group">
          <label>제목:</label>
          <input
            type="text"
            :value="store.drumSheet.title"
            @input="store.setTitle(($event.target as HTMLInputElement).value)"
            class="title-input"
            placeholder="곡 제목"
          />
        </div>

        <div class="control-group">
          <label>아티스트:</label>
          <input
            type="text"
            :value="store.drumSheet.artist || ''"
            @input="store.setArtist(($event.target as HTMLInputElement).value)"
            class="title-input"
            placeholder="아티스트명"
          />
        </div>

        <div class="control-group">
          <label>템포:</label>
          <input
            type="number"
            :value="store.drumSheet.tempo"
            @input="store.setTempo(Number(($event.target as HTMLInputElement).value))"
            min="40"
            max="240"
            class="tempo-input"
          />
          <span>BPM</span>
        </div>

        <div class="control-group">
          <label>음표 길이:</label>
          <select
            :value="store.selectedNoteValue"
            @change="store.setSelectedNoteValue(Number(($event.target as HTMLSelectElement).value))"
            class="note-value-select"
          >
            <option v-for="nv in noteValues" :key="nv.value" :value="nv.value">
              {{ nv.symbol }} {{ nv.label }}
            </option>
          </select>
        </div>

        <div class="control-group">
          <label>쉼표 길이:</label>
          <select
            :value="store.selectedRestValue"
            @change="store.setSelectedRestValue(Number(($event.target as HTMLSelectElement).value))"
            class="note-value-select"
          >
            <option v-for="rv in restValues" :key="rv.value" :value="rv.value">
              {{ rv.symbol }} {{ rv.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- 드럼 파트 선택 -->
      <div class="drum-part-selector">
        <label class="drum-part-label">드럼 파트 선택:</label>
        <div class="drum-part-buttons">
          <button
            v-for="dp in drumParts"
            :key="dp.part"
            @click="store.setSelectedDrumPart(store.selectedDrumPart === dp.part ? null : dp.part)"
            :class="['drum-part-btn', { active: store.selectedDrumPart === dp.part }]"
            :title="dp.label"
          >
            <span class="drum-part-icon">{{ dp.icon }}</span>
            <span class="drum-part-text">{{ dp.shortLabel }}</span>
          </button>
          <button
            @click="store.setSelectedDrumPart(null)"
            :class="['drum-part-btn', 'auto-btn', { active: store.selectedDrumPart === null }]"
            title="자동 선택 (클릭 위치에 따라 자동 선택)"
          >
            <span class="drum-part-text">자동</span>
          </button>
        </div>
        <p class="drum-part-hint">
          <span v-if="store.selectedDrumPart">
            선택됨: {{ drumParts.find(dp => dp.part === store.selectedDrumPart)?.label }}
          </span>
          <span v-else>
            자동 모드: 보표를 클릭하면 위치에 따라 자동으로 드럼 파트가 선택됩니다
          </span>
        </p>
        <!-- Ghost Note 모드 토글 -->
        <div class="ghost-note-toggle">
          <button
            @click="store.toggleGhostNoteMode()"
            :class="['btn', 'btn-ghost', { active: store.isGhostNoteMode }]"
            title="Ghost Note 모드 (약하게 연주하는 음표)"
          >
            👻 Ghost Note {{ store.isGhostNoteMode ? 'ON' : 'OFF' }}
          </button>
        </div>

        <!-- Accent 모드 토글 -->
        <div class="accent-toggle">
          <button
            @click="store.toggleAccentMode()"
            :class="['btn', 'btn-accent', { active: store.isAccentMode }]"
            title="Accent 모드 (강하게 연주하는 음표)"
          >
            ▶ Accent {{ store.isAccentMode ? 'ON' : 'OFF' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 툴바 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button @click="store.addMeasure()" class="btn btn-primary">
          ➕ 마디 추가
        </button>
        <button @click="openSectionDialog" class="btn btn-secondary">
          📑 섹션 추가
        </button>
      </div>
      <div class="toolbar-right">
        <button
          @click="store.undo()"
          :disabled="!store.canUndo"
          class="btn btn-undo"
          title="실행 취소 (Ctrl+Z)"
        >
          ↶ 실행 취소
        </button>
        <button
          @click="store.redo()"
          :disabled="!store.canRedo"
          class="btn btn-redo"
          title="다시 실행 (Ctrl+Y)"
        >
          ↷ 다시 실행
        </button>
      </div>
    </div>

    <!-- 악보 영역 -->
    <div class="sheet-container">
      <div class="measures-grid">
        <DrumMeasure
          v-for="({ measure, section, isFirstInSection }, index) in measureWithSections"
          :key="measure.id"
          :measure="measure"
          :section="section"
          :is-first-in-section="isFirstInSection"
          :measure-number="index + 1"
          :width="240"
          @toggle-note="(part, beat) => handleToggleNote(measure.id, part, beat)"
          @toggle-rest="(beat) => handleToggleRest(measure.id, beat)"
          @clear-measure="() => store.clearMeasure(measure.id)"
          @toggle-repeat-start="handleToggleRepeatStart(measure.id)"
          @toggle-repeat-end="handleToggleRepeatEnd(measure.id)"
          @remove-measure="() => store.removeMeasure(measure.id)"
        />
      </div>
    </div>

    <!-- 섹션 추가 다이얼로그 -->
    <div v-if="showSectionDialog" class="dialog-overlay" @click="showSectionDialog = false">
      <div class="dialog" @click.stop>
        <h3>섹션 추가</h3>
        <div class="dialog-content">
          <div class="form-group">
            <label>섹션 타입:</label>
            <select v-model="newSectionType" @change="newSectionLabel = sectionTypes.find(s => s.type === newSectionType)?.label || ''">
              <option v-for="st in sectionTypes" :key="st.type" :value="st.type">
                {{ st.label }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>레이블:</label>
            <input v-model="newSectionLabel" type="text" placeholder="섹션 레이블" />
          </div>
          <div class="form-group">
            <label>마디 선택:</label>
            <div class="measure-selection">
              <label
                v-for="measure in store.drumSheet.measures"
                :key="measure.id"
                class="measure-checkbox"
              >
                <input
                  type="checkbox"
                  :checked="selectedMeasureIds.includes(measure.id)"
                  @change="toggleMeasureSelection(measure.id)"
                />
                <span>마디 {{ store.drumSheet.measures.indexOf(measure) + 1 }}</span>
              </label>
            </div>
          </div>
        </div>
        <div class="dialog-actions">
          <button @click="showSectionDialog = false" class="btn btn-secondary">취소</button>
          <button @click="createSection" class="btn btn-primary">추가</button>
        </div>
      </div>
    </div>

    <!-- 사용 방법 -->
    <div class="instructions">
      <h3>사용 방법</h3>
      <ul>
        <li><strong>드럼 파트 선택:</strong> 상단의 드럼 파트 버튼(크래시, 라이드, 하이햇, 탐, 스네어, 베이스 등)을 클릭하여 원하는 드럼을 선택하세요. 선택한 드럼으로 음표가 추가됩니다. "자동" 모드에서는 클릭 위치에 따라 자동으로 드럼이 선택됩니다.</li>
        <li><strong>음표 추가:</strong> 드럼 파트를 선택한 후 5선 보표를 클릭하여 음표를 추가하거나 삭제할 수 있습니다</li>
        <li><strong>쉼표 추가:</strong> 마디 컨트롤의 쉼표 버튼(𝄽)을 활성화한 후 보표를 클릭하세요</li>
        <li><strong>음표 길이:</strong> 상단의 "음표 길이" 드롭다운에서 원하는 음표 길이(4분음표, 8분음표 등)를 선택하세요</li>
        <li><strong>마디 초기화:</strong> 마디 컨트롤의 🗑️ 버튼으로 해당 마디의 모든 음표를 삭제할 수 있습니다</li>
        <li><strong>실행 취소/다시 실행:</strong> ↶ 버튼 또는 Ctrl+Z로 실행 취소, ↷ 버튼 또는 Ctrl+Y로 다시 실행할 수 있습니다 (최대 50단계)</li>
        <li><strong>섹션:</strong> "섹션 추가" 버튼으로 Intro, Verse, Chorus 등의 섹션을 만들 수 있습니다</li>
        <li><strong>반복 기호:</strong> 마디 컨트롤의 ⟲(시작) 또는 ⟳(끝) 버튼을 사용하세요</li>
        <li><strong>마디 추가/삭제:</strong> 툴바의 "마디 추가" 버튼과 각 마디의 × 버튼을 사용하세요</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.drum-editor {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
  background: #f9f9f9;
  min-height: 100vh;
}

.editor-header {
  margin-bottom: 32px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title-section {
  margin-bottom: 20px;
}

.editor-header h1 {
  margin-bottom: 16px;
  color: #333;
  font-size: 28px;
}

.sheet-title-display {
  text-align: center;
  padding: 20px;
  background: #fafafa;
  border-radius: 4px;
}

.main-title {
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.artist-name {
  font-size: 18px;
  margin: 0 0 8px 0;
  color: #666;
  text-transform: uppercase;
}

.tempo-display {
  font-size: 16px;
  margin: 0;
  color: #666;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group label {
  font-weight: 600;
  color: #555;
  white-space: nowrap;
}

.title-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 200px;
}

.tempo-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 80px;
}

.note-value-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 180px;
}

.drum-part-selector {
  margin-top: 20px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.drum-part-label {
  display: block;
  font-weight: 600;
  color: #555;
  margin-bottom: 12px;
  font-size: 14px;
}

.drum-part-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.drum-part-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 600;
  color: #666;
}

.drum-part-btn:hover {
  border-color: #1976d2;
  background: #e3f2fd;
  color: #1976d2;
}

.drum-part-btn.active {
  border-color: #1976d2;
  background: #1976d2;
  color: white;
}

.drum-part-btn.auto-btn {
  border-style: dashed;
}

.drum-part-icon {
  font-size: 16px;
}

.drum-part-text {
  white-space: nowrap;
}

.drum-part-hint {
  margin: 0;
  font-size: 12px;
  color: #666;
  font-style: italic;
}

.toolbar {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #1976d2;
  color: white;
}

.btn-primary:hover {
  background: #1565c0;
}

.btn-secondary {
  background: #666;
  color: white;
}

.btn-secondary:hover {
  background: #555;
}

.btn-undo,
.btn-redo {
  background: #4caf50;
  color: white;
}

.btn-undo:hover:not(:disabled),
.btn-redo:hover:not(:disabled) {
  background: #45a049;
}

.btn-undo:disabled,
.btn-redo:disabled {
  background: #ccc;
  color: #666;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-ghost {
  background: #9c27b0;
  color: white;
}

.btn-ghost:hover {
  background: #7b1fa2;
}

.btn-ghost.active {
  background: #6a1b9a;
  box-shadow: 0 0 10px rgba(156, 39, 176, 0.5);
}

.ghost-note-toggle,
.accent-toggle {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ddd;
}

.btn-accent {
  background: #ff5722;
  color: white;
}

.btn-accent:hover {
  background: #e64a19;
}

.btn-accent.active {
  background: #d84315;
  box-shadow: 0 0 10px rgba(255, 87, 34, 0.5);
}

.sheet-container {
  background: white;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.measures-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
  align-items: start;
}

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
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 8px;
  padding: 24px;
  min-width: 500px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.measure-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.measure-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.measure-checkbox:hover {
  background: #e0e0e0;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.instructions {
  margin-top: 32px;
  padding: 20px;
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #1976d2;
}

.instructions h3 {
  margin-top: 0;
  color: #1976d2;
}

.instructions ul {
  margin: 0;
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 8px;
  color: #555;
  line-height: 1.6;
}
</style>
