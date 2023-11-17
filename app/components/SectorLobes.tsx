import React from 'react';
import { Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import access_points from '../../access_points.json';
import { LatLngExpression } from 'leaflet';

// Types are temporary until the API is up and running
type AccessPoint = {
  lat: number;
  lon: number;
  name: string;
};

interface ReducedContent {
  points: [AccessPoint?];
  lat: number;
  lon: number;
}

interface ReducedPoints {
  [key: string]: ReducedContent;
}

export default function SectorLobes() {
  function reduceAPs(): [AccessPoint] {
    const reduced: [AccessPoint] = [
      {
        lat: 0,
        lon: 0,
        name: 'default',
      },
    ];
    for (let i: number = 0; i < access_points.length; i++) {
      const ap: AccessPoint = {
        lat: access_points[i].location.latitude,
        lon: access_points[i].location.longitude,
        name: access_points[i].identification.name,
      };
      reduced.push(ap);
    }
    return reduced;
  }

  const antennas: [AccessPoint] = reduceAPs();
  const reducedAntennas: ReducedPoints = {};

  for (let i = 0; i < antennas.length; i++) {
    const val: string = `${antennas[i].lat} ${antennas[i].lon}`;
    if (!(val in reducedAntennas)) {
      reducedAntennas[val] = {
        points: [],
        lat: antennas[i].lat,
        lon: antennas[i].lon,
      };
    }
    reducedAntennas[val]['points'].push(antennas[i]);
  }

  //   const metersToLat = (meters) => {
  //   return meters / 110574;
  // };

  // export const metersToLng = (meters, lat) => {
  //   return meters / (111320 * Math.cos((lat * Math.PI) / 180));
  // };

  // Just plot a triangle for now
  // Triangle based on arc length of sectorlobe
  // 0.001 degrees is about 100 meters
  // Direction of triangle based on heading angle

  return Object.entries(reducedAntennas).map(
    (value: [string, ReducedContent]) => {
      // const heading: number = 360;
      // Center of the sector
      const center = [value[1].lat, value[1].lon];

      // Radius of the sector in meters
      const radius = 120 * Math.pow(10, -5); // Change this value as needed
      console.log(radius);
      // const earthRadius: number = 6371000; // Earth's radius in meters
      // const radiusInDegrees: number = radius / earthRadius;

      // Convert radius from meters to degrees
      // const radiusInDegrees = radius / (40008000 / 360);

      // Angle range of the sector in degrees
      const sectorWidth = 45; // Change this value as needed, this is the angle of the sector lobe
      const heading = 270; // Heading in degrees (0-360)

      // Number of vertices to create a smooth sector shape
      const numberOfVertices = 10;

      // Calculate the latitudes and longitudes for the sector lobe
      const sectorVertices: LatLngExpression[] = Array.from(
        { length: numberOfVertices + 1 },
        (_, index) => {
          const angle: number =
            (heading -
              sectorWidth / 2 +
              (sectorWidth * index) / numberOfVertices) *
            (Math.PI / 180);
          const lat: number = center[0] + radius * Math.sin(angle);
          const lng: number = center[1] + radius * Math.cos(angle);
          return [lat, lng];
        }
      );

      sectorVertices.push([value[1].lat, value[1].lon]);

      console.log(sectorVertices);
      console.log(value);
      return (
        <Polygon
          positions={sectorVertices}
          color="blue"
          fillOpacity={0.5}
          weight={1}
          key={String(value[0])}
        >
          <Popup>
            <div>
              <p>{radius}</p>
              <p>{heading}</p>
            </div>
          </Popup>
        </Polygon>
      );
    }
  );
}
