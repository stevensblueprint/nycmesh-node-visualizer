import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  LayersControl,
  LayerGroup,
} from 'react-leaflet';
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
    async function fetchData(path: string, maxRetries = 3, retryDelay = 1000) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(path);
          if (!response.ok) {
            throw new Error(`${response.status} error: Failed to fetch`);
          }

          const responseJson = (await response.json()) as Antenna[];
          console.log('Antennas Data:', responseJson);
          return responseJson;
        } catch (e) {
          if (e instanceof Error) {
            console.error(`Attempt ${attempt} failed: ${e.message}`);
            if (attempt === maxRetries) throw e; // Rethrow error on last attempt
            await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Wait before retrying
          }
        }
      }
    }

    const fetchDataAndSetAntennasData = async () => {
      const url = '/api/v1/antenna/';
      try {
        const accessPoints = await fetchData(url);
        if (accessPoints) {
          const antennasData: AccessPoint[] = accessPoints.map(
            (ap: Antenna) => ({
              id: ap.id,
              modelName: ap.modelname,
              lat: ap.latitude,
              lon: ap.longitude,
              frequency: ap.frequency,
              azimuth: ap.azimuth,
              antenna_status: ap.antenna_status,
              cpu: ap.cpu,
              ram: ap.ram,
            })
          );

          setAntennasData(antennasData);
        }
      } catch (e) {
        if (e instanceof Error) {
          const statusCode = parseInt(e.message.substring(0, 4));

          switch (statusCode) {
            case 404:
              alert('404: The requested resource was not found.');
              break;
            case 500:
              alert(
                '500: A server error has occurred. Please try again later.'
              );
              break;
            default:
              alert('An unexpected error has occurred.');
          }
        }
      }
    };

    fetchDataAndSetAntennasData().catch((error) => {
      console.error(error);
    });
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
