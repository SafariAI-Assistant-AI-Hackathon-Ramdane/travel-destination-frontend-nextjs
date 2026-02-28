import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPage.css';
import { ArrowLeft, MapPin } from 'lucide-react';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [position, setPosition] = useState<[number, number]>([31.6295, -7.9811]); // Marrakech default

  const name = searchParams.get('name') || 'Attraction';
  const address = searchParams.get('address') || 'Marrakech';
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  useEffect(() => {
    if (lat && lng) {
      setPosition([parseFloat(lat), parseFloat(lng)]);
    } else {
      // Geocode using Nominatim (OpenStreetMap)
      const query = `${name}, ${address}`;
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          }
        })
        .catch(err => console.error('Geocoding error:', err));
    }
  }, [name, address, lat, lng]);

  return (
    <div className="map-page">
      <div className="map-header">
        <button className="map-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Retour
        </button>
        <div className="map-info">
          <h2>{name}</h2>
          <p><MapPin size={14} /> {address}</p>
        </div>
      </div>
      
      <MapContainer 
        center={position} 
        zoom={15} 
        style={{ height: 'calc(100vh - 80px)', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <strong>{name}</strong><br />
            {address}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapPage;
