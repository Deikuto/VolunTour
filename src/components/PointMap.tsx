import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function pin(accent: string) {
  return L.divIcon({
    className: 'vot-pin',
    html: `<div style="
      width:30px;height:30px;border-radius:50% 50% 50% 0;
      background:${accent};transform:rotate(-45deg);
      box-shadow:0 4px 10px rgba(0,0,0,0.3);border:2.5px solid #fff;
      display:flex;align-items:center;justify-content:center;">
      <div style="width:9px;height:9px;background:#fff;border-radius:50%;transform:rotate(45deg);"></div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  })
}

/** A clean single-marker map used inside detail views. */
export default function PointMap({
  pos,
  accent = '#0E8C72',
  zoom = 13,
}: {
  pos: [number, number]
  accent?: string
  zoom?: number
}) {
  return (
    <MapContainer
      center={pos}
      zoom={zoom}
      scrollWheelZoom={false}
      dragging={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <Marker position={pos} icon={pin(accent)} />
    </MapContainer>
  )
}
