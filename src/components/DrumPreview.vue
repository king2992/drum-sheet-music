<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import { useDrumSheetStore } from '@/stores/drumSheet'
import DrumMeasure from './DrumMeasure.vue'

const store = useDrumSheetStore()
const measureRefs = ref<HTMLElement[]>([])

// 마디별 섹션 정보 및 줄 위치 계산
const measureWithSections = computed(() => {
  return store.drumSheet.measures.map((measure, index) => {
    const section = store.measureSections.get(measure.id)
    const isFirstInSection = section
      ? store.drumSheet.measures.findIndex((m) => m.sectionId === section.id) === index
      : false
    
    // 같은 줄의 첫 번째/마지막 마디인지 확인
    let isFirstInRow = index === 0
    let isLastInRow = index === store.drumSheet.measures.length - 1
    
    if (measureRefs.value.length > 0 && index > 0) {
      const currentRect = measureRefs.value[index]?.getBoundingClientRect()
      const prevRect = measureRefs.value[index - 1]?.getBoundingClientRect()
      
      // 이전 마디와 다른 줄에 있으면 첫 번째 마디
      if (currentRect && prevRect && Math.abs(currentRect.top - prevRect.top) > 10) {
        isFirstInRow = true
      }
    }
    
    if (measureRefs.value.length > 0 && index < store.drumSheet.measures.length - 1) {
      const currentRect = measureRefs.value[index]?.getBoundingClientRect()
      const nextRect = measureRefs.value[index + 1]?.getBoundingClientRect()
      
      // 다음 마디와 다른 줄에 있으면 마지막 마디
      if (currentRect && nextRect && Math.abs(currentRect.top - nextRect.top) > 10) {
        isLastInRow = true
      }
    }
    
    return {
      measure,
      section,
      isFirstInSection,
      isFirstInRow,
      isLastInRow,
    }
  })
})

// 마디 레이아웃이 변경될 때마다 재계산
onMounted(() => {
  nextTick(() => {
    // 레이아웃 변경 감지를 위한 MutationObserver 또는 ResizeObserver 사용
  })
})
</script>

<template>
  <div class="drum-preview">
    <div class="preview-content">
      <!-- 제목 영역 -->
      <div class="preview-sheet-title">
        <h1 class="preview-title">{{ store.drumSheet.title }}</h1>
        <h2 v-if="store.drumSheet.artist" class="preview-artist">{{ store.drumSheet.artist }}</h2>
        <div class="preview-tempo">
          <span class="tempo-symbol">♩</span>
          <span class="tempo-equals">=</span>
          <span class="tempo-value">{{ store.drumSheet.tempo }}</span>
        </div>
      </div>

      <!-- 악보 영역 -->
      <div class="preview-sheet-container">
        <div class="preview-measures-wrapper">
          <DrumMeasure
            v-for="({ measure, section, isFirstInSection, isFirstInRow, isLastInRow }, index) in measureWithSections"
            :key="measure.id"
            :ref="el => { if (el) measureRefs[index] = el.$el || el }"
            :measure="measure"
            :section="section"
            :is-first-in-section="isFirstInSection"
            :measure-number="index + 1"
            :width="undefined"
            :is-preview="true"
            :is-first-in-row="isFirstInRow"
            :is-last-in-row="isLastInRow"
            class="preview-measure"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drum-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  overflow: hidden;
}

.preview-content {
  flex: 1;
  overflow: hidden;
  padding: 0;
  background: #ffffff;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* 제목 영역 - 이미지처럼 크고 명확하게 */
.preview-sheet-title {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px 0 20px 0;
  width: 100%;
  flex-shrink: 0;
}

.preview-title {
  font-size: 42px;
  font-weight: 900;
  margin: 0 0 12px 0;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.preview-artist {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 20px 0;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.preview-tempo {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #000;
  font-family: 'Times New Roman', serif;
}

.tempo-symbol {
  font-size: 28px;
}

.tempo-equals {
  font-size: 24px;
}

.tempo-value {
  font-size: 32px;
  font-weight: 700;
}

/* 악보 컨테이너 */
.preview-sheet-container {
  background: #ffffff;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  flex: 1;
  min-width: 0;
  display: block;
  position: relative;
}

.preview-measures-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  padding: 0;
  margin: 0;
  overflow: visible; /* 보표선 확장이 보이도록 */
}

.preview-measure {
  flex-shrink: 0;
  flex-grow: 0;
  margin: 0;
  border-radius: 0;
  box-shadow: none;
  border: none;
  background: transparent;
  padding: 0;
  width: calc(100% / 8);
  min-width: 0;
  position: relative;
}

/* 마디 간 구분선 제거됨 */

/* 인쇄 스타일 최적화 */
@media print {
  .preview-content {
    padding: 20px;
  }
  
  .preview-title {
    font-size: 36px;
  }
  
  .preview-artist {
    font-size: 24px;
  }
}
</style>
