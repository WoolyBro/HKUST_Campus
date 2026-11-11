/** Guided fly-to destinations. Each resolves to a feature in the catalogue by key or exact name. */
export interface Preset {
  label: string
  /** Feature key ("zone/2") or exact feature name. */
  ref: string
  group: 'Arrive' | 'Zones' | 'Landmarks' | 'Academic' | 'Living' | 'Seafront'
  dist?: number
}

export const PRESETS: Preset[] = [
  { label: 'Piazza & Red Bird Sundial', ref: 'Piazza (Red Bird Sundial)', group: 'Arrive', dist: 200 },
  { label: 'North Bus Station', ref: 'North Bus Station', group: 'Arrive', dist: 240 },
  { label: 'South Bus Station', ref: 'South Bus Station', group: 'Arrive', dist: 240 },
  { label: 'Academic Core', ref: 'zone/1', group: 'Zones', dist: 620 },
  { label: 'Lee Shau Kee Campus', ref: 'zone/2', group: 'Zones', dist: 420 },
  { label: 'Student Halls & Apartments', ref: 'zone/3', group: 'Zones', dist: 620 },
  { label: 'Staff Quarters', ref: 'zone/4', group: 'Zones', dist: 620 },
  { label: 'Sports & Waterfront', ref: 'zone/5', group: 'Zones', dist: 520 },
  { label: 'Academic Building', ref: 'Academic Building', group: 'Landmarks', dist: 520 },
  { label: 'Shaw Auditorium', ref: 'Shaw Auditorium', group: 'Landmarks', dist: 260 },
  { label: 'Lee Shau Kee Library', ref: 'Lee Shau Kee Library', group: 'Landmarks', dist: 260 },
  { label: 'Cheng Yu Tung Building', ref: 'Cheng Yu Tung Building', group: 'Academic', dist: 260 },
  { label: 'Lee Shau Kee Business Building', ref: 'Lee Shau Kee Business Building', group: 'Academic', dist: 300 },
  { label: 'Institute for Advanced Study', ref: 'HKUST Jockey Club Institute for Advanced Study / Lo Ka Chung Building', group: 'Academic', dist: 260 },
  { label: 'Martin Ka Shing Lee Innovation Building', ref: 'Martin Ka Shing Lee Innovation Building', group: 'Academic', dist: 240 },
  { label: 'Enterprise Center', ref: 'The Hong Kong Jockey Club Enterprise Center', group: 'Academic', dist: 260 },
  { label: 'Lo Ka Chung University Center', ref: 'Lo Ka Chung University Center', group: 'Living', dist: 260 },
  { label: 'Undergraduate Halls I & II', ref: 'Lee Yin Yee Hall (Hall I)', group: 'Living', dist: 320 },
  { label: 'Jockey Club i-Village (Halls X–XIII)', ref: 'DJI Hall (Hall XI)', group: 'Living', dist: 340 },
  { label: 'Conference Lodge', ref: 'Li Dak Sum Yip Yio Chin Kenneth Li Conference Lodge', group: 'Living', dist: 260 },
  { label: "President's Lodge", ref: "President's Lodge", group: 'Living', dist: 220 },
  { label: 'Tsang Shiu Tim Sports Center', ref: 'Tsang Shiu Tim Sports Center', group: 'Seafront', dist: 320 },
  { label: 'Water Sports Center', ref: 'Water Sports Center', group: 'Seafront', dist: 240 },
]
