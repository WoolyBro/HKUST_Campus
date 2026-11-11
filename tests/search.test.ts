import { describe, expect, it } from 'vitest'
import { SearchIndex } from '../src/features/search/search'
import { loadWorld, worldBuilt } from './helpers'

describe.skipIf(!worldBuilt)('search', () => {
  const world = worldBuilt ? loadWorld() : null!
  const index = worldBuilt ? new SearchIndex(world.features, world.meta.zones) : null!
  const top = (q: string) => index.search(q)[0]?.feature

  it('finds buildings by official building code', () => {
    expect(top('CYT')?.name).toBe('Cheng Yu Tung Building')
    expect(top('lsk')?.name).toBe('Lee Shau Kee Business Building')
    expect(top('IAS')?.name).toContain('Institute for Advanced Study')
  })
  it('finds buildings by English and Chinese names', () => {
    expect(top('academic building')?.name).toBe('Academic Building')
    expect(top('學術大樓')?.name).toBe('Academic Building')
    expect(index.search('宿舍').length).toBeGreaterThan(3)
  })
  it('finds zones, landmarks and roads', () => {
    expect(top('Lee Shau Kee Campus')?.kind).toBe('zone')
    expect(top('North Bus Station')?.kind).toBe('landmark')
    expect(index.search('red bird').some((h) => h.feature.kind === 'landmark')).toBe(true)
    expect(index.search('road').some((h) => h.feature.kind === 'road')).toBe(true)
  })
  it('returns nothing for nonsense', () => {
    expect(index.search('zzzzqqq')).toEqual([])
    expect(index.search('   ')).toEqual([])
  })
})
