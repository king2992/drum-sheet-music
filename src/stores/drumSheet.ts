import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { DrumSheet, Measure, DrumNote, NoteValue, Section, SectionType, Rest, RestValue } from '@/types/drum'
import { DrumPart, NoteStyle } from '@/types/drum'
import { v4 as uuidv4 } from 'uuid'

export const useDrumSheetStore = defineStore('drumSheet', () => {
  const drumSheet = ref<DrumSheet>({
    id: uuidv4(),
    title: '새 드럼 악보',
    tempo: 120,
    measures: [
      {
        id: uuidv4(),
        timeSignature: { beats: 4, noteValue: 4 },
        notes: [],
        rests: [],
      },
    ],
    sections: [],
  })

  const selectedNoteValue = ref<NoteValue>(0.25) // 기본값: 4분 음표
  const selectedRestValue = ref<RestValue>(0.25) // 기본값: 4분 쉼표
  const selectedDrumPart = ref<DrumPart | null>(null) // 선택된 드럼 파트 (null이면 클릭 위치 자동 선택)

  // 드럼 파트에 따른 기본 음표 스타일 결정
  function getNoteStyle(part: DrumPart): NoteStyle {
    switch (part) {
      case DrumPart.CRASH:
      case DrumPart.RIDE:
      case DrumPart.HI_HAT:
        return NoteStyle.CYMBAL
      default:
        return NoteStyle.DRUM
    }
  }

  // 마디 추가
  function addMeasure(afterMeasureId?: string) {
    const lastMeasure = drumSheet.value.measures[drumSheet.value.measures.length - 1]
    const newMeasure: Measure = {
      id: uuidv4(),
      timeSignature: lastMeasure.timeSignature,
      notes: [],
      rests: [],
    }

    if (afterMeasureId) {
      const index = drumSheet.value.measures.findIndex((m) => m.id === afterMeasureId)
      if (index !== -1) {
        drumSheet.value.measures.splice(index + 1, 0, newMeasure)
        return
      }
    }
    drumSheet.value.measures.push(newMeasure)
  }

  // 마디 삭제
  function removeMeasure(measureId: string) {
    if (drumSheet.value.measures.length > 1) {
      // 섹션에서도 제거
      drumSheet.value.sections.forEach((section) => {
        section.measureIds = section.measureIds.filter((id) => id !== measureId)
      })
      // 빈 섹션 제거
      drumSheet.value.sections = drumSheet.value.sections.filter(
        (s) => s.measureIds.length > 0
      )
      drumSheet.value.measures = drumSheet.value.measures.filter((m) => m.id !== measureId)
    }
  }

  // 음표 추가/토글
  function toggleNote(measureId: string, part: DrumPart, beat: number) {
    const measure = drumSheet.value.measures.find((m) => m.id === measureId)
    if (!measure) return

    // 같은 위치에 같은 파트의 음표가 있는지 확인 (소수점 오차 고려)
    const tolerance = 0.01
    const existingNoteIndex = measure.notes.findIndex(
      (n) => n.part === part && Math.abs(n.beat - beat) < tolerance
    )

    if (existingNoteIndex !== -1) {
      // 이미 있으면 삭제
      measure.notes.splice(existingNoteIndex, 1)
    } else {
      // 없으면 추가
      measure.notes.push({
        id: uuidv4(),
        part,
        beat,
        value: selectedNoteValue.value,
        style: getNoteStyle(part),
      })
    }
  }

  // 쉼표 추가/토글
  function toggleRest(measureId: string, beat: number) {
    const measure = drumSheet.value.measures.find((m) => m.id === measureId)
    if (!measure) return

    const existingRestIndex = measure.rests.findIndex((r) => r.beat === beat)

    if (existingRestIndex !== -1) {
      measure.rests.splice(existingRestIndex, 1)
    } else {
      measure.rests.push({
        id: uuidv4(),
        beat,
        value: selectedRestValue.value,
      })
    }
  }

  // 섹션 추가
  function addSection(type: SectionType, label: string, measureIds: string[]) {
    const section: Section = {
      id: uuidv4(),
      type,
      label,
      measureIds,
    }
    drumSheet.value.sections.push(section)
    // 마디에 섹션 ID 할당
    measureIds.forEach((id) => {
      const measure = drumSheet.value.measures.find((m) => m.id === id)
      if (measure) {
        measure.sectionId = section.id
      }
    })
  }

  // 섹션 삭제
  function removeSection(sectionId: string) {
    drumSheet.value.sections = drumSheet.value.sections.filter((s) => s.id !== sectionId)
    // 마디에서 섹션 ID 제거
    drumSheet.value.measures.forEach((m) => {
      if (m.sectionId === sectionId) {
        m.sectionId = undefined
      }
    })
  }

  // 반복 기호 설정
  function setRepeatStart(measureId: string, value: boolean) {
    const measure = drumSheet.value.measures.find((m) => m.id === measureId)
    if (measure) {
      measure.hasRepeatStart = value
    }
  }

  function setRepeatEnd(measureId: string, value: boolean) {
    const measure = drumSheet.value.measures.find((m) => m.id === measureId)
    if (measure) {
      measure.hasRepeatEnd = value
    }
  }

  // 악보 제목 변경
  function setTitle(title: string) {
    drumSheet.value.title = title
  }

  // 아티스트 변경
  function setArtist(artist: string) {
    drumSheet.value.artist = artist
  }

  // 템포 변경
  function setTempo(tempo: number) {
    drumSheet.value.tempo = tempo
  }

  // 선택된 음표 길이 변경
  function setSelectedNoteValue(value: NoteValue) {
    selectedNoteValue.value = value
  }

  // 선택된 쉼표 길이 변경
  function setSelectedRestValue(value: RestValue) {
    selectedRestValue.value = value
  }

  // 선택된 드럼 파트 변경
  function setSelectedDrumPart(part: DrumPart | null) {
    selectedDrumPart.value = part
  }

  // 마디별 섹션 정보 가져오기
  const measureSections = computed(() => {
    const map = new Map<string, Section>()
    drumSheet.value.sections.forEach((section) => {
      section.measureIds.forEach((measureId) => {
        map.set(measureId, section)
      })
    })
    return map
  })

  return {
    drumSheet,
    selectedNoteValue,
    selectedRestValue,
    selectedDrumPart,
    measureSections,
    addMeasure,
    removeMeasure,
    toggleNote,
    toggleRest,
    addSection,
    removeSection,
    setRepeatStart,
    setRepeatEnd,
    setTitle,
    setArtist,
    setTempo,
    setSelectedNoteValue,
    setSelectedRestValue,
    setSelectedDrumPart,
  }
})
