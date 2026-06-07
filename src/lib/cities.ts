import type { Lang } from '../types'
import { CITIES } from '../data/mockData'

/**
 * A "city group" is what the user filters by and what guide-eligibility is
 * checked against. Most cities are their own group. Несебър and Слънчев бряг
 * are merged into a single group because they sit on top of each other on the
 * coast and share one volunteer community.
 */
export interface CityGroup {
  id: string
  cityIds: string[]
  name: string
  nameEn: string
  region: string
  regionEn: string
  lat: number
  lng: number
}

const MERGED_ID = 'nesebar-sunnybeach'
const MERGED_MEMBERS = ['nesebar', 'sunnybeach']

const MERGED_GROUP: CityGroup = {
  id: MERGED_ID,
  cityIds: MERGED_MEMBERS,
  name: 'Несебър + Слънчев бряг',
  nameEn: 'Nesebar + Sunny Beach',
  region: 'Черноморие',
  regionEn: 'Black Sea Coast',
  lat: 42.6755,
  lng: 27.724,
}

/** All selectable groups, with the merged coastal group folded in once. */
export const CITY_GROUPS: CityGroup[] = (() => {
  const groups: CityGroup[] = []
  let mergedInserted = false
  for (const c of CITIES) {
    if (MERGED_MEMBERS.includes(c.id)) {
      if (!mergedInserted) {
        groups.push(MERGED_GROUP)
        mergedInserted = true
      }
      continue
    }
    groups.push({
      id: c.id,
      cityIds: [c.id],
      name: c.name,
      nameEn: c.nameEn,
      region: c.region,
      regionEn: c.regionEn,
      lat: c.lat,
      lng: c.lng,
    })
  }
  return groups
})()

/** The group id a given city belongs to. */
export function cityGroupId(cityId: string | undefined): string | undefined {
  if (!cityId) return undefined
  return MERGED_MEMBERS.includes(cityId) ? MERGED_ID : cityId
}

/** True when two cities belong to the same group (used for guide eligibility). */
export function sameCityGroup(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false
  return cityGroupId(a) === cityGroupId(b)
}

export function groupById(groupId: string | null | undefined): CityGroup | undefined {
  if (!groupId) return undefined
  return CITY_GROUPS.find(g => g.id === groupId)
}

export function groupLabel(group: CityGroup | undefined, lang: Lang): string {
  if (!group) return ''
  return lang === 'en' ? group.nameEn : group.name
}

export function groupRegion(group: CityGroup | undefined, lang: Lang): string {
  if (!group) return ''
  return lang === 'en' ? group.regionEn : group.region
}

/** Groups bucketed by region, for a tidy dropdown. */
export function groupsByRegion(lang: Lang): { region: string; groups: CityGroup[] }[] {
  const buckets = new Map<string, CityGroup[]>()
  for (const g of CITY_GROUPS) {
    const region = lang === 'en' ? g.regionEn : g.region
    if (!buckets.has(region)) buckets.set(region, [])
    buckets.get(region)!.push(g)
  }
  return Array.from(buckets, ([region, groups]) => ({ region, groups }))
}
