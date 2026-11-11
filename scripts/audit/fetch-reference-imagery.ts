/**
 * fetch-reference-imagery.ts — caches Lands Department aerial-photo tiles for the campus as a
 * PRIVATE VISUAL REFERENCE for the audit in scripts/audit/compare.ts.
 *
 * Source: Imagery Map API, Lands Department, HKSAR Government ("Aerial Photograph from Lands
 * Department"). The tiles are © the Government and are NOT open data: they stay in data/raw/
 * (git-ignored), are never shipped, never used as a texture and never traced automatically.
 * They are only looked at, next to a top-down render of the model, to spot where the model
 * disagrees with the real campus. Every correction that follows is written down by hand in
 * data/manual-overrides.json.
 *
 * Usage: tsx scripts/audit/fetch-reference-imagery.ts [zoom=18] [marginM=40] [--force]
 *        tsx scripts/audit/fetch-reference-imagery.ts 20 0 --around=cx,cz,size   (a square in world blocks, for close-ups)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { worldToLonLat } from '../../src/lib/geo/projection'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const DIR = resolve(ROOT, 'data/raw/imagery')
const TEMPLATE = 'https://mapapi.hkmapservice.gov.hk/gs/api/v1.0.0/xyz/imagery/WGS84/{z}/{x}/{y}.png'
const UA = 'hkust-voxel-campus-build/0.1 (one-off private reference for a model audit)'
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const Z = Number(args[0] ?? 18)
const MARGIN = Number(args[1] ?? 40)
const force = process.argv.includes('--force')
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const boundary = JSON.parse(readFileSync(resolve(ROOT, 'data/campus-boundary.geojson'), 'utf8'))
const ring = boundary.features[0].geometry.coordinates[0] as [number, number][]
const dLat = MARGIN / 110_700,
  dLon = MARGIN / 102_900
let lon0 = Math.min(...ring.map((p) => p[0])) - dLon,
  lon1 = Math.max(...ring.map((p) => p[0])) + dLon
let lat0 = Math.min(...ring.map((p) => p[1])) - dLat,
  lat1 = Math.max(...ring.map((p) => p[1])) + dLat
const around = process.argv.find((v) => v.startsWith('--around='))
if (around) {
  const [cx, cz, size] = around.slice(9).split(',').map(Number)
  const nw = worldToLonLat(cx - size / 2, cz - size / 2),
    se = worldToLonLat(cx + size / 2, cz + size / 2)
  lon0 = nw.lon
  lon1 = se.lon
  lat0 = se.lat
  lat1 = nw.lat
}

const n = 2 ** Z
const tx = (lon: number) => Math.floor(((lon + 180) / 360) * n)
const ty = (lat: number) => Math.floor(((1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2) * n)
const x0 = tx(lon0),
  x1 = tx(lon1),
  y0 = ty(lat1),
  y1 = ty(lat0)
const total = (x1 - x0 + 1) * (y1 - y0 + 1)
if (total > 400) throw new Error(`refusing to request ${total} tiles — narrow the area or lower the zoom`)

let fetched = 0
for (let y = y0; y <= y1; y++)
  for (let x = x0; x <= x1; x++) {
    const out = resolve(DIR, String(Z), String(x), `${y}.png`)
    if (existsSync(out) && !force) continue
    mkdirSync(dirname(out), { recursive: true })
    const url = TEMPLATE.replace('{z}', String(Z)).replace('{x}', String(x)).replace('{y}', String(y))
    let ok = false
    for (let attempt = 0; attempt < 4 && !ok; attempt++) {
      try {
        const res = await fetch(url, { headers: { 'User-Agent': UA } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        writeFileSync(out, Buffer.from(await res.arrayBuffer()))
        ok = true
        fetched++
      } catch (e) {
        console.log(`  retry ${x},${y}: ${(e as Error).message}`)
        await sleep(1500 * (attempt + 1))
      }
    }
    if (!ok) throw new Error(`could not fetch tile ${Z}/${x}/${y}`)
    await sleep(120)
  }

const metaFile = resolve(DIR, 'meta.json')
const meta = existsSync(metaFile)
  ? JSON.parse(readFileSync(metaFile, 'utf8'))
  : { source: 'Imagery Map API — Aerial Photograph from Lands Department, HKSAR Government', template: TEMPLATE, use: 'private visual reference only; not redistributed', zooms: {} }
const prev = meta.zooms[Z]
meta.zooms[Z] = { x0: Math.min(x0, prev?.x0 ?? x0), x1: Math.max(x1, prev?.x1 ?? x1), y0: Math.min(y0, prev?.y0 ?? y0), y1: Math.max(y1, prev?.y1 ?? y1), fetchedAt: new Date().toISOString() }
writeFileSync(metaFile, JSON.stringify(meta, null, 2))
console.log(`reference imagery: zoom ${Z}, ${total} tiles (${fetched} downloaded, ${total - fetched} cached) → data/raw/imagery/`)
