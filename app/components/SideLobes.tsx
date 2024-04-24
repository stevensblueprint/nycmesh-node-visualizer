import React, { useCallback } from 'react';
import { Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { LatLngExpression } from 'leaflet';

import { useAppSelector } from '../../lib/hooks';

import { SectorLobeProps } from '../types';

import { AccessPoint, ReducedPoints } from '../types';

function SideLobe({ key_path, val, ap, freqRange }: SectorLobeProps) {
  const center: LatLngExpression = [
    parseFloat(val.lat.trim()),
    parseFloat(val.lon.trim()),
  ];
  const radiusInMeters = 100;
  const sectorWidth = 45;

  const heading = ap.azimuth;

  const getColor = useCallback(
    (freq: number = ap.frequency) => {
      const section = (freqRange[1] - freqRange[0]) / 5;
      if (freq >= freqRange[0] && freq < freqRange[0] + section) {
        return '#43a047';
      } else if (
        freq >= freqRange[0] + section &&
        freq < freqRange[0] + section * 2
      ) {
        return '#679e20';
      } else if (
        freq >= freqRange[0] + section * 2 &&
        freq < freqRange[0] + section * 3
      ) {
        return '#8c9a00';
      } else if (
        freq >= freqRange[0] + section * 3 &&
        freq < freqRange[0] + section * 4
      ) {
        return '#b29000';
      } else if (freq >= freqRange[0] + section * 4 && freq <= freqRange[1]) {
        return '#d98000';
      }
      return '#ff6600';
    },
    [ap.frequency, freqRange]
  );

  let radius: number = 0;
  const radiusRange: number[][] = [
    [0, 45],
    [45, 135],
    [135, 225],
    [225, 315],
    [315, 360],
  ];
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

  const headingLeft = heading - 90;
  const headingRight = heading + 90;
  const headingBack = heading + 180 > 360 ? heading - 180 : heading + 180;

  const scaleFactor = (radius / earthCircumferenceAtLatitude) * 360 * 0.25;

  const sectorVerticesLeft: LatLngExpression[] = Array.from(
    { length: numberOfVertices + 1 },
    (_, index) => {
      const angle =
        (90 +
          headingLeft -
          sectorWidth / 2 +
          (sectorWidth * index) / numberOfVertices) *
        (Math.PI / 180);
      const lat = center[0] + scaleFactor * Math.sin(angle);
      const lon = center[1] + scaleFactor * Math.cos(angle);
      return [lat, lon];
    }
  );
  sectorVerticesLeft.push(center);

  const sectorVerticesRight: LatLngExpression[] = Array.from(
    { length: numberOfVertices + 1 },
    (_, index) => {
      const angle =
        (90 +
          headingRight -
          sectorWidth / 2 +
          (sectorWidth * index) / numberOfVertices) *
        (Math.PI / 180);
      const lat = center[0] + scaleFactor * Math.sin(angle);
      const lon = center[1] + scaleFactor * Math.cos(angle);
      return [lat, lon];
    }
  );
  sectorVerticesRight.push(center);

  const sectorVerticesBack: LatLngExpression[] = Array.from(
    { length: numberOfVertices + 1 },
    (_, index) => {
      const angle =
        (90 +
          headingBack -
          sectorWidth / 2 +
          (sectorWidth * index) / numberOfVertices) *
        (Math.PI / 180);
      const lat = center[0] + scaleFactor * Math.sin(angle);
      const lon = center[1] + scaleFactor * Math.cos(angle);
      return [lat, lon];
    }
  );
  sectorVerticesBack.push(center);

  return (
    <div>
      <Polygon
        pathOptions={{
          color: getColor(),
          fillColor: getColor(),
          fillOpacity: 0.5,
        }}
        key={key_path + 'left'}
        positions={sectorVerticesLeft}
      />
      <Polygon
        pathOptions={{
          color: getColor(),
          fillColor: getColor(),
          fillOpacity: 0.5,
        }}
        key={key_path + 'right'}
        positions={sectorVerticesRight}
      />
      <Polygon
        pathOptions={{
          color: getColor(),
          fillColor: getColor(),
          fillOpacity: 0.5,
        }}
        key={key_path + 'back'}
        positions={sectorVerticesBack}
      />
    </div>
  );
}

export default function SideLobes() {
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
  const sideLobes: JSX.Element[] = [];

  for (const [key, value] of Object.entries(reducedAntennas)) {
    for (const ap of value.points) {
      sideLobes.push(
        <SideLobe
          key={`${key} ${ap && ap.id ? ap.id : ''}`}
          key_path={`${key} ${ap && ap.id ? ap.id : ''}`}
          val={value}
          ap={ap as AccessPoint}
          freqRange={[minFreq, maxFreq]}
        />
      );
    }
  }

  return <div>{sideLobes}</div>;
}
