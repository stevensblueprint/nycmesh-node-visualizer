import React from 'react';
import 'leaflet/dist/leaflet.css';

import SectorLobe from './SectorLobe';

// ! Current known issues/map quirks:
// ! 1. The sectorlobes, when tuned to different headings, the look of the width changes.
// !    This is because the way shapes are warped due to the projection of the map.
// ! 2. The sectorLobes do not represent the actual shape of the sectorLobe.
// !    This is because the sectorLobe is not a cone. It is an ellipse.
// !    So their needs to be a specific algorithm which will aid in the creation of the sectorLobe based on the model of the antenna.

import { useAppSelector } from '../../lib/hooks';

// Types are temporary until the API is up and running
import { AccessPoint, ReducedPoints } from '../types';

export default function SectorLobes() {
  const antennasData = useAppSelector((state) => state.currentAntennas.value);

  let maxFreq = 0;
  let minFreq = 1000000;

  for (let i = 0; i < antennasData.data.length; i++) {
    if (antennasData.data[i].frequency > maxFreq) {
      maxFreq = antennasData.data[i].frequency;
    }
    if (antennasData.data[i].frequency < minFreq) {
      minFreq = antennasData.data[i].frequency;
    }
  }

  const antennas: AccessPoint[] = antennasData.data;

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

  // get all seperated sectroLobes
  const sectorLobes: JSX.Element[] = [];

  for (const [key, value] of Object.entries(reducedAntennas)) {
    for (const ap of value.points) {
      sectorLobes.push(
        <SectorLobe
          key={`${key} ${ap && ap.id ? ap.id : ''}`}
          key_path={`${key} ${ap && ap.id ? ap.id : ''}`}
          val={value}
          ap={ap as AccessPoint}
          freqRange={[minFreq, maxFreq]}
        />
      );
    }
  }

  return <div>{sectorLobes}</div>;
}
