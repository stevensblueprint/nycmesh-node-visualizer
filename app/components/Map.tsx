'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  LayersControl,
  LayerGroup,
  useMap,
} from 'react-leaflet';

import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { intersect } from '@turf/intersect';
import { polygon } from '@turf/helpers';
import { Position } from 'geojson';

import Antennas from './Antennas';
import SectorLobes from './SectorLobes';
import AntennaInfo from './AntennaInfo';
import SideLobes from './SideLobes';

import { useAppSelector, useAppDispatch, useAppStore } from '../../lib/hooks';

import { AccessPoint, SectorlobeData, Antenna } from '../types';

import { initializeActual } from '../../lib/features/actual/actualSlice';

import {
  initializePlayground,
  replacePlayground,
  replaceOldPlayground,
  clearToUpdatePlayground,
  replaceToUpdatePlayground,
} from '../../lib/features/playground/playgroundSlice';

import {
  initializeCurrent,
  changeCurrent,
} from '../../lib/features/currentAntennas/currentAntennasSlice';

function IntersectionInfo({
  intersections,
  setPanToCoords,
}: {
  intersections: SectorlobeData[][][];
  setPanToCoords: (coords: L.LatLngExpression) => void;
}) {
  return (
    <div className="flex flex-col justify-center text-center align-middle">
      {intersections.map((intersection, index) => {
        return (
          <div key={index}>
            {intersection.map((pair: SectorlobeData[], index: number) => {
              const lobe1 = pair[0];
              const lobe2 = pair[1];
              return (
                <div key={index} className="mx-2 flex flex-col justify-center">
                  <p>Frequency {lobe1.frequency} intersection between lobes </p>
                  <p className="mx-2">
                    {lobe1.id} and {lobe2.id}
                  </p>
                  <button
                    className="text-gray-400 transition-all hover:text-gray-600"
                    onClick={() => setPanToCoords(lobe1.center)}
                  >
                    Go to
                  </button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

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

function RecenterMap({
  panToCoords,
  setPanToCoords,
}: {
  panToCoords: LatLngExpression;
  setPanToCoords: (coords: LatLngExpression | null) => void;
}) {
  const map = useMap();
  if (panToCoords) {
    map.setView(panToCoords, map.getZoom());
    setPanToCoords(null);
  }
  return null;
}

export default function Map() {
  const [toggleInfo, setToggleInfo] = useState(false);
  const [intersections, setIntersections] = useState<SectorlobeData[][][]>([]);
  const [panToCoords, setPanToCoords] = useState<LatLngExpression | null>(null);
  const [intersectionToggle, setIntersectionToggle] = useState(false);

  const [currentAntenna, setCurrentAntenna] = useState<AccessPoint | null>(
    null
  );

  const store = useAppStore();
  const initialized = useRef(false);

  const playgroundData = useAppSelector((state) => state.playground.value);
  const actualData = useAppSelector((state) => state.actual.value);
  const oldPlaygroundData = useAppSelector((state) => state.playground.old);

  const antennasData = useAppSelector((state) => state.currentAntennas.value);

  const toBeUpdated = useAppSelector((state) => state.playground.toBeUpdated);

  const dispatch = useAppDispatch();

  useEffect(() => {
    async function fetchData(path: string, maxRetries = 3, retryDelay = 1000) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(path);
          if (!response.ok) {
            throw new Error(`${response.status} error: Failed to fetch`);
          }

          const responseJson = (await response.json()) as Antenna[];

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
              frequency: ap.frequency || 0,
              azimuth: ap.azimuth || 0,
              antenna_status: ap.antenna_status || 'N/A',
              cpu: ap.cpu || -1,
              ram: ap.ram || -1,
            })
          );

          const playgroundAntennasData: AccessPoint[] = accessPoints.map(
            (ap: Antenna) => ({
              id: ap.id,
              modelName: ap.modelname,
              lat: ap.latitude,
              lon: ap.longitude,
              frequency: ap.playground_frequency || 0,
              azimuth: ap.azimuth || 0,
              antenna_status: ap.antenna_status || 'N/A',
              cpu: ap.cpu || -1,
              ram: ap.ram || -1,
            })
          );

          if (!initialized.current) {
            store.dispatch(initializeActual(antennasData));
            store.dispatch(initializePlayground(playgroundAntennasData));
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

    fetchDataAndSetAntennasData().catch((error) => {
      console.error(error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sectorlobesData: SectorlobeData[] = antennasData.data.map((ap) => {
      const center: L.LatLngTuple = [
        parseFloat(ap.lat.trim()),
        parseFloat(ap.lon.trim()),
      ];
      const heading = ap.azimuth;
      const radiusInMeters = 100;
      const sectorWidth = 45;
      let radius: number = 0;

      if (heading < 45) {
        // 0-45
        radius = radiusInMeters;
      } else if (heading < 135) {
        // 45-135
        radius = radiusInMeters - (radiusInMeters / 100) * 20;
      } else if (heading < 225) {
        // 135-225
        radius = radiusInMeters;
      } else if (heading < 315) {
        // 225-315
        radius = radiusInMeters - (radiusInMeters / 100) * 20;
      } else if (heading <= 360) {
        // 315-360
        radius = radiusInMeters;
      }
      const numberOfVertices: number = 100;
      const earthCircumferenceAtLatitude =
        40008000 * Math.cos((center[0] * Math.PI) / 180);

      const scaleFactor = (radius / earthCircumferenceAtLatitude) * 360;
      const sectorVertices: LatLngExpression[] = Array.from(
        { length: numberOfVertices + 1 },
        (_, index) => {
          const angle: number =
            (90 +
              heading -
              sectorWidth / 2 +
              (sectorWidth * index) / numberOfVertices) *
            (Math.PI / 180);

          const lat: number = center[0] + scaleFactor * Math.sin(angle);
          // const lng: number = center[1] + scaleFactor * Math.cos(angle) * 0.3;
          const lng: number = center[1] + scaleFactor * Math.cos(angle);

          return [lat, lng];
        }
      );
      sectorVertices.push(center);
      return {
        id: ap.id,
        center,
        sectorVertices,
        frequency: ap.frequency,
      };
    });
    // gather lobes into clusters by frequency
    if (sectorlobesData.length > 0) {
      const clusters: { [key: string]: SectorlobeData[] } = {};
      const foundIntersections: { [key: string]: SectorlobeData[][] } = {};
      for (const lobe of sectorlobesData) {
        const key = lobe.frequency.toString();
        if (!(key in clusters)) {
          clusters[key] = [];
        }
        clusters[key].push(lobe);
      }

      // for each cluster, find if any lobes overlap
      for (const key in clusters) {
        const cluster = clusters[key];
        for (let i = 0; i < cluster.length; i++) {
          const lobe1 = cluster[i];
          for (let j = i + 1; j < cluster.length; j++) {
            const lobe2 = cluster[j];

            // Convert the LatLngExpression[] to a Position[] for turf.js
            const lobe1Positions: Position[] = lobe1.sectorVertices.map(
              (vertex) => {
                if (Array.isArray(vertex)) {
                  return [vertex[1], vertex[0]];
                } else {
                  return [vertex.lng, vertex.lat];
                }
              }
            );

            const lobe2Positions: Position[] = lobe2.sectorVertices.map(
              (vertex) => {
                if (Array.isArray(vertex)) {
                  return [vertex[1], vertex[0]];
                } else {
                  return [vertex.lng, vertex.lat];
                }
              }
            );

            const center1: Position = [lobe1.center[1], lobe1.center[0]];

            const center2: Position = [lobe2.center[1], lobe2.center[0]];

            lobe1Positions.unshift(center1);
            lobe2Positions.unshift(center2);

            const poly1 = polygon([lobe1Positions]);
            const poly2 = polygon([lobe2Positions]);
            const intersection = intersect({
              type: 'FeatureCollection',
              features: [poly1, poly2],
            });
            if (intersection) {
              if (!(key in foundIntersections)) {
                foundIntersections[key] = [];
              }
              foundIntersections[key].push([lobe1, lobe2]);
            }
          }
        }
      }
      setIntersections(Object.values(foundIntersections));
    }
  }, [antennasData]);

  const getAmountOfIntersections = useMemo(() => {
    let amount = 0;
    for (let i = 0; i < intersections.length; i++) {
      amount += intersections[i].length;
    }
    return amount;
  }, [intersections]);

  const handleSavePlayground = async () => {
    const url = '/api/v1/antenna/';
    if (toBeUpdated.length === 0) {
      alert('No changes to save');
      return;
    }
    for (let i = 0; i < 3; i++) {
      try {
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dataArray: toBeUpdated }),
        });
        if (!response.ok) {
          throw new Error(
            `${response.status} error: Failed to save playground data`
          );
        }
        dispatch(replacePlayground(antennasData.data));
        dispatch(replaceOldPlayground(antennasData.data));
        dispatch(clearToUpdatePlayground());
        alert('Playground data saved successfully');
        break;
      } catch (e) {
        if (e instanceof Error) {
          console.error(`Attempt ${i + 1} failed: ${e.message}`);
          if (i === 2) {
            alert('Failed to save playground data');
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
  };

  return (
    <>
      <div className="absolute right-0 top-0 z-[1001] flex flex-col justify-center rounded-md bg-black p-2">
        {intersections.length > 0 ? (
          <p className="text-center text-red-600">
            Found {getAmountOfIntersections} intersection
            {getAmountOfIntersections > 1 ? 's' : ''}
          </p>
        ) : (
          <p className="text-center text-green-600">No intersections found</p>
        )}
        {intersectionToggle && intersections.length > 0 ? (
          <IntersectionInfo
            intersections={intersections}
            setPanToCoords={(coords: LatLngExpression) =>
              setPanToCoords(coords)
            }
          />
        ) : null}
        {intersections.length > 0 ? (
          <button
            className={
              !intersectionToggle
                ? 'transition-all hover:text-gray-400'
                : 'absolute right-2 top-2 transition-all hover:text-gray-400'
            }
            onClick={() => setIntersectionToggle(!intersectionToggle)}
          >
            {!intersectionToggle ? 'Check' : 'Close'}
          </button>
        ) : null}
      </div>
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
        {panToCoords ? (
          <RecenterMap
            panToCoords={panToCoords}
            setPanToCoords={setPanToCoords}
          />
        ) : null}
        {/* Call anything you want to add to the map here. */}
        <LayersControl position="bottomleft">
          <LayersControl.Overlay name="Side Lobes" checked>
            <LayerGroup>
              <SideLobes />
            </LayerGroup>
          </LayersControl.Overlay>
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
          <div>
            <button
              className="rounded-md border-[1px] border-black bg-gray-400 p-1 transition-all duration-300 ease-in-out hover:bg-gray-900"
              onClick={() => alert('Updating from NYCMesh server...')}
            >
              Update from Server
            </button>
          </div>
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
        </div>
        {antennasData.mode === 'playground' ? (
          <div>
            <button
              className="mx-2 rounded-md border-[1px] border-black bg-gray-400 p-1 transition-all duration-300 ease-in-out hover:bg-gray-900"
              onClick={() => {
                if (toBeUpdated.length > 0) {
                  dispatch(replaceToUpdatePlayground([]));
                }
                const updatedData: AccessPoint[] = actualData.filter(
                  (antenna) => {
                    return (
                      playgroundData.find(
                        (oldAntenna) =>
                          oldAntenna.id === antenna.id &&
                          oldAntenna.frequency === antenna.frequency &&
                          oldAntenna.azimuth === antenna.azimuth
                      ) === undefined
                    );
                  }
                );
                if (updatedData.length > 0) {
                  dispatch(replaceToUpdatePlayground(updatedData));
                }
                dispatch(
                  changeCurrent({
                    mode: 'playground',
                    data: actualData,
                  })
                );
              }}
            >
              Revert All Changes
            </button>
            <button
              className="mx-2 rounded-md border-[1px] border-black bg-gray-400 p-1 transition-all duration-300 ease-in-out hover:bg-gray-900"
              onClick={() => {
                dispatch(
                  changeCurrent({ mode: 'playground', data: oldPlaygroundData })
                );
                dispatch(clearToUpdatePlayground());
              }}
            >
              Revert Current Changes
            </button>
            <button
              className="mx-2 rounded-md border-[1px] border-black bg-gray-400 p-1 transition-all duration-300 ease-in-out hover:bg-gray-900"
              onClick={() => void handleSavePlayground()}
            >
              Save Changes
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
