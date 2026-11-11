/**
 * fetch-official.ts — official HKUST naming.
 *
 * HKUST publishes its campus map as a schematic PDF (no coordinates, no data service), so the
 * official building names were transcribed by hand into data/curated/official-hkust.json.
 * This script (1) caches the PDF and HKUST's Path Advisor building list as evidence in
 * data/raw/hkust/ (git-ignored, © HKUST — not redistributed) and (2) converts the curated list
 * into data/processed/official-hkust.json for the world builder.
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const RAW_DIR = resolve(ROOT, 'data/raw/hkust')
const PDF = resolve(RAW_DIR, 'Campus_Map_Color.pdf')
const OUT = resolve(ROOT, 'data/processed/official-hkust.json')
const PDF_URL = 'https://publish.ust.hk/univ/maps/Campus_Map_Color.pdf'
const PATH_ADVISOR = 'https://pathadvisor.ust.hk/api/buildings'
const UA = 'hkust-voxel-campus-build/0.1 (one-off static data extract)'
const force = process.argv.includes('--force')

mkdirSync(RAW_DIR, { recursive: true })
mkdirSync(dirname(OUT), { recursive: true })
if (!existsSync(PDF) || force) {
  try {
    const res = await fetch(PDF_URL, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(60_000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    writeFileSync(PDF, buf)
    const pa = await fetch(PATH_ADVISOR, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30_000) }).then((r) => (r.ok ? r.text() : '{}'))
    writeFileSync(resolve(RAW_DIR, 'path-advisor-buildings.json'), pa)
    writeFileSync(
      resolve(RAW_DIR, 'source.json'),
      JSON.stringify({ pdf: PDF_URL, pathAdvisor: PATH_ADVISOR, fetchedAt: new Date().toISOString(), pdfSha256: createHash('sha256').update(buf).digest('hex') }, null, 2),
    )
    console.log('official: cached the official campus map PDF and Path Advisor building list')
  } catch (err) {
    console.warn(`official: could not refresh the evidence files (${(err as Error).message}); continuing with the curated list`)
  }
} else console.log('official: evidence files already cached in data/raw/hkust/')

interface Curated {
  sourceUrl: string
  transcribedOn: string
  buildings: { officialId: number; nameEn: string; nameZh: string; zone: number; code: string; aliases: string[] }[]
  places: { nameEn: string; nameZh: string; zone: number; osmName: string; osmKind?: string; note?: string }[]
}
const curated = JSON.parse(readFileSync(resolve(ROOT, 'data/curated/official-hkust.json'), 'utf8')) as Curated
const zonesCfg = JSON.parse(readFileSync(resolve(ROOT, 'data/campus-zones.json'), 'utf8')) as { zones: { id: number; nameEn: string; nameZh: string }[] }
const hallZone = zonesCfg.zones.find((z) => /Halls/.test(z.nameEn))?.id ?? -1
const staffZone = zonesCfg.zones.find((z) => /Staff/.test(z.nameEn))?.id ?? -1

writeFileSync(
  OUT,
  JSON.stringify(
    {
      metadata: {
        source: 'Official HKUST Campus Map (PDF), transcribed by hand',
        url: curated.sourceUrl,
        rights: '© The Hong Kong University of Science and Technology. Factual names only; used with attribution. Not an open-licensed dataset.',
        note: 'The official map has no coordinates: positions come from OpenStreetMap. Zones are a project grouping.',
        transcribedOn: curated.transcribedOn,
        extractedAt: new Date().toISOString(),
      },
      zones: zonesCfg.zones.map((z) => ({ id: z.id, nameEn: z.nameEn, nameZh: z.nameZh, point: null })),
      hostelTypes: { 1: 'Student hall / residence' },
      buildings: curated.buildings.map((b) => ({
        officialId: b.officialId,
        mapCode: '',
        shortCode: b.code,
        nameEn: b.nameEn,
        nameZh: b.nameZh,
        zoneId: b.zone,
        hostelType: (b.zone === hallZone || b.zone === staffZone) && /Hall|Tower|Quarters|Lodge/.test(b.nameEn) ? 1 : null,
        point: null,
        aliases: b.aliases,
      })),
      landmarks: [],
      places: curated.places,
      stops: [],
      facilities: [],
    },
    null,
    1,
  ),
)
console.log(`official: ${zonesCfg.zones.length} zones, ${curated.buildings.length} official building names, ${curated.places.length} places`)
