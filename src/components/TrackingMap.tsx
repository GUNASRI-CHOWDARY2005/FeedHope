import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RescueRequest } from '../types';
// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});
const customIcon = (color: string) =>
new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl:
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
function MapBounds({ rescue }: {rescue: RescueRequest;}) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds([[rescue.latitude, rescue.longitude]]);
    if (rescue.ngo_latitude && rescue.ngo_longitude) {
      bounds.extend([rescue.ngo_latitude, rescue.ngo_longitude]);
    }
    // In a real app, we'd also extend bounds to include volunteer live location
    map.fitBounds(bounds, {
      padding: [50, 50]
    });
  }, [rescue, map]);
  return null;
}
export function TrackingMap({ rescue }: {rescue: RescueRequest;}) {
  return (
    <div className="h-full w-full rounded-xl overflow-hidden border shadow-sm relative z-0">
      <MapContainer
        center={[rescue.latitude, rescue.longitude]}
        zoom={13}
        style={{
          height: '100%',
          width: '100%'
        }}>
        
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' />
        

        {/* Person Location */}
        <Marker
          position={[rescue.latitude, rescue.longitude]}
          icon={customIcon('red')}>
          
          <Popup>
            <strong>Reported Location</strong>
            <br />
            {rescue.address}
          </Popup>
        </Marker>

        {/* NGO Location */}
        {rescue.ngo_latitude && rescue.ngo_longitude &&
        <Marker
          position={[rescue.ngo_latitude, rescue.ngo_longitude]}
          icon={customIcon('green')}>
          
            <Popup>
              <strong>{rescue.assigned_ngo_name}</strong>
              <br />
              {rescue.ngo_address}
            </Popup>
          </Marker>
        }

        {/* Volunteer Location (Mocked slightly offset from person if en route) */}
        {['volunteer_en_route', 'traveling_to_ngo'].includes(rescue.status) &&
        <Marker
          position={[rescue.latitude - 0.005, rescue.longitude + 0.005]}
          icon={customIcon('blue')}>
          
            <Popup>
              <strong>Volunteer: {rescue.assigned_volunteer_name}</strong>
              <br />
              Live Location
            </Popup>
          </Marker>
        }

        <MapBounds rescue={rescue} />
      </MapContainer>
    </div>);

}