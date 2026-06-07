import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Calendar, Users, ArrowRight } from 'lucide-react'
import type { Event } from '../types'
import { eventCoords, BG_CENTER } from '../lib/geo'
import { useLang } from '../context/LanguageContext'
import { cityName, eventTitle, eventCause } from '../i18n/localized'
import { getCauseColor } from '../lib/causeColors'
import { CITIES } from '../data/mockData'

interface EventsMapProps {
  events: Event[]
  onOpen?: (event: Event) => void
}

// Generous box around Bulgaria — the map can't be panned away from the country.
const BG_BOUNDS = L.latLngBounds([40.8, 22.0], [44.6, 29.2])

function pinIcon(accent: string) {
  return L.divIcon({
    className: 'vot-pin',
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${accent};transform:rotate(-45deg);
      box-shadow:0 4px 10px rgba(0,0,0,0.28);border:2.5px solid #fff;
      display:flex;align-items:center;justify-content:center;">
      <div style="width:8px;height:8px;background:#fff;border-radius:50%;transform:rotate(45deg);"></div>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -26],
  })
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 10)
    } else if (points.length > 1) {
      map.fitBounds(points as L.LatLngBoundsExpression, { padding: [50, 50], maxZoom: 10 })
    } else {
      map.fitBounds(BG_BOUNDS, { padding: [20, 20] })
    }
  }, [points, map])
  return null
}

/** Scroll-to-zoom only while the cursor is over the map (no scroll hijacking). */
function HoverScrollZoom() {
  const map = useMap()
  useEffect(() => {
    const el = map.getContainer()
    const enable = () => map.scrollWheelZoom.enable()
    const disable = () => map.scrollWheelZoom.disable()
    el.addEventListener('mouseenter', enable)
    el.addEventListener('mouseleave', disable)
    return () => {
      el.removeEventListener('mouseenter', enable)
      el.removeEventListener('mouseleave', disable)
    }
  }, [map])
  return null
}

export default function EventsMap({ events, onOpen }: EventsMapProps) {
  const { lang, t } = useLang()

  const markers = useMemo(
    () => events.map(e => ({
      event: e,
      pos: eventCoords(e),
      color: getCauseColor(`${e.cause} ${e.causeEn ?? ''} ${e.tags.join(' ')}`).text,
    })),
    [events]
  )
  const points = useMemo(() => markers.map(m => m.pos), [markers])

  return (
    <div className="aqua-map rounded-2xl overflow-hidden border border-[#0E8C72]/15 shadow-sm h-72 sm:h-[26rem]">
      <MapContainer
        center={BG_CENTER}
        zoom={7}
        minZoom={6}
        maxZoom={15}
        scrollWheelZoom={false}
        zoomControl={false}
        maxBounds={BG_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%', background: '#EFFAF6' }}
      >
        {/* Flat, label-light basemap — tinted aquamarine via CSS for a clean, modern look */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
        <FitBounds points={points} />
        <HoverScrollZoom />
        {markers.map(({ event, pos, color }) => {
          const city = CITIES.find(c => c.id === event.cityId)
          return (
            <Marker
              key={event.id}
              position={pos}
              icon={pinIcon(color)}
              eventHandlers={{ click: () => onOpen?.(event) }}
            >
              <Popup>
                <div style={{ minWidth: 190 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: '0 0 4px', color: '#1A1A1A' }}>
                    {eventTitle(event, lang)}
                  </p>
                  <p style={{ fontSize: 11, color, margin: '0 0 6px', fontWeight: 700 }}>
                    {eventCause(event, lang)} · {cityName(city, lang)}
                  </p>
                  <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#6B7280', marginBottom: 8 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Calendar size={12} /> {event.date}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Users size={12} /> {event.participants.length}/{event.maxParticipants}
                    </span>
                  </div>
                  <button
                    onClick={() => onOpen?.(event)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                      background: '#0E8C72', color: '#fff', border: 'none', borderRadius: 8,
                      padding: '5px 10px', fontSize: 11, fontWeight: 700,
                    }}
                  >
                    {t('card.viewdetails')} <ArrowRight size={12} />
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
