import React from 'react';
import 'leaflet/dist/leaflet.css';

import access_points from '../../access_points.json';
import SectorLobe from './SectorLobe';

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

  return Object.entries(reducedAntennas).map(
    (value: [string, ReducedContent]) => {
      return <SectorLobe key={value[0]} val={value[1]} />;
    }
  );
}
