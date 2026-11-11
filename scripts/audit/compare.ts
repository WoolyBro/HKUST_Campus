/**
 * compare.ts — audit sheets: Lands Department aerial photo (left) next to a top-down render of
 * the built model (right), cell by cell, on the same world grid.
 *
 * The sheets contain government imagery, so they are written to data/raw/audit/ (git-ignored)
 * and are for looking at only. Needs `npm run build && npm run preview` running on port 4175 and
 * tiles from scripts/audit/fetch-reference-imagery.ts.
 *
 * Usage: tsx scripts/audit/compare.ts                 → the whole campus in 300 m cells
 *        tsx scripts/audit/compare.ts cx cz size name [zoom]  → one square of `size` metres centred on world (cx, cz)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { lonLatToWorld } from '../../src/lib/geo/projection'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const TILES = resolve(ROOT, 'data/raw/imagery')
const OUT = resolve(ROOT, 'data/raw/audit')
const S = 900 // pixels per side of each half
const URL = 'http://127.0.0.1:4175/'
mkdirSync(OUT, { recursive: true })

interface Cell {
  name: string
  cx: number
  cz: number
  size: number
  zoom: number
}
const cells: Cell[] = []
const a = process.argv.slice(2).filter((v) => !v.startsWith('--'))
const OVERLAY = process.argv.includes('--overlay')
if (a.length >= 4) cells.push({ cx: Number(a[0]), cz: Number(a[1]), size: Number(a[2]), name: a[3], zoom: Number(a[4] ?? 18) })
else {
  const ring = JSON.parse(readFileSync(resolve(ROOT, 'data/campus-boundary.geojson'), 'utf8')).features[0].geometry.coordinates[0] as [number, number][]
  const pts = ring.map((p) => lonLatToWorld(p[0], p[1]))
  const x0 = Math.min(...pts.map((p) => p.x)),
    x1 = Math.max(...pts.map((p) => p.x)),
    z0 = Math.min(...pts.map((p) => p.z)),
    z1 = Math.max(...pts.map((p) => p.z))
  const size = 300
  const nx = Math.ceil((x1 - x0) / size),
    nz = Math.ceil((z1 - z0) / size)
  const ox = (x0 + x1) / 2 - (nx * size) / 2,
    oz = (z0 + z1) / 2 - (nz * size) / 2
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) cells.push({ name: `cell-r${j}c${i}`, cx: Math.round(ox + (i + 0.5) * size), cz: Math.round(oz + (j + 0.5) * size), size, zoom: 18 })
}

/** Destination rectangles (in sheet pixels) of every cached tile that overlaps a cell. */
function tilesFor(c: Cell) {
  const n = 2 ** c.zoom
  const meta = JSON.parse(readFileSync(resolve(TILES, 'meta.json'), 'utf8')).zooms[c.zoom]
  if (!meta) throw new Error(`no cached tiles at zoom ${c.zoom}`)
  const lon = (x: number) => (x / n) * 360 - 180
  const lat = (y: number) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI
  const px = (w: number, c0: number) => ((w - (c0 - c.size / 2)) / c.size) * S
  const out: { src: string; x: number; y: number; w: number; h: number }[] = []
  for (let y = meta.y0; y <= meta.y1; y++)
    for (let x = meta.x0; x <= meta.x1; x++) {
      const nw = lonLatToWorld(lon(x), lat(y)),
        se = lonLatToWorld(lon(x + 1), lat(y + 1))
      const dx = px(nw.x, c.cx),
        dy = px(nw.z, c.cz),
        dw = px(se.x, c.cx) - dx,
        dh = px(se.z, c.cz) - dy
      if (dx > S || dy > S || dx + dw < 0 || dy + dh < 0) continue
      const f = resolve(TILES, String(c.zoom), String(x), `${y}.png`)
      if (existsSync(f)) out.push({ src: 'data:image/png;base64,' + readFileSync(f).toString('base64'), x: dx, y: dy, w: dw, h: dh })
    }
  return out
}

/** Map outlines drawn over the photo with --overlay: OSM buildings (white), other OSM areas (magenta), water (cyan), Lands Department buildings (orange). */
type Line = { colour: string; pts: [number, number][] }
const lines: Line[] = []
if (OVERLAY) {
  const add = (file: string, colour: string, filter: (p: any) => boolean = () => true) => {
    const fc = JSON.parse(readFileSync(resolve(ROOT, 'data/processed', file), 'utf8'))
    for (const f of fc.features) {
      if (!filter(f.properties)) continue
      const g = f.geometry
      const rings: number[][][] = g.type === 'Polygon' ? g.coordinates : g.type === 'MultiPolygon' ? g.coordinates.flat() : g.type === 'LineString' ? [g.coordinates] : []
      for (const r of rings)
        lines.push({
          colour,
          pts: r.map((c) => {
            const w = lonLatToWorld(c[0], c[1])
            return [w.x, w.z] as [number, number]
          }),
        })
    }
  }
  add('landsd-buildings.geojson', 'rgba(255,150,0,0.9)')
  add('buildings.geojson', '#fff')
  add('facilities.geojson', '#f0f', (p) => p.kind !== 'area:university')
  add('waterways.geojson', '#0ff')
  add('roads.geojson', 'rgba(255,60,60,0.8)')
  add('vegetation.geojson', '#7f0', (p) => p.kind !== 'wood')
}

const browser = await chromium.launch({ args: ['--use-angle=default', '--enable-gpu', '--ignore-gpu-blocklist'] })
const app = await browser.newPage({ viewport: { width: S, height: S } })
await app.goto(URL + '#m=iso&l=0111110000')
await app.getByRole('button', { name: 'Explore campus' }).click({ timeout: 90_000 })
await app.waitForFunction(() => (window as any).__hkust?.store.getState().loaded, null, { timeout: 120_000 })
await app.addStyleTag({ content: 'body > #root > * :not(canvas):not(:has(canvas)) { visibility: hidden !important }' })
const sheet = await browser.newPage({ viewport: { width: S * 2 + 6, height: S + 26 } })

for (const c of cells) {
  // tsx wraps named inner functions in a helper that does not exist in the page
  await app.evaluate('globalThis.__name = (f) => f')
  // top-down, north-up orthographic view of the model, slightly larger than the cell
  const rect = await app.evaluate(
    async ({ cx, cz, size }) => {
      const h = (window as any).__hkust
      const pose = { tx: cx, tz: cz, az: 0, pol: 0.06, dist: (size * 1.12) / (2 * Math.tan((16 * Math.PI) / 180)) }
      h.rig.tween = null
      Object.assign(h.rig.goal, pose)
      Object.assign(h.rig.cur, pose)
      await new Promise((r) => setTimeout(r, 4500))
      const cam = h.three().camera
      const V = h.rig.focus.constructor
      const y = h.rig.cur.ty
      const p = (x: number, z: number) => {
        const v = new V(x, y, z).project(cam)
        return [((v.x + 1) / 2) * innerWidth, ((1 - v.y) / 2) * innerHeight]
      }
      const [x0, y0] = p(cx - size / 2, cz - size / 2),
        [x1, y1] = p(cx + size / 2, cz + size / 2)
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
    },
    { cx: c.cx, cz: c.cz, size: c.size },
  )
  const shot = 'data:image/png;base64,' + (await app.screenshot({ type: 'png' })).toString('base64')
  await sheet.setContent(`<body style="margin:0;background:#111"><canvas id="c" width="${S * 2 + 6}" height="${S + 26}"></canvas></body>`)
  await sheet.evaluate('globalThis.__name = (f) => f')
  await sheet.evaluate(
    async ({ tiles, shot, rect, S, c, lines }) => {
      const ctx = (document.getElementById('c') as HTMLCanvasElement).getContext('2d')!
      const load = (src: string) =>
        new Promise<HTMLImageElement>((res, rej) => {
          const i = new Image()
          i.onload = () => res(i)
          i.onerror = rej
          i.src = src
        })
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 26, S, S)
      ctx.clip()
      for (const t of tiles) ctx.drawImage(await load(t.src), t.x, t.y + 26, t.w, t.h)
      for (const l of lines) {
        ctx.strokeStyle = l.colour
        ctx.lineWidth = 1.2
        ctx.beginPath()
        l.pts.forEach((q, k) => {
          const x = ((q[0] - (c.cx - c.size / 2)) / c.size) * S,
            y = 26 + ((q[1] - (c.cz - c.size / 2)) / c.size) * S
          if (k) ctx.lineTo(x, y)
          else ctx.moveTo(x, y)
        })
        ctx.stroke()
      }
      ctx.restore()
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(await load(shot), rect.x, rect.y, rect.w, rect.h, S + 6, 26, S, S)
      // shared grid every 50 m with world coordinates
      const step = c.size > 400 ? 100 : c.size > 150 ? 50 : 10
      ctx.font = '11px monospace'
      for (const ox of [0, S + 6]) {
        for (let w = Math.ceil((c.cx - c.size / 2) / step) * step; w < c.cx + c.size / 2; w += step) {
          const x = ox + ((w - (c.cx - c.size / 2)) / c.size) * S
          ctx.fillStyle = 'rgba(255,255,0,0.35)'
          ctx.fillRect(x, 26, 1, S)
          ctx.fillStyle = '#ff0'
          ctx.fillText(String(w), x + 2, 38)
        }
        for (let w = Math.ceil((c.cz - c.size / 2) / step) * step; w < c.cz + c.size / 2; w += step) {
          const y = 26 + ((w - (c.cz - c.size / 2)) / c.size) * S
          ctx.fillStyle = 'rgba(255,255,0,0.35)'
          ctx.fillRect(ox, y, S, 1)
          ctx.fillStyle = '#ff0'
          ctx.fillText(String(w), ox + 2, y - 2)
        }
      }
      ctx.fillStyle = '#fff'
      ctx.font = '14px sans-serif'
      ctx.fillText(`${c.name} — REAL (Aerial Photograph from Lands Department; private reference, do not redistribute)`, 6, 18)
      ctx.fillText(`MODEL top-down · centre x ${c.cx}, z ${c.cz} · ${c.size} m`, S + 12, 18)
    },
    { tiles: tilesFor(c), shot, rect, S, c, lines: lines.filter((l) => l.pts.some((q) => Math.abs(q[0] - c.cx) < c.size && Math.abs(q[1] - c.cz) < c.size)) },
  )
  writeFileSync(resolve(OUT, `${c.name}.jpg`), await sheet.screenshot({ type: 'jpeg', quality: 80 }))
  console.log(`${c.name}: centre ${c.cx},${c.cz} size ${c.size}`)
}
await browser.close()
