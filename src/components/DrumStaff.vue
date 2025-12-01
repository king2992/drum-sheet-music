<script setup lang="ts">
import { computed } from 'vue'
import type { Measure, DrumNote, Rest } from '@/types/drum'
import { DrumPart, NoteStyle } from '@/types/drum'
import { useDrumSheetStore } from '@/stores/drumSheet'
import DrumNoteSymbol from './DrumNoteSymbol.vue'
import RestSymbol from './RestSymbol.vue'

const props = defineProps<{
  measure: Measure
  width?: number
}>()

const emit = defineEmits<{
  noteClick: [part: DrumPart, beat: number]
  restClick: [beat: number]
}>()

const store = useDrumSheetStore()

// 5선 보표 설정
const STAFF_LINES = 5
const LINE_SPACING = 20 // 선 간격
const STAFF_HEIGHT = LINE_SPACING * (STAFF_LINES - 1)
const STAFF_WIDTH = props.width || 200
const STAFF_PADDING = LINE_SPACING * 2 // 위아래 여유 공간

// 드럼 파트별 Y 위치 (보표 시작점 기준, 절대 위치)
// 하이햇 = 맨 위, 킥 = 1선과 2선 사이로 고정
// 보표 시작점 = 0, 1선 = LINE_SPACING * 4 = 80, 2선 = LINE_SPACING * 3 = 60
// 음표 렌더링 시 partPositions[note.part] + STAFF_HEIGHT / 2를 사용하므로
// partPositions는 보표 중심(40)을 기준으로 한 상대 위치
// 표준 드럼 악보 표기법에 맞춘 위치
// 5선 = 0, 4선 = 20, 3선 = 40, 2선 = 60, 1선 = 80
// 보표 중심 = 40, 음표 렌더링 시 +40을 더하므로 상대 위치로 계산
// 표준 드럼 악보 위치 (5선지)
// 보표선: 5선=0, 4선=20, 3선=40, 2선=60, 1선=80 (위에서 아래로)
// 보표 중심: STAFF_HEIGHT / 2 = 40
// 음표 렌더링: partPositions[part] + STAFF_HEIGHT / 2
//
// 표준 위치 (사용자 가이드):
//      x      x   ← Crash, Hi-Hat (5선 위 보조선)
// ----- 5선 -----  (y=0)
//      x           ← Ride (5선 위)
//   ●              ← 스몰탐 (Small Tom, 4-5선 사이 공간)
// ----- 4선 -----  (y=20)
//   ●              ← 미들탐 (Mid Tom, 4선 위)
//      ●           ← 스네어 (Snare, 3-4선 사이 공간)
// ----- 3선 -----  (y=40)
//   ●              ← 플로어탐 (Floor Tom, 2-3선 사이 공간)
// ----- 2선 -----  (y=60)
//
// ----- 1선 -----  (y=80)
//   ●              ← Bass Drum (베이스드럼, 1-2선 사이 공간)
const partPositions: Record<DrumPart, number> = {
  [DrumPart.CRASH]: -LINE_SPACING * 0.5 - STAFF_HEIGHT / 2,  // 5선 위 보조선 (y=-10) → -50
  [DrumPart.RIDE]: LINE_SPACING * 0 - STAFF_HEIGHT / 2,      // 5선 (y=0) → -40
  [DrumPart.HI_HAT]: -LINE_SPACING * 0.5 - STAFF_HEIGHT / 2,  // 5선 위 보조선 (y=-10) → -50
  [DrumPart.HIGH_TOM]: LINE_SPACING * 0.5 - STAFF_HEIGHT / 2, // 4-5선 사이 (y=10) → -30 (스몰탐)
  [DrumPart.MID_TOM]: LINE_SPACING * 1 - STAFF_HEIGHT / 2,    // 4선 (y=20) → -20 (미들탐)
  [DrumPart.SNARE]: LINE_SPACING * 1.5 - STAFF_HEIGHT / 2,    // 3-4선 사이 (y=30) → -10 (스네어)
  [DrumPart.LOW_TOM]: LINE_SPACING * 2.5 - STAFF_HEIGHT / 2,  // 2-3선 사이 (y=50) → 10 (플로어탐)
  [DrumPart.BASS]: LINE_SPACING * 3.5 - STAFF_HEIGHT / 2,     // 1-2선 사이 (y=70) → 30 (베이스드럼)
}

// 마디 내 비트 위치 계산
const beatPositions = computed(() => {
  const { beats } = props.measure.timeSignature
  const positions: number[] = []
  const beatWidth = STAFF_WIDTH / beats
  
  for (let i = 0; i <= beats; i++) {
    positions.push(i * beatWidth)
  }
  
  return positions
})

// 드럼 파트 우선순위 (위에서 아래로)
const partOrder: DrumPart[] = [
  DrumPart.HI_HAT,
  DrumPart.CRASH,
  DrumPart.RIDE,
  DrumPart.HIGH_TOM,
  DrumPart.MID_TOM,
  DrumPart.LOW_TOM,
  DrumPart.SNARE,
  DrumPart.BASS,
]

// 음표를 비트별로 그룹화하고 파트 순서대로 정렬
const notesByBeat = computed(() => {
  const grouped = new Map<string, DrumNote[]>()
  props.measure.notes.forEach((note) => {
    // 소수점 2자리까지 반올림하여 그룹화
    const beatKey = note.beat.toFixed(2)
    if (!grouped.has(beatKey)) {
      grouped.set(beatKey, [])
    }
    grouped.get(beatKey)!.push(note)
  })
  
  // 각 비트별로 드럼 파트 순서대로 정렬
  grouped.forEach((notes, beatKey) => {
    notes.sort((a, b) => {
      const indexA = partOrder.indexOf(a.part)
      const indexB = partOrder.indexOf(b.part)
      return indexA - indexB
    })
  })
  
  return grouped
})

// 쉼표을 비트별로 그룹화
const restsByBeat = computed(() => {
  const grouped = new Map<string, Rest[]>()
  props.measure.rests.forEach((rest) => {
    const beatKey = rest.beat.toFixed(2)
    if (!grouped.has(beatKey)) {
      grouped.set(beatKey, [])
    }
    grouped.get(beatKey)!.push(rest)
  })
  return grouped
})

// 비트 위치에서 X 좌표 계산
function getBeatX(beat: number): number {
  const { beats } = props.measure.timeSignature
  const beatWidth = STAFF_WIDTH / beats
  return beat * beatWidth
}

// 클릭 핸들러
function handleStaffClick(event: MouseEvent) {
  const svg = event.currentTarget as SVGElement
  const rect = svg.getBoundingClientRect()
  
  // SVG 좌표계로 변환 (transform translate 고려)
  const svgPoint = svg.createSVGPoint()
  svgPoint.x = event.clientX - rect.left
  svgPoint.y = event.clientY - rect.top
  
  // transform translate(20, 30 + STAFF_PADDING) 고려
  const x = svgPoint.x - 20
  const y = svgPoint.y - (30 + STAFF_PADDING)
  
  // 보표 영역 내인지 확인 (위아래 여유 공간 포함)
  if (x < 0 || x > STAFF_WIDTH || y < -STAFF_PADDING || y > STAFF_HEIGHT + STAFF_PADDING) {
    return
  }
  
  // 가장 가까운 비트 찾기 (소수점 포함)
  const { beats } = props.measure.timeSignature
  const beatWidth = STAFF_WIDTH / beats
  // 정확한 beat 위치 계산 (소수점 2자리까지)
  const exactBeat = x / beatWidth
  // 16분음표 단위로 반올림 (0, 0.25, 0.5, 0.75, 1, ..., 3.75까지 가능)
  const beat = Math.max(0, Math.min(beats - 0.25, Math.round(exactBeat * 4) / 4))
  
  // 클릭 위치를 보표 중심 기준 상대 위치로 변환
  // y는 보표 시작점 기준이므로, 보표 중심 기준으로 변환
  const centerY = STAFF_HEIGHT / 2
  const relativeY = y - centerY
  
  let closestPart: DrumPart | null = null
  let minDistance = Infinity
  const threshold = LINE_SPACING * 0.6 // 허용 거리
  
  // 모든 드럼 파트 중에서 클릭 위치와 가장 가까운 파트 찾기
  Object.entries(partPositions).forEach(([part, pos]) => {
    const distance = Math.abs(relativeY - pos)
    if (distance < minDistance) {
      minDistance = distance
      closestPart = part as DrumPart
    }
  })
  
  // 선택된 드럼 파트가 있으면 해당 파트 위치와 가까운지 확인
  if (store.selectedDrumPart !== null) {
    const selectedPartPosition = partPositions[store.selectedDrumPart]
    const distance = Math.abs(relativeY - selectedPartPosition)
    
    // 선택된 드럼 파트 위치와 가까운지 확인
    if (distance <= threshold) {
      // 선택된 드럼 파트 위치 근처를 클릭했으면 해당 파트로 추가
      emit('noteClick', store.selectedDrumPart, beat)
    }
    // 선택된 드럼 파트 위치가 아니면 추가하지 않음 (거리가 임계값을 초과)
  } else {
    // 자동 모드: 가장 가까운 드럼 파트가 임계값 이내에 있으면 추가
    if (closestPart !== null && minDistance <= threshold) {
      emit('noteClick', closestPart, beat)
    }
  }
}

function handleRestClick(beat: number) {
  emit('restClick', beat)
}
</script>

<template>
  <svg
    :width="STAFF_WIDTH + 40"
    :height="STAFF_HEIGHT + STAFF_PADDING * 2 + 60"
    class="drum-staff"
    @click="handleStaffClick"
  >
    <!-- 5선 보표 -->
    <g :transform="`translate(20, ${30 + STAFF_PADDING})`">
      <!-- 보표선 -->
      <line
        v-for="i in STAFF_LINES"
        :key="i"
        :x1="0"
        :y1="(i - 1) * LINE_SPACING"
        :x2="STAFF_WIDTH"
        :y2="(i - 1) * LINE_SPACING"
        stroke="#000"
        stroke-width="1.5"
      />
      
      <!-- 마디 구분선 -->
      <line
        :x1="STAFF_WIDTH"
        :y1="0"
        :x2="STAFF_WIDTH"
        :y2="STAFF_HEIGHT"
        stroke="#000"
        stroke-width="2"
      />
      
      <!-- 박자 구분선 -->
      <line
        v-for="(x, index) in beatPositions.slice(1, -1)"
        :key="index"
        :x1="x"
        :y1="0"
        :x2="x"
        :y2="STAFF_HEIGHT"
        stroke="#999"
        stroke-width="1"
        stroke-dasharray="2,2"
      />
      
      <!-- 음표 렌더링 - 각 드럼 파트의 고정된 위치에 배치 -->
      <g v-for="[beatKey, notes] in notesByBeat" :key="beatKey">
        <g v-for="note in notes" :key="note.id">
          <!-- 보조선 (5선 위: Crash, Hi-Hat만) -->
          <line
            v-if="note.part === DrumPart.CRASH || note.part === DrumPart.HI_HAT"
            :x1="getBeatX(note.beat) - 12"
            :y1="partPositions[note.part] + STAFF_HEIGHT / 2"
            :x2="getBeatX(note.beat) + 12"
            :y2="partPositions[note.part] + STAFF_HEIGHT / 2"
            stroke="#000"
            stroke-width="1.5"
          />
          <DrumNoteSymbol
            :note="note"
            :x="getBeatX(note.beat)"
            :y="partPositions[note.part] + STAFF_HEIGHT / 2"
          />
        </g>
      </g>
      
      <!-- 쉼표 렌더링 -->
      <g v-for="[beatKey, rests] in restsByBeat" :key="beatKey">
        <RestSymbol
          v-for="(rest, index) in rests"
          :key="rest.id"
          :rest="rest"
          :x="getBeatX(rest.beat)"
          :y="STAFF_HEIGHT / 2"
          :offset-x="index * 15"
        />
      </g>
      
      <!-- 반복 기호 -->
      <g v-if="measure.hasRepeatStart">
        <line
          :x1="0"
          :y1="0"
          :x2="0"
          :y2="STAFF_HEIGHT"
          stroke="#000"
          stroke-width="3"
        />
        <circle
          :cx="0"
          :cy="STAFF_HEIGHT / 2"
          r="4"
          fill="#000"
        />
        <circle
          :cx="0"
          :cy="STAFF_HEIGHT / 2"
          r="6"
          fill="none"
          stroke="#000"
          stroke-width="1"
        />
      </g>
      
      <g v-if="measure.hasRepeatEnd">
        <line
          :x1="STAFF_WIDTH"
          :y1="0"
          :x2="STAFF_WIDTH"
          :y2="STAFF_HEIGHT"
          stroke="#000"
          stroke-width="3"
        />
        <circle
          :cx="STAFF_WIDTH"
          :cy="STAFF_HEIGHT / 2"
          r="4"
          fill="#000"
        />
        <circle
          :cx="STAFF_WIDTH"
          :cy="STAFF_HEIGHT / 2"
          r="6"
          fill="none"
          stroke="#000"
          stroke-width="1"
        />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.drum-staff {
  cursor: crosshair;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.drum-staff:hover {
  background: #fafafa;
}
</style>

