'use client';
import { MapContainer, TileLayer } from 'react-leaflet';
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css';

const DynamicHeader = dynamic(() => import('../components/header'), {
  ssr: false,
})

export default function Home() {
  return (
    <>
      <MapContainer
        style={{
          height: 800,
          margin: 10,
          padding: 0,
          borderRadius: 10,
          border: '4px solid black',
          boxShadow: '0 0 20px #ccc',
        }}
        center={[40.73061, -73.935242]}
        zoom={13}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </>
  );
}
