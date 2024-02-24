'use client';
import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  LayersControl,
  LayerGroup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import Antennas from './Antennas';
import SectorLobes from './SectorLobes';
import AntennaInfo from './AntennaInfo';

import { AccessPoint } from '../types';

function DynamicCircleRadius() {
  const map = useMap();

  useEffect(() => {
    const updateCircleRadius = () => {
      const zoom = map.getZoom();

      // Calculate a new radius based on the zoom level
      const newRadius = Math.max(5, 30 - Math.pow(2, zoom - 13));

      // Update the circle radius
      map.eachLayer((layer) => {
        if (layer instanceof L.Circle) {
          layer.setRadius(newRadius);
        }
      });
    };

    // Listen for zoom events and update the circle radius
    map.on('zoom', updateCircleRadius);

    // Initial update
    updateCircleRadius();

    return () => {
      map.off('zoom', updateCircleRadius);
    };
  }, [map]);

  return null;
}

export default function Map() {
  const [toggleInfo, setToggleInfo] = useState(false);

  const [currentAntenna, setCurrentAntenna] = useState<AccessPoint | null>(
    null
  );

  return (
    <>
      {toggleInfo ? (
        <AntennaInfo
          currentAntenna={currentAntenna}
          setCurrentAntenna={setCurrentAntenna}
          getToggle={toggleInfo}
          changeToggle={() => setToggleInfo(!toggleInfo)}
        />
      ) : null}
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
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DynamicCircleRadius />
        {/* Call anything you want to add to the map here. */}
        <LayersControl position="bottomleft">
          <LayersControl.Overlay name="Sector Lobes" checked>
            <LayerGroup>
              <SectorLobes />
            </LayerGroup>
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Antennas" checked>
            <LayerGroup>
              <Antennas
                currentAntenna={currentAntenna}
                setCurrentAntenna={setCurrentAntenna}
                getToggle={toggleInfo}
                changeToggle={() => setToggleInfo(!toggleInfo)}
              />
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </>
  );
}
