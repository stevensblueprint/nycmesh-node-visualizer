import React, { useState, useEffect, useEffect } from 'react';
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

import { AccessPoint, Antenna } from '../types';

export default function Map() {
  const [toggleInfo, setToggleInfo] = useState(false);
  const [currentAntenna, setCurrentAntenna] = useState<AccessPoint | null>(
    null
  );
  const [antennasData, setAntennasData] = useState<AccessPoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('./app/api/v1/antenna/');
        if (!response.ok) {
          throw new Error(`${response.status} error: Failed to fetch atnennas`);
        }
        const accessPoints = (await response.json()) as Antenna[];

        const antennasData: AccessPoint[] = accessPoints.map((ap: Antenna) => ({
          id: ap.id,
          modelName: ap.modelname,
          lat: ap.latitude,
          lon: ap.longitude,
          initialHeading: ap.initialheading,
          heading: ap.heading,
          radius: ap.radius,
        }));

        setAntennasData(antennasData);
      } catch (e) {
        console.log(e);
      }
    };
    fetchData().catch(console.error);
  }, []);

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
        <LayersControl position="bottomleft">
          <LayersControl.Overlay name="Sector Lobes" checked>
            <LayerGroup>
              <SectorLobes antennasData={antennasData} />
            </LayerGroup>
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Antennas" checked>
            <LayerGroup>
              <Antennas
                currentAntenna={currentAntenna}
                setCurrentAntenna={setCurrentAntenna}
                getToggle={toggleInfo}
                antennasData={antennasData}
          changeToggle={() => setToggleInfo(!toggleInfo)}
              />
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </>
  );
}
