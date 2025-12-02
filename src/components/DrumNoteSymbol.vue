<script setup lang="ts">
import { computed } from 'vue'
import type { DrumNote } from '@/types/drum'
import { NoteStyle, NoteValue, DrumPart } from '@/types/drum'

const props = defineProps<{
  note: DrumNote
  x: number
  y: number
  offsetX?: number
  offsetY?: number
}>()

const style = computed(() => props.note.style || NoteStyle.DRUM)
const isCymbal = computed(() => style.value === NoteStyle.CYMBAL)

// 심벌 타입 구분
const isCrash = computed(() => props.note.part === DrumPart.CRASH)
const isRide = computed(() => props.note.part === DrumPart.RIDE)
const isHiHat = computed(() => props.note.part === DrumPart.HI_HAT)

// 음표 길이에 따른 스템 길이
const stemLength = computed(() => {
  switch (props.note.value) {
    case NoteValue.SIXTEENTH:
      return 40
    case NoteValue.EIGHTH:
      return 35
    case NoteValue.QUARTER:
      return 30
    case NoteValue.HALF:
      return 30
    default:
      return 25
  }
})

// 음표 크기
const noteSize = computed(() => {
  if (isCymbal.value) return 12
  return 8
})

// 심벌 크기 (파트별로 다르게)
const cymbalSize = computed(() => {
  if (isCrash.value) return 10 // 크래시는 더 크게
  if (isRide.value) return 8   // 라이드는 중간
  return 7                      // 하이햇은 작게
})

const finalX = computed(() => props.x + (props.offsetX || 0))
const finalY = computed(() => props.y + (props.offsetY || 0))
</script>

<template>
  <g :transform="`translate(${finalX}, ${finalY})`">
    <!-- 심벌 (x 모양) -->
    <g v-if="isCymbal">
      <!-- Crash: 괄호로 둘러싼 큰 x -->
      <g v-if="isCrash">
        <!-- 괄호 -->
        <path
          d="M -12,-10 Q -14,0 -12,10"
          fill="none"
          stroke="#000"
          stroke-width="1.5"
        />
        <path
          d="M 12,-10 Q 14,0 12,10"
          fill="none"
          stroke="#000"
          stroke-width="1.5"
        />
        <!-- 큰 X -->
        <line
          :x1="-cymbalSize"
          :y1="-cymbalSize"
          :x2="cymbalSize"
          :y2="cymbalSize"
          stroke="#000"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <line
          :x1="cymbalSize"
          :y1="-cymbalSize"
          :x2="-cymbalSize"
          :y2="cymbalSize"
          stroke="#000"
          stroke-width="2.5"
          stroke-linecap="round"
        />
      </g>
      <!-- Ride: 동그라미 안에 x -->
      <g v-else-if="isRide">
        <circle
          cx="0"
          cy="0"
          r="10"
          fill="none"
          stroke="#000"
          stroke-width="1.5"
        />
        <line
          :x1="-cymbalSize"
          :y1="-cymbalSize"
          :x2="cymbalSize"
          :y2="cymbalSize"
          stroke="#000"
          stroke-width="2"
          stroke-linecap="round"
        />
        <line
          :x1="cymbalSize"
          :y1="-cymbalSize"
          :x2="-cymbalSize"
          :y2="cymbalSize"
          stroke="#000"
          stroke-width="2"
          stroke-linecap="round"
        />
      </g>
      <!-- Hi-Hat: 일반 작은 x -->
      <g v-else>
        <line
          :x1="-cymbalSize"
          :y1="-cymbalSize"
          :x2="cymbalSize"
          :y2="cymbalSize"
          stroke="#000"
          stroke-width="2"
          stroke-linecap="round"
        />
        <line
          :x1="cymbalSize"
          :y1="-cymbalSize"
          :x2="-cymbalSize"
          :y2="cymbalSize"
          stroke="#000"
          stroke-width="2"
          stroke-linecap="round"
        />
        <!-- 오픈 하이햇 표시 -->
        <circle
          v-if="props.note.isOpen"
          cx="0"
          cy="0"
          r="10"
          fill="none"
          stroke="#000"
          stroke-width="1"
          stroke-dasharray="2,2"
        />
      </g>

      <!-- 심벌용 스템과 깃발 -->
      <!-- 2분음표: 스템만 -->
      <line
        v-if="props.note.value === NoteValue.HALF"
        x1="0"
        :y1="cymbalSize + 2"
        x2="0"
        :y2="cymbalSize + 2 + stemLength"
        stroke="#000"
        stroke-width="2"
      />

      <!-- 4분음표: 스템만 -->
      <line
        v-else-if="props.note.value === NoteValue.QUARTER"
        x1="0"
        :y1="cymbalSize + 2"
        x2="0"
        :y2="cymbalSize + 2 + stemLength"
        stroke="#000"
        stroke-width="2"
      />

      <!-- 8분음표: 스템 + 깃발 1개 -->
      <g v-else-if="props.note.value === NoteValue.EIGHTH">
        <line
          x1="0"
          :y1="cymbalSize + 2"
          x2="0"
          :y2="cymbalSize + 2 + stemLength"
          stroke="#000"
          stroke-width="2"
        />
        <path
          :d="`M 0,${cymbalSize + 2 + stemLength} Q 10,${cymbalSize + 2 + stemLength - 5} 8,${cymbalSize + 2 + stemLength - 12}`"
          fill="none"
          stroke="#000"
          stroke-width="2"
          stroke-linecap="round"
        />
      </g>

      <!-- 16분음표: 스템 + 깃발 2개 -->
      <g v-else-if="props.note.value === NoteValue.SIXTEENTH">
        <line
          x1="0"
          :y1="cymbalSize + 2"
          x2="0"
          :y2="cymbalSize + 2 + stemLength"
          stroke="#000"
          stroke-width="2"
        />
        <!-- 깃발 1 -->
        <path
          :d="`M 0,${cymbalSize + 2 + stemLength} Q 10,${cymbalSize + 2 + stemLength - 5} 8,${cymbalSize + 2 + stemLength - 12}`"
          fill="none"
          stroke="#000"
          stroke-width="2"
          stroke-linecap="round"
        />
        <!-- 깃발 2 -->
        <path
          :d="`M 0,${cymbalSize + 2 + stemLength - 6} Q 10,${cymbalSize + 2 + stemLength - 11} 8,${cymbalSize + 2 + stemLength - 18}`"
          fill="none"
          stroke="#000"
          stroke-width="2"
          stroke-linecap="round"
        />
      </g>
    </g>
    
    <!-- 드럼 (원형) -->
    <g v-else>
      <!-- 온음표: 속이 빈 타원 -->
      <ellipse
        v-if="props.note.value === NoteValue.WHOLE"
        cx="0"
        cy="0"
        rx="9"
        ry="7"
        fill="none"
        stroke="#000"
        stroke-width="2"
      />

      <!-- 2분음표: 속이 빈 원 + 스템 -->
      <g v-else-if="props.note.value === NoteValue.HALF">
        <circle
          cx="0"
          cy="0"
          :r="noteSize"
          fill="none"
          stroke="#000"
          stroke-width="2"
        />
        <!-- 스템 -->
        <line
          :x1="noteSize"
          y1="0"
          :x2="noteSize"
          :y2="-stemLength"
          stroke="#000"
          stroke-width="2"
        />
      </g>

      <!-- 4분음표: 꽉 찬 원 + 스템 -->
      <g v-else-if="props.note.value === NoteValue.QUARTER">
        <circle
          cx="0"
          cy="0"
          :r="noteSize"
          fill="#000"
          stroke="#000"
          stroke-width="1"
        />
        <!-- 스템 -->
        <line
          :x1="noteSize"
          y1="0"
          :x2="noteSize"
          :y2="-stemLength"
          stroke="#000"
          stroke-width="2"
        />
      </g>

      <!-- 8분음표: 꽉 찬 원 + 스템 + 깃발 1개 -->
      <g v-else-if="props.note.value === NoteValue.EIGHTH">
        <circle
          cx="0"
          cy="0"
          :r="noteSize"
          fill="#000"
          stroke="#000"
          stroke-width="1"
        />
        <!-- 스템 -->
        <line
          :x1="noteSize"
          y1="0"
          :x2="noteSize"
          :y2="-stemLength"
          stroke="#000"
          stroke-width="2"
        />
        <!-- 깃발 -->
        <path
          :d="`M ${noteSize},-${stemLength} Q ${noteSize + 10},-${stemLength - 5} ${noteSize + 8},-${stemLength - 12}`"
          fill="none"
          stroke="#000"
          stroke-width="2"
          stroke-linecap="round"
        />
      </g>

      <!-- 16분음표: 꽉 찬 원 + 스템 + 깃발 2개 -->
      <g v-else-if="props.note.value === NoteValue.SIXTEENTH">
        <circle
          cx="0"
          cy="0"
          :r="noteSize"
          fill="#000"
          stroke="#000"
          stroke-width="1"
        />
        <!-- 스템 -->
        <line
          :x1="noteSize"
          y1="0"
          :x2="noteSize"
          :y2="-stemLength"
          stroke="#000"
          stroke-width="2"
        />
        <!-- 깃발 1 -->
        <path
          :d="`M ${noteSize},-${stemLength} Q ${noteSize + 10},-${stemLength - 5} ${noteSize + 8},-${stemLength - 12}`"
          fill="none"
          stroke="#000"
          stroke-width="2"
          stroke-linecap="round"
        />
        <!-- 깃발 2 -->
        <path
          :d="`M ${noteSize},-${stemLength - 6} Q ${noteSize + 10},-${stemLength - 11} ${noteSize + 8},-${stemLength - 18}`"
          fill="none"
          stroke="#000"
          stroke-width="2"
          stroke-linecap="round"
        />
      </g>

      <!-- 기본값 (값이 없으면 그냥 원) -->
      <circle
        v-else
        cx="0"
        cy="0"
        :r="noteSize"
        fill="#000"
        stroke="#000"
        stroke-width="1"
      />
    </g>
  </g>
</template>

