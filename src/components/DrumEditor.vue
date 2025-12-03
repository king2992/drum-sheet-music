<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useDrumSheetStore } from '@/stores/drumSheet'
import DrumMeasure from './DrumMeasure.vue'
import type { DrumPart } from '@/types/drum'
import { NoteValue, RestValue, SectionType, DrumPart as DrumPartEnum, DynamicType, HairpinType } from '@/types/drum'

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
  // Ctrl+S: 저장
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault()
    store.saveToFile()
  }
  // Ctrl+O: 열기
  if (event.ctrlKey && event.key === 'o') {
    event.preventDefault()
    triggerFileInput()
  }
  // Ctrl+N: 새 악보
  if (event.ctrlKey && event.key === 'n') {
    event.preventDefault()
    handleNewSheet()
  }
  // G: Ghost Note 모드 토글
  if (event.key === 'g' && !event.ctrlKey && !event.metaKey && !event.altKey) {
    if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
      event.preventDefault()
      store.toggleGhostNoteMode()
    }
  }
  // A: Accent 모드 토글
  if (event.key === 'a' && !event.ctrlKey && !event.metaKey && !event.altKey) {
    if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
      event.preventDefault()
      store.toggleAccentMode()
    }
  }
  // 숫자 키 (1-5): 음표 길이 선택
  if (['1', '2', '3', '4', '5'].includes(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
    if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
      event.preventDefault()
      const noteValueMap: Record<string, NoteValue> = {
        '1': NoteValue.WHOLE,
        '2': NoteValue.HALF,
        '3': NoteValue.QUARTER,
        '4': NoteValue.EIGHTH,
        '5': NoteValue.SIXTEENTH,
      }
      store.setSelectedNoteValue(noteValueMap[event.key])
    }
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

// 파일 업로드 핸들러
const fileInput = ref<HTMLInputElement | null>(null)

function handleLoadFile(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    store.loadFromFile(file)
      .then(() => {
        alert('악보를 불러왔습니다!')
      })
      .catch((error) => {
        alert('파일을 읽는 중 오류가 발생했습니다: ' + error.message)
      })
  }
  // 같은 파일을 다시 선택할 수 있도록 value 초기화
  if (target) {
    target.value = ''
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleNewSheet() {
  if (confirm('새 악보를 시작하시겠습니까? 저장하지 않은 내용은 사라집니다.')) {
    store.newSheet()
  }
}

function handlePrint() {
  window.print()
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

// 다이나믹 타입 목록
const dynamicTypes = [
  { type: DynamicType.PP, label: 'pp (매우 여리게)' },
  { type: DynamicType.P, label: 'p (여리게)' },
  { type: DynamicType.MP, label: 'mp (조금 여리게)' },
  { type: DynamicType.MF, label: 'mf (조금 세게)' },
  { type: DynamicType.F, label: 'f (세게)' },
  { type: DynamicType.FF, label: 'ff (매우 세게)' },
]

// 헤어핀 타입 목록
const hairpinTypes = [
  { type: HairpinType.CRESCENDO, label: '크레센도 (<)', symbol: '<' },
  { type: HairpinType.DECRESCENDO, label: '디크레센도 (>)', symbol: '>' },
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

// 마디 추가 (박자표 설정 제거)
function addMeasureDirectly() {
  store.addMeasure()
}

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
    <!-- 상단 툴바 - 모든 컨트롤 통합 -->
    <div class="top-toolbar">
      <!-- 파일 관리 -->
      <div class="toolbar-group">
        <button @click="handleNewSheet" class="btn btn-sm" title="새 악보">📄</button>
        <button @click="triggerFileInput" class="btn btn-sm" title="열기">📂</button>
        <button @click="store.saveToFile()" class="btn btn-sm" title="저장">💾</button>
        <button @click="handlePrint" class="btn btn-sm" title="인쇄">🖨️</button>
        <input ref="fileInput" type="file" accept=".json" @change="handleLoadFile" style="display: none" />
      </div>

      <div class="toolbar-divider"></div>

      <!-- Undo/Redo -->
      <div class="toolbar-group">
        <button @click="store.undo()" :disabled="!store.canUndo" class="btn btn-sm" title="실행 취소 (Ctrl+Z)">↶</button>
        <button @click="store.redo()" :disabled="!store.canRedo" class="btn btn-sm" title="다시 실행 (Ctrl+Y)">↷</button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 음표 길이 -->
      <div class="toolbar-group">
        <label class="toolbar-label">음표:</label>
        <select :value="store.selectedNoteValue" @change="store.setSelectedNoteValue(Number(($event.target as HTMLSelectElement).value))" class="select-sm">
          <option v-for="nv in noteValues" :key="nv.value" :value="nv.value">{{ nv.symbol }} {{ nv.label }}</option>
        </select>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 드럼 파트 -->
      <div class="toolbar-group">
        <label class="toolbar-label">드럼:</label>
        <button
          v-for="dp in drumParts"
          :key="dp.part"
          @click="store.setSelectedDrumPart(store.selectedDrumPart === dp.part ? null : dp.part)"
          :class="['btn', 'btn-sm', 'drum-btn', { active: store.selectedDrumPart === dp.part }]"
          :title="dp.label"
        >{{ dp.shortLabel }}</button>
        <button @click="store.setSelectedDrumPart(null)" :class="['btn', 'btn-sm', 'drum-btn', { active: store.selectedDrumPart === null }]" title="자동">Auto</button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 모드 -->
      <div class="toolbar-group">
        <button @click="store.toggleGhostNoteMode()" :class="['btn', 'btn-sm', { active: store.isGhostNoteMode }]" title="Ghost Note (G)">👻</button>
        <button @click="store.toggleAccentMode()" :class="['btn', 'btn-sm', { active: store.isAccentMode }]" title="Accent (A)">▶</button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 다이나믹 -->
      <div class="toolbar-group">
        <button
          v-for="dt in dynamicTypes"
          :key="dt.type"
          @click="store.setSelectedDynamicType(store.selectedDynamicType === dt.type ? null : dt.type)"
          :class="['btn', 'btn-sm', 'dynamic-btn', { active: store.selectedDynamicType === dt.type }]"
          :title="dt.label"
        >{{ dt.type }}</button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 마디 관리 -->
      <div class="toolbar-group">
        <button @click="addMeasureDirectly" class="btn btn-sm btn-primary">➕ 마디</button>
        <button @click="openSectionDialog" class="btn btn-sm">📑 섹션</button>
      </div>
    </div>

    <!-- 악보 제목 (컴팩트) -->
    <div class="sheet-info">
      <div class="sheet-title-compact">
        <input
          type="text"
          :value="store.drumSheet.title"
          @input="store.setTitle(($event.target as HTMLInputElement).value)"
          class="title-input-inline"
          placeholder="곡 제목"
        />
        <input
          type="text"
          :value="store.drumSheet.artist || ''"
          @input="store.setArtist(($event.target as HTMLInputElement).value)"
          class="artist-input-inline"
          placeholder="아티스트"
        />
      </div>
      <div class="tempo-compact">
        <span>♩ =</span>
        <input
          type="number"
          :value="store.drumSheet.tempo"
          @input="store.setTempo(Number(($event.target as HTMLInputElement).value))"
          min="40"
          max="240"
          class="tempo-input-inline"
        />
        <span>BPM</span>
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
          :width="300"
          @toggle-note="(part, beat) => handleToggleNote(measure.id, part, beat)"
          @toggle-rest="(beat) => handleToggleRest(measure.id, beat)"
          @clear-measure="() => store.clearMeasure(measure.id)"
          @toggle-repeat-start="handleToggleRepeatStart(measure.id)"
          @toggle-repeat-end="handleToggleRepeatEnd(measure.id)"
          @remove-measure="() => store.removeMeasure(measure.id)"
          @change-time-signature="(beats, noteValue) => store.setTimeSignature(measure.id, beats, noteValue)"
          @duplicate-measure="() => store.duplicateMeasure(measure.id)"
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

    <!-- 사용 방법 (축소) -->
    <details class="instructions">
      <summary style="cursor: pointer; font-weight: 600; margin-bottom: 12px;">📖 사용 방법 (클릭하여 펼치기)</summary>
      <h3>📖 기본 사용법</h3>
      <ul>
        <li><strong>드럼 파트 선택:</strong> 상단의 드럼 파트 버튼(크래시, 라이드, 하이햇, 탐, 스네어, 베이스 등)을 클릭하여 원하는 드럼을 선택하세요. "자동" 모드에서는 클릭 위치에 따라 자동으로 드럼이 선택됩니다.</li>
        <li><strong>음표 추가:</strong> 드럼 파트를 선택한 후 5선 보표를 클릭하여 음표를 추가하거나 삭제할 수 있습니다</li>
        <li><strong>음표 길이:</strong> 상단의 "음표 길이" 드롭다운에서 원하는 음표 길이(온음표, 2분음표, 4분음표, 8분음표, 16분음표)를 선택하세요</li>
        <li><strong>쉼표 추가:</strong> 마디 컨트롤의 쉼표 버튼(𝄽)을 활성화한 후 보표를 클릭하세요</li>
        <li><strong>마디 관리:</strong> 툴바의 "➕ 마디 추가" 버튼으로 새 마디를 추가하고, 각 마디의 × 버튼으로 삭제할 수 있습니다</li>
        <li><strong>마디 초기화:</strong> 마디 컨트롤의 🗑️ 버튼으로 해당 마디의 모든 음표를 삭제할 수 있습니다</li>
      </ul>

      <h3>🎵 고급 기능</h3>
      <ul>
        <li><strong>Ghost Note (유령 음표):</strong> 👻 버튼을 활성화하면 괄호로 둘러싸인 작은 음표가 추가됩니다 (약하게 연주)</li>
        <li><strong>Accent (강세):</strong> ▶ 버튼을 활성화하면 > 기호가 표시된 강한 음표가 추가됩니다</li>
        <li><strong>다이나믹 표시:</strong> pp, p, mp, mf, f, ff 버튼을 선택한 후 보표를 클릭하여 음량 표시를 추가할 수 있습니다</li>
        <li><strong>음표 연결선 (Beam):</strong> 연속된 8분음표나 16분음표는 자동으로 연결선(빔)으로 표시됩니다</li>
        <li><strong>섹션 구분:</strong> "📑 섹션 추가" 버튼으로 Intro, Verse, Chorus, Bridge 등의 섹션을 만들어 악보를 구조화할 수 있습니다</li>
        <li><strong>반복 기호:</strong> 마디 컨트롤의 ⟲(반복 시작) 또는 ⟳(반복 끝) 버튼으로 전문적인 반복 기호를 추가할 수 있습니다</li>
      </ul>

      <h3>💾 파일 관리</h3>
      <ul>
        <li><strong>악보 저장:</strong> 💾 저장 버튼 또는 Ctrl+S로 JSON 파일로 저장할 수 있습니다</li>
        <li><strong>악보 불러오기:</strong> 📂 열기 버튼 또는 Ctrl+O로 저장된 악보를 불러올 수 있습니다</li>
        <li><strong>새 악보:</strong> 📄 새 악보 버튼 또는 Ctrl+N으로 새로운 악보를 시작할 수 있습니다</li>
        <li><strong>악보 인쇄:</strong> 🖨️ 인쇄 버튼으로 인쇄 최적화된 악보를 출력할 수 있습니다</li>
        <li><strong>실행 취소/다시 실행:</strong> ↶/↷ 버튼 또는 Ctrl+Z/Ctrl+Y (최대 50단계)</li>
      </ul>

      <h3>⌨️ 키보드 단축키</h3>
      <ul class="shortcuts">
        <li><kbd>Ctrl</kbd> + <kbd>S</kbd> : 악보 저장</li>
        <li><kbd>Ctrl</kbd> + <kbd>O</kbd> : 악보 열기</li>
        <li><kbd>Ctrl</kbd> + <kbd>N</kbd> : 새 악보</li>
        <li><kbd>Ctrl</kbd> + <kbd>Z</kbd> : 실행 취소</li>
        <li><kbd>Ctrl</kbd> + <kbd>Y</kbd> : 다시 실행</li>
        <li><kbd>G</kbd> : Ghost Note 모드 토글</li>
        <li><kbd>A</kbd> : Accent 모드 토글</li>
        <li><kbd>1</kbd> ~ <kbd>5</kbd> : 음표 길이 선택</li>
      </ul>

      <h3>💡 팁</h3>
      <ul>
        <li>8분음표와 16분음표는 연속으로 배치하면 자동으로 빔(연결선)으로 표시됩니다</li>
        <li>마디 번호는 자동으로 표시되며 줄바꿈도 자동으로 처리됩니다</li>
        <li>다이나믹 표시는 Georgia 세리프 이탤릭체로 전문적으로 렌더링됩니다</li>
        <li>모든 변경사항은 실행 취소 히스토리에 저장되어 안전하게 작업할 수 있습니다</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
.drum-editor {
  max-width: 1800px;
  margin: 0 auto;
  padding: 0;
  background: #f9f9f9;
  min-height: 100vh;
}

/* 상단 툴바 - 컴팩트 */
.top-toolbar {
  background: white;
  border-bottom: 2px solid #e0e0e0;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  z-index: 50;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-right: 4px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #ddd;
  margin: 0 6px;
}

.btn-sm {
  padding: 6px 10px;
  font-size: 13px;
  min-width: 32px;
}

.select-sm {
  padding: 6px 8px;
  font-size: 13px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.drum-btn {
  min-width: 40px;
}

.dynamic-btn {
  font-family: 'Georgia', serif;
  font-style: italic;
  font-weight: 700;
}

/* 악보 정보 - 컴팩트 */
.sheet-info {
  background: white;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sheet-title-compact {
  display: flex;
  gap: 12px;
  align-items: center;
}

.title-input-inline {
  font-size: 20px;
  font-weight: 700;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 4px 8px;
  background: transparent;
  transition: all 0.2s;
  min-width: 200px;
}

.title-input-inline:hover,
.title-input-inline:focus {
  border-bottom-color: #1976d2;
  outline: none;
  background: #f5f5f5;
}

.artist-input-inline {
  font-size: 14px;
  font-style: italic;
  color: #666;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 4px 8px;
  background: transparent;
  transition: all 0.2s;
  min-width: 150px;
}

.artist-input-inline:hover,
.artist-input-inline:focus {
  border-bottom-color: #1976d2;
  outline: none;
  background: #f5f5f5;
}

.tempo-compact {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #1976d2;
}

.tempo-input-inline {
  width: 60px;
  font-size: 16px;
  font-weight: 700;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  text-align: center;
  color: #1976d2;
}

.controls-section {
  margin-bottom: 16px;
}

.controls {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  background: #f5f5f5;
  padding: 12px;
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
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  min-width: 150px;
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

.btn-file {
  background: #2196f3;
  color: white;
}

.btn-file:hover {
  background: #1976d2;
}

.toolbar-divider {
  width: 1px;
  height: 36px;
  background: #ddd;
  margin: 0 8px;
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

/* 다이나믹 표시 스타일 */
.dynamics-section {
  margin-top: 20px;
  padding: 16px;
  background: #fff3e0;
  border-radius: 8px;
  border: 1px solid #ffb74d;
}

.dynamics-label {
  display: block;
  font-weight: 600;
  color: #555;
  margin-bottom: 12px;
  font-size: 14px;
}

.dynamics-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.dynamics-btn {
  padding: 8px 16px;
  border: 2px solid #ff9800;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 700;
  color: #666;
  font-family: 'Georgia', serif;
  font-style: italic;
}

.dynamics-btn:hover {
  border-color: #f57c00;
  background: #fff3e0;
  color: #e65100;
}

.dynamics-btn.active {
  border-color: #ff9800;
  background: #ff9800;
  color: white;
}

.hairpin-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.hairpin-btn {
  padding: 8px 16px;
  border: 2px solid #ff9800;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 600;
  color: #666;
}

.hairpin-btn:hover {
  border-color: #f57c00;
  background: #fff3e0;
  color: #e65100;
}

.hairpin-btn.active {
  border-color: #ff9800;
  background: #ff9800;
  color: white;
}

.dynamics-hint {
  margin: 0;
  font-size: 12px;
  color: #666;
  font-style: italic;
}

.sheet-container {
  background: #fafafa;
  padding: 20px;
  min-height: calc(100vh - 200px);
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

.time-signature-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-signature-input {
  width: 80px;
  text-align: center;
}

.time-signature-separator {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.time-signature-select {
  width: 100px;
}

.form-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  font-style: italic;
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
  margin-top: 20px;
  padding: 16px;
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #1976d2;
  font-size: 13px;
}

.instructions h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #1976d2;
}

.instructions h3:not(:first-child) {
  margin-top: 32px;
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

.shortcuts {
  list-style: none;
  padding-left: 0 !important;
}

.shortcuts li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  margin-bottom: 6px;
  border: 1px solid #ddd;
}

kbd {
  display: inline-block;
  padding: 3px 8px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #333;
  background: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.1);
  min-width: 28px;
  text-align: center;
}

/* 인쇄 스타일 */
@media print {
  /* 배경색 제거 */
  .drum-editor {
    background: white !important;
    padding: 0 !important;
  }

  /* 컨트롤 요소들 숨기기 */
  .controls-section,
  .toolbar,
  .instructions,
  .control-btn,
  .measure-controls,
  .btn {
    display: none !important;
  }

  /* 악보 제목은 보이게 */
  .sheet-title-section {
    margin-bottom: 16px !important;
    box-shadow: none !important;
    border: none !important;
  }

  /* 악보 컨테이너 최적화 */
  .sheet-container {
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
  }

  /* 마디 스타일 최적화 */
  .drum-measure {
    background: white !important;
    box-shadow: none !important;
    border: none !important;
    page-break-inside: avoid;
  }

  /* 섹션 레이블 보이게 */
  .section-label-wrapper {
    display: flex !important;
  }

  /* 마디 번호 보이게 */
  .measure-number {
    display: block !important;
  }
}
</style>
