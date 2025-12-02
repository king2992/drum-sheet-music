// 드럼 파트 타입 (5선 보표에서의 위치)
export enum DrumPart {
  CRASH = 'crash',        // 위 공간 (5선 위)
  RIDE = 'ride',          // 5선
  HI_HAT = 'hi-hat',      // 4선
  HIGH_TOM = 'high-tom',  // 3-4선 사이
  MID_TOM = 'mid-tom',    // 3선
  LOW_TOM = 'low-tom',    // 2선
  SNARE = 'snare',        // 1선
  BASS = 'bass',          // 1선 아래 공간
}

// 음표 길이 타입
export enum NoteValue {
  WHOLE = 1,
  HALF = 0.5,
  QUARTER = 0.25,
  EIGHTH = 0.125,
  SIXTEENTH = 0.0625,
}

// 쉼표 타입
export enum RestValue {
  WHOLE = 1,
  HALF = 0.5,
  QUARTER = 0.25,
  EIGHTH = 0.125,
  SIXTEENTH = 0.0625,
}

// 음표 스타일 (심벌은 x 모양, 드럼은 원형)
export enum NoteStyle {
  CYMBAL = 'cymbal',  // x 모양 (하이햇, 크래시, 라이드)
  DRUM = 'drum',      // 원형 (탐, 스네어, 베이스)
}

// 드럼 노트
export interface DrumNote {
  id: string
  part: DrumPart
  beat: number // 마디 내 위치 (0부터 시작)
  value: NoteValue
  style?: NoteStyle // 음표 스타일 (기본값은 파트에 따라 결정)
  isOpen?: boolean // 하이햇 오픈 여부
  isGhost?: boolean // Ghost Note 여부 (약하게 연주)
  hasAccent?: boolean // 액센트 표시 (강하게 연주)
}

// 쉼표
export interface Rest {
  id: string
  beat: number // 마디 내 위치
  value: RestValue
}

// 다이나믹 타입 (음량 표시)
export enum DynamicType {
  PP = 'pp',   // pianissimo (매우 여리게)
  P = 'p',     // piano (여리게)
  MP = 'mp',   // mezzo-piano (조금 여리게)
  MF = 'mf',   // mezzo-forte (조금 세게)
  F = 'f',     // forte (세게)
  FF = 'ff',   // fortissimo (매우 세게)
}

// 헤어핀 타입 (크레센도/디크레센도)
export enum HairpinType {
  CRESCENDO = 'crescendo',       // < (점점 세게)
  DECRESCENDO = 'decrescendo',   // > (점점 여리게)
}

// 다이나믹 마크 (특정 위치에 표시)
export interface DynamicMark {
  id: string
  beat: number // 마디 내 위치
  type: DynamicType
}

// 헤어핀 (크레센도/디크레센도 표시)
export interface Hairpin {
  id: string
  startBeat: number // 시작 위치
  endBeat: number   // 끝 위치
  type: HairpinType
}

// 섹션 타입
export enum SectionType {
  INTRO = 'intro',
  VERSE = 'verse',
  PRE_CHORUS = 'pre-chorus',
  CHORUS = 'chorus',
  BRIDGE = 'bridge',
  OUTRO = 'outro',
  SOLO = 'solo',
}

// 섹션
export interface Section {
  id: string
  type: SectionType
  label: string // 표시될 레이블 (예: "INTRO", "VERSE")
  measureIds: string[] // 포함된 마디 ID들
}

// 마디
export interface Measure {
  id: string
  timeSignature: {
    beats: number // 분자 (박자 수)
    noteValue: number // 분모 (기준 음표)
  }
  notes: DrumNote[]
  rests: Rest[] // 쉼표들
  dynamics?: DynamicMark[] // 다이나믹 마크들
  hairpins?: Hairpin[] // 크레센도/디크레센도들
  sectionId?: string // 속한 섹션 ID
  hasRepeatStart?: boolean // 반복 시작 기호
  hasRepeatEnd?: boolean // 반복 끝 기호
}

// 드럼 악보
export interface DrumSheet {
  id: string
  title: string
  artist?: string
  tempo: number
  measures: Measure[]
  sections: Section[]
}
