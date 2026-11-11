/**
 * Tier A — bespoke landmark models for the HKUST campus.
 *
 * Each model starts from the landmark's real OSM footprint (so position, orientation and plan
 * shape stay data-driven) and replaces the generic façade rules with hand-written block
 * architecture. The Academic Building and the Red Bird sundial were checked against photographs
 * on the official HKUST website (private reference only — no photo is shipped); the Shaw
 * Auditorium's plan and roof rings were checked from above against a Lands Department aerial
 * photograph, while its side elevation follows published descriptions only.
 * All remain stylised interpretations: see docs/ACCURACY.md.
 */
import { M } from '../../src/lib/voxel/palette'
import type { Volume } from '../../src/lib/voxel/mesher'
import { cellIndex } from './grid'
import { entrances, facadeBlock, massing, shell, type Prep, type Style } from './buildings'
import type { Bld, LandmarkDef, State } from './types'

const SITE = 'https://hkust.edu.hk/'

export const LANDMARKS: LandmarkDef[] = [
  {
    match: { officialName: 'Academic Building' },
    model: 'academic',
    title: 'Academic Building',
    evidence: SITE,
    notes:
      'White-tiled megastructure with a regular grid of square windows over a dark recessed base, as in the official site photograph of the Piazza front. Wing heights follow Lands Department data.',
  },
  {
    match: { officialName: 'Shaw Auditorium' },
    model: 'ring_auditorium',
    title: 'Shaw Auditorium',
    evidence: 'https://publish.ust.hk/univ/maps/Campus_Map_Color.pdf',
    notes:
      'Oval hall wrapped in stacked white rings. The outline is the mapped footprint. The oval plan and the concentric white rings of the roof were checked from above against a Lands Department aerial photograph; the side elevation follows published descriptions and was not checked against a ground-level photograph.',
  },
]

const base: Style = {
  wall: M.WALL_WHITE,
  band: M.WALL_WHITE,
  plinth: M.CONCRETE,
  window: M.WINDOW,
  glass: M.GLASS_BLUE,
  roof: M.ROOF_FLAT,
  accent: M.WALL_WHITE,
  pattern: 'punched',
  ground: 'solid',
  bay: 3,
  parapet: true,
  roofType: 'flat',
  roofTile: M.ROOF_TILE_GREY,
  equipment: true,
}

/** Adds a one-block cantilever ring around the footprint between two heights. */
function overhang(vol: Volume, P: Prep, y0: number, y1: number, mat: (y: number, l: number) => number) {
  for (let l = 0; l < P.inside.length; l++) {
    if (P.dist[l] !== 1) continue
    const i = P.ox + (l % P.sx),
      j = P.oz + ((l / P.sx) | 0)
    const nx = Math.round(P.nx[l]),
      nz = Math.round(P.nz[l])
    if (nx === 0 && nz === 0) continue
    for (let y = y0; y < y1; y++) {
      vol.add(i + nx, y, j + nz, mat(y, l))
      if (nx !== 0 && nz !== 0) {
        vol.add(i + nx, y, j, mat(y, l))
        vol.add(i, y, j + nz, mat(y, l))
      }
    }
  }
}

type Model = (vol: Volume, b: Bld, S: State, P: Prep, relTop: (i: number, j: number) => number) => void

export const MODELS: Record<string, Model> = {
  /** Academic Building — white tile, square windows on a regular grid, dark recessed ground storey. */
  academic(vol, b, S, P, relTop) {
    const st: Style = { ...base, pattern: 'punched', window: M.WINDOW, ground: 'arcade', bay: 3 }
    massing(vol, b, S, P, st, relTop)
    entrances(vol, b, S, P, true)
  },

  /** Shaw Auditorium — oval drum of stacked white rings with dark glazing between, shallow stepped roof. */
  ring_auditorium(vol, b, S, P) {
    const st: Style = { ...base, pattern: 'curtain', glass: M.WINDOW_STRIP, band: M.WALL_WHITE, ground: 'glass', bay: 4, equipment: false, parapet: false }
    shell(vol, b, S, P, st)
    const top = b.base + b.hBlocks
    // projecting white rings at every floor line, alternately one and two blocks deep
    for (let y = b.base + b.floorH, k = 0; y < top; y += b.floorH, k++) {
      overhang(vol, P, y, y + 1, () => M.WALL_WHITE)
      if (k % 2 === 0) overhang(vol, P, y + 1, y + 2, () => M.WALL_WHITE)
    }
    // low stepped roof
    for (let l = 0; l < P.inside.length; l++) {
      if (!P.inside[l]) continue
      const i = P.ox + (l % P.sx),
        j = P.oz + ((l / P.sx) | 0)
      const rise = Math.min(3, Math.floor((P.dist[l] - 1) / 6))
      for (let y = top; y < top + rise; y++) vol.set(i, y, j, M.WALL_WHITE)
      // seen from above the roof reads as concentric white rings around a darker centre
      const ring = P.dist[l] > 16 ? M.ROOF_FLAT : Math.floor((P.dist[l] - 1) / 3) % 2 === 0 ? M.WALL_WHITE : M.ROOF_METAL
      if (P.dist[l] > 1) vol.set(i, top + rise - 1 < top ? top - 1 : top + rise - 1, j, ring)
    }
    entrances(vol, b, S, P, true)
  },

  /** Open transport structures: a roof on columns with a red fascia. */
  station(vol, b, S, P) {
    const roofY = b.base + 4
    for (let l = 0; l < P.inside.length; l++) {
      if (!P.inside[l]) continue
      const i = P.ox + (l % P.sx),
        j = P.oz + ((l / P.sx) | 0)
      vol.set(i, roofY, j, P.dist[l] === 1 ? M.ACCENT_RED : M.ROOF_METAL)
      if (P.dist[l] === 1 && (P.edgeT[l] < 1 || P.edgeT[l] > P.edgeL[l] - 1 || Math.floor(P.edgeT[l]) % 6 === 3)) for (let y = S.H[cellIndex(i, j)]; y < roofY; y++) vol.set(i, y, j, M.COLUMN)
    }
  },
}

/** Models that are open structures whose footprint must stay walkable (no terrain cut, no solid fill). */
export const OPEN_MODELS = new Set<string>(['station'])

export { facadeBlock }
