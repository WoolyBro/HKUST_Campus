/**
 * Coordinate validation against official mapping.
 *
 * HKUST's own campus map is a schematic PDF without coordinates, so the independent reference
 * here is the Lands Department "Building" dataset (HKSAR Government). The latitude / longitude
 * values below are the centroids of the official polygons carrying each building's name,
 * recorded on 2026-11-10. The model's positions come from OpenStreetMap footprints, so these
 * tests check two independent sources against each other through the project's projection.
 */
import { describe, expect, it } from 'vitest'
import { lonLatToWorld } from '../src/lib/geo/projection'
import { loadWorld, worldBuilt } from './helpers'

const OFFICIAL: { name: string; lat: number; lon: number }[] = [
  { name: 'Shaw Auditorium', lat: 22.3339, lon: 114.263445 },
  { name: 'Lee Shau Kee Business Building', lat: 22.333323, lon: 114.264958 },
  { name: 'Cheng Yu Tung Building', lat: 22.334801, lon: 114.263444 },
  { name: 'Martin Ka Shing Lee Innovation Building', lat: 22.334399, lon: 114.264055 },
  { name: 'HKUST Jockey Club Institute for Advanced Study / Lo Ka Chung Building', lat: 22.332755, lon: 114.266268 },
  { name: 'Wong Check She Research Center for Environment and Infrastructure', lat: 22.333641, lon: 114.26281 },
  { name: 'Tsang Shiu Tim Sports Center', lat: 22.33772, lon: 114.267446 },
  { name: 'Staff Quarters Tower 3', lat: 22.339481, lon: 114.26439 },
]

describe.skipIf(!worldBuilt)('landmark coordinates vs Lands Department building polygons', () => {
  const world = worldBuilt ? loadWorld() : null!
  const building = (name: string) => world.features.find((f) => f.kind === 'building' && f.name === name)

  it.each(OFFICIAL)('$name sits on its official polygon', ({ name, lat, lon }) => {
    const f = building(name)
    expect(f, `${name} missing from the model`).toBeDefined()
    expect(f!.official).toBe(true)
    const p = lonLatToWorld(lon, lat)
    // the official centroid must fall inside (or within 15 blocks of) the modelled footprint
    const [x0, z0, x1, z1] = f!.bbox!
    const dx = Math.max(x0 - p.x, 0, p.x - x1),
      dz = Math.max(z0 - p.z, 0, p.z - z1)
    expect(Math.hypot(dx, dz)).toBeLessThan(15)
    // and the two centroids must be within 40 m of each other
    expect(Math.hypot(f!.x - p.x, f!.z - p.z)).toBeLessThan(40)
    // stored geographic position agrees with the block position
    const back = lonLatToWorld(f!.lon, f!.lat)
    expect(Math.hypot(back.x - f!.x, back.z - f!.z)).toBeLessThan(0.6)
  })

  it('keeps the campus the right way round', () => {
    const academic = building('Academic Building')!,
      sports = building('Tsang Shiu Tim Sports Center')!,
      lsk = building('Lee Shau Kee Business Building')!,
      lodge = building("President's Lodge")!
    expect(sports.x).toBeGreaterThan(academic.x) // the seafront sports centre is east of the Academic Building (+X = east)
    expect(lsk.z).toBeGreaterThan(academic.z) // the Lee Shau Kee Campus is to the south (+Z = south)
    expect(lodge.z).toBeLessThan(academic.z) // the President's Lodge is at the north end
  })

  it('reproduces the hillside: from the entrance level down to the sea', () => {
    const base = (name: string) => {
      const f = building(name)!
      return f.y - (f.heightM ?? 0)
    }
    expect(base('Academic Building')).toBeGreaterThan(90)
    expect(base('Tsang Shiu Tim Sports Center')).toBeLessThan(25)
    expect(base('Water Sports Center')).toBeLessThan(12) // on the waterfront
    expect(base('Lee Shau Kee Business Building')).toBeGreaterThan(base('Academic Building')) // the southern campus sits higher still
  })
})
