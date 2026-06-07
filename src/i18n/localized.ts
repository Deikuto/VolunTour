import type { City, Event, Issue, Lang } from '../types'

export const cityName = (city: City | undefined, lang: Lang) =>
  !city ? '' : lang === 'en' ? city.nameEn : city.name

export const cityRegion = (city: City | undefined, lang: Lang) =>
  !city ? '' : lang === 'en' ? city.regionEn : city.region

export const eventTitle = (e: Event, lang: Lang) => (lang === 'en' && e.titleEn) || e.title
export const eventCause = (e: Event, lang: Lang) => (lang === 'en' && e.causeEn) || e.cause
export const eventDesc = (e: Event, lang: Lang) => (lang === 'en' && e.descriptionEn) || e.description

export const issueTitle = (i: Issue, lang: Lang) => (lang === 'en' && i.titleEn) || i.title
export const issueDesc = (i: Issue, lang: Lang) => (lang === 'en' && i.descriptionEn) || i.description
export const issueLoc = (i: Issue, lang: Lang) => (lang === 'en' && i.locationTextEn) || i.locationText
