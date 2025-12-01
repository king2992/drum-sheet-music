<script setup lang="ts">
import { computed } from 'vue'
import type { Rest } from '@/types/drum'
import { RestValue } from '@/types/drum'

const props = defineProps<{
  rest: Rest
  x: number
  y: number
  offsetX?: number
}>()

const finalX = computed(() => props.x + (props.offsetX || 0))
const finalY = computed(() => props.y)
</script>

<template>
  <g>
    <!-- 온쉼표 -->
    <ellipse
      v-if="rest.value === RestValue.WHOLE"
      :cx="finalX"
      :cy="finalY + 5"
      rx="8"
      ry="3"
      fill="#000"
    />
    
    <!-- 2분쉼표 -->
    <ellipse
      v-else-if="rest.value === RestValue.HALF"
      :cx="finalX"
      :cy="finalY - 5"
      rx="8"
      ry="3"
      fill="#000"
    />
    
    <!-- 4분쉼표 -->
    <path
      v-else-if="rest.value === RestValue.QUARTER"
      :d="`M ${finalX - 6},${finalY - 10} L ${finalX + 2},${finalY - 6} L ${finalX - 6},${finalY - 2} L ${finalX + 2},${finalY + 2} L ${finalX - 6},${finalY + 6} L ${finalX + 2},${finalY + 10}`"
      stroke="#000"
      stroke-width="2"
      fill="none"
      stroke-linecap="round"
    />
    
    <!-- 8분쉼표 -->
    <g v-else-if="rest.value === RestValue.EIGHTH">
      <path
        :d="`M ${finalX},${finalY - 10} Q ${finalX + 5},${finalY - 5} ${finalX},${finalY} Q ${finalX - 5},${finalY + 5} ${finalX},${finalY + 10}`"
        stroke="#000"
        stroke-width="2"
        fill="none"
        stroke-linecap="round"
      />
      <circle :cx="finalX + 3" :cy="finalY + 8" r="2" fill="#000" />
    </g>
    
    <!-- 16분쉼표 -->
    <g v-else-if="rest.value === RestValue.SIXTEENTH">
      <path
        :d="`M ${finalX},${finalY - 10} Q ${finalX + 5},${finalY - 5} ${finalX},${finalY} Q ${finalX - 5},${finalY + 5} ${finalX},${finalY + 10}`"
        stroke="#000"
        stroke-width="2"
        fill="none"
        stroke-linecap="round"
      />
      <circle :cx="finalX + 3" :cy="finalY + 8" r="2" fill="#000" />
      <path
        :d="`M ${finalX + 2},${finalY - 8} Q ${finalX + 7},${finalY - 3} ${finalX + 2},${finalY + 2} Q ${finalX - 3},${finalY + 7} ${finalX + 2},${finalY + 12}`"
        stroke="#000"
        stroke-width="2"
        fill="none"
        stroke-linecap="round"
      />
      <circle :cx="finalX + 5" :cy="finalY + 10" r="2" fill="#000" />
    </g>
  </g>
</template>

