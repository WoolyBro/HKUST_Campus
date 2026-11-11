/**
 * Central project constants. Every script and the web app import scale,
 * anchor and world-extent values from here — no magic numbers elsewhere.
 */

/** Campus anchor (WGS84): centre of the OSM campus-boundary bounding box, rounded. */
export const ANCHOR = { lat: 22.3361, lon: 114.2657 } as const

/** OSM element holding the HKUST Clear Water Bay campus boundary (amenity=university). */
export const CAMPUS_OSM = { type: 'way', id: 40664120 } as const

/**
 * Project scale: 1 real-world metre = 1 block = 1 world unit.
 * (A true 1:1 block-scale build; change here to rescale everything.)
 */
export const BLOCKS_PER_METRE = 1

/** World extent in blocks, relative to the anchor. +X = east, +Z = south, +Y = up. */
export const WORLD = {
  minX: -640,
  minZ: -704,
  sizeX: 1280,
  sizeZ: 1408,
  /** Horizontal chunk edge in blocks. */
  chunk: 128,
} as const

export const CHUNKS_X = WORLD.sizeX / WORLD.chunk
export const CHUNKS_Z = WORLD.sizeZ / WORLD.chunk

/** Lowest block layer of the diorama slab and the sea surface level (blocks). */
export const Y_FLOOR = -10
export const SEA_LEVEL = 0
/** Value added to block Y before it is stored in unsigned bytes. */
export const Y_BIAS = -Y_FLOOR

/** Building height model (see docs/ARCHITECTURE.md → Height estimation). */
export const FLOOR_HEIGHT_M = 3.5
export const RESIDENTIAL_FLOOR_HEIGHT_M = 3.1
export const BLOCK_STEP_M = 1 / BLOCKS_PER_METRE
export const PLACEHOLDER_HEIGHT_M = 7

/** Human eye height used by the street-level camera (blocks). */
export const EYE_HEIGHT = 1.7

/** Study-area rectangle (local metres east/north of the anchor). */
export const STUDY_AREA_M = {
  minE: WORLD.minX / BLOCKS_PER_METRE,
  maxE: (WORLD.minX + WORLD.sizeX) / BLOCKS_PER_METRE,
  // north = -Z
  minN: -(WORLD.minZ + WORLD.sizeZ) / BLOCKS_PER_METRE,
  maxN: -WORLD.minZ / BLOCKS_PER_METRE,
} as const
