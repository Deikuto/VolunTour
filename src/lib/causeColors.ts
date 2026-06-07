/**
 * Category colors for event causes. Distinct hues so the map pins and card
 * badges read as a legend at a glance. Kept separate from the aquamarine brand
 * palette on purpose: these are semantic category coding, not chrome.
 */
export interface CauseColor {
  bg: string
  text: string
}

const causeColors: Record<string, CauseColor> = {
  'почистване': { bg: '#D7F5EC', text: '#0E8C72' }, // cleanup — aqua-green
  'cleanup': { bg: '#D7F5EC', text: '#0E8C72' },
  'залесяване': { bg: '#DCFCE7', text: '#15803D' }, // reforestation — green
  'reforest': { bg: '#DCFCE7', text: '#15803D' },
  'реставрация': { bg: '#FEF3C7', text: '#B45309' }, // restoration — amber
  'restoration': { bg: '#FEF3C7', text: '#B45309' },
  'боядисване': { bg: '#FEF3C7', text: '#B45309' },
  'painting': { bg: '#FEF3C7', text: '#B45309' },
  'мониторинг': { bg: '#DBEAFE', text: '#0D47A1' }, // monitoring — blue
  'monitoring': { bg: '#DBEAFE', text: '#0D47A1' },
  'дюни': { bg: '#CFFAFE', text: '#0E7490' }, // dunes — cyan
  'dune': { bg: '#CFFAFE', text: '#0E7490' },
  'default': { bg: '#EDE9FE', text: '#6D28D9' }, // other — violet
}

export function getCauseColor(cause: string): CauseColor {
  const lower = cause.toLowerCase()
  for (const key of Object.keys(causeColors)) {
    if (key !== 'default' && lower.includes(key)) return causeColors[key]
  }
  return causeColors.default
}
