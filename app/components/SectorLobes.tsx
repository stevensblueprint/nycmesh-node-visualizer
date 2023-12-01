import React from 'react';
import { Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import access_points from '../../access_points.json';
import { LatLngExpression } from 'leaflet';

// ! Current known issues:
// ! 1. The sectorlobes, when tuned to different headings, the look of the width changes.
// !    This is because the way shapes are warped due to the projection of the map.
// ! 2. The sectorLobes do not represent the actual shape of the sectorLobe.
// !    This is because the sectorLobe is not a cone. It is an ellipse.
// !    So their needs to be a specific algorithm which will aid in the creation of the sectorLobe based on the model of the antenna.

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

  // Just plot a triangle for now
  // Triangle based on arc length of sectorlobe
  // 0.001 degrees is about 100 meters
  // Direction of triangle based on heading angle
  return Object.entries(reducedAntennas).map(
    (value: [string, ReducedContent]) => {
      const center: LatLngExpression = [value[1].lat, value[1].lon];
      const radiusInMeters: number = 100; // Adjust this as needed
      const sectorWidth: number = 20;
      const heading: number = 90;
      const radiusRange: number[][] = [
        [0, 45],
        [45, 135],
        [135, 225],
        [225, 315],
        [315, 360],
      ];
      let radius: number = 0;
      if (heading < radiusRange[0][1]) {
        // 0-45
        radius = radiusInMeters;
      } else if (heading < radiusRange[1][1]) {
        // 45-135
        radius = radiusInMeters - (radiusInMeters / 100) * 20;
      } else if (heading < radiusRange[2][1]) {
        // 135-225
        radius = radiusInMeters;
      } else if (heading < radiusRange[3][1]) {
        // 225-315
        radius = radiusInMeters - (radiusInMeters / 100) * 20;
      } else if (heading < radiusRange[4][1]) {
        // 315-360
        radius = radiusInMeters;
      }
      const numberOfVertices: number = 100;

      // Calculate the Earth's circumference at the given latitude
      const earthCircumferenceAtLatitude =
        40008000 * Math.cos((center[0] * Math.PI) / 180);

      const scaleFactor = (radius / earthCircumferenceAtLatitude) * 360;

      // Calculate the latitudes and longitudes for the sector lobe
      const sectorVertices: LatLngExpression[] = Array.from(
        { length: numberOfVertices + 1 },
        (_, index) => {
          const angle: number =
            (heading -
              sectorWidth / 2 +
              (sectorWidth * index) / numberOfVertices) *
            (Math.PI / 180);

          const lat: number = center[0] + scaleFactor * Math.sin(angle);
          const lng: number = center[1] + scaleFactor * Math.cos(angle);

          return [lat, lng];
        }
      );
      sectorVertices.push(center);

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
              <p>{radiusInMeters} meters</p>
              <p>{heading}</p>
            </div>
          </Popup>
        </Polygon>
      );
    }
  );
}
