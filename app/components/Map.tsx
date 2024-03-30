'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  LayersControl,
  LayerGroup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
// import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import Antennas from './Antennas';
import SectorLobes from './SectorLobes';
import AntennaInfo from './AntennaInfo';

// Temporary until the API is up and running
import access_points from '../../access_points.json';
import { Device } from '../accessPointTypes';

import { useAppSelector, useAppDispatch, useAppStore } from '../../lib/hooks';

// import { AccessPoint, Antenna } from '../types';
import { AccessPoint } from '../types';

import { initializeActual } from '../../lib/features/actual/actualSlice';

import {
  initializePlayground,
  replacePlayground,
  replaceOldPlayground,
} from '../../lib/features/playground/playgroundSlice';

import {
  initializeCurrent,
  changeCurrent,
} from '../../lib/features/currentAntennas/currentAntennasSlice';

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

  const store = useAppStore();
  const initialized = useRef(false);

  const playgroundData = useAppSelector((state) => state.playground.value);
  const actualData = useAppSelector((state) => state.actual.value);
  const oldPlaygroundData = useAppSelector((state) => state.playground.old);

  const antennasData = useAppSelector((state) => state.currentAntennas.value);

  const dispatch = useAppDispatch();

  useEffect(() => {
    // async function fetchData(path: string, maxRetries = 3, retryDelay = 1000) {
    //   for (let attempt = 1; attempt <= maxRetries; attempt++) {
    //     try {
    //       const response = await fetch(path);
    //       if (!response.ok) {
    //         throw new Error(`${response.status} error: Failed to fetch`);
    //       }

    //       const responseJson = (await response.json()) as Antenna[];
    //       console.log('Antennas Data:', responseJson);
    //       return responseJson;
    //     } catch (e) {
    //       if (e instanceof Error) {
    //         console.error(`Attempt ${attempt} failed: ${e.message}`);
    //         if (attempt === maxRetries) throw e; // Rethrow error on last attempt
    //         await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Wait before retrying
    //       }
    //     }
    //   }
    // }

    const fetchDataAndSetAntennasData = () => {
      // const url = '/api/v1/antenna/';
      try {
        const accessPoints = access_points;
        if (accessPoints) {
          const antennasData: AccessPoint[] = accessPoints.map(
            (ap: Device) => ({
              id: ap.identification.id,
              modelName: ap.identification.modelName,
              lat: ap.location.latitude.toString(),
              lon: ap.location.longitude.toString(),
              frequency: ap.overview.frequency || 0,
              azimuth: ap.location.heading || 0,
              antenna_status: ap.overview.status || 'N/A',
              cpu: ap.overview.cpu || -1,
              ram: ap.overview.ram || -1,
            })
          );

          if (!initialized.current) {
            store.dispatch(initializeActual(antennasData));
            store.dispatch(initializePlayground(antennasData));
            store.dispatch(initializeCurrent(antennasData));
            initialized.current = true;
          }
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

    // fetchDataAndSetAntennasData().catch((error) => {
    //   console.error(error);
    // });
    fetchDataAndSetAntennasData();
  }, [store]);

  // function getSectorVertices(
  //   center: [number, number],
  //   radius: number,
  //   heading: number,
  //   sectorWidth: number,
  //   numberOfVertices: number
  // ): LatLngExpression[] {
  // const earthCircumferenceAtLatitude =
  //   40008000 * Math.cos((center[0] * Math.PI) / 180);

  // const scaleFactor = (radius / earthCircumferenceAtLatitude) * 360;

  //   const sectorVertices: LatLngExpression[] = Array.from(
  //     { length: 2 },
  //     (_, index) => {
  //       const angle: number =
  //         (90 +
  //           heading -
  //           sectorWidth / 2 +
  //           (sectorWidth * index) / numberOfVertices) *
  //         (Math.PI / 180);

  //       const lat: number = center[0] + scaleFactor * Math.sin(angle);
  //       // const lng: number = center[1] + scaleFactor * Math.cos(angle) * 0.3;
  //       const lng: number = center[1] + scaleFactor * Math.cos(angle);

  //       return [lat, lng];
  //     }
  //   );

  //   return sectorVertices;
  // }

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
          // boxShadow: '0 0 20px #ccc',
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
      <div className="m-5 flex flex-row justify-between align-middle">
        <div className="flex flex-row justify-center">
          <h1 className="mx-2 p-1 align-baseline">Current mode: </h1>
          <button
            className="rounded-md border-[1px] border-black bg-gray-400 p-1 transition-all duration-300 ease-in-out hover:bg-gray-900"
            onClick={() => {
              if (antennasData.mode === 'actual') {
                dispatch(
                  changeCurrent({
                    mode: 'playground',
                    data: playgroundData,
                  })
                );
              } else {
                dispatch(replacePlayground(antennasData.data));
                dispatch(
                  changeCurrent({
                    mode: 'actual',
                    data: actualData,
                  })
                );
              }
            }}
          >
            {antennasData.mode === 'actual' ? 'Current' : 'Playground'}
          </button>
        </div>
        {antennasData.mode === 'playground' ? (
          <div>
            <button
              className="mx-2 rounded-md border-[1px] border-black bg-gray-400 p-1 transition-all duration-300 ease-in-out hover:bg-gray-900"
              onClick={() => {
                dispatch(
                  changeCurrent({ mode: 'playground', data: oldPlaygroundData })
                );
              }}
            >
              Revert Changes
            </button>
            <button
              className="mx-2 rounded-md border-[1px] border-black bg-gray-400 p-1 transition-all duration-300 ease-in-out hover:bg-gray-900"
              onClick={() => {
                dispatch(replaceOldPlayground(antennasData.data));
              }}
            >
              Save Changes
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
