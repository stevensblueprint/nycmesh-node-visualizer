import React from 'react';
import { Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import access_points from '../../access_points.json';

// Types are temporary until the API is up and running
import {
  AccessPoint,
  InfoProps,
  ReducedPoints,
  ReducedContent,
} from '../types';

export default function Antennas({
  currentAntenna,
  setCurrentAntenna,
  getToggle,
  changeToggle,
}: InfoProps) {
  // Will be removed once calling the API is up and running
  function reduceAPs(): AccessPoint[] {
    const reduced: AccessPoint[] = [];
    for (let i: number = 0; i < access_points.length; i++) {
      const ap: AccessPoint = {
        id: access_points[i].identification.id,
        status: access_points[i].overview.status,
        cpu: access_points[i].overview.cpu,
        ram: access_points[i].overview.ram,
        lat: access_points[i].location.latitude,
        lon: access_points[i].location.longitude,
        modelName: access_points[i].identification.modelName,
      };
      reduced.push(ap);
    }
    return reduced;
  }

  const antennas: AccessPoint[] = reduceAPs();
  const reducedAntennas: ReducedPoints = {};

  for (let i = 0; i < antennas.length; i++) {
    const val: string = `${antennas[i]?.lat} ${antennas[i]?.lon}`;
    if (!(val in reducedAntennas)) {
      if (typeof antennas[i] === 'undefined' || antennas[i] === null) {
        continue;
      }
      reducedAntennas[val] = {
        points: [],
        lat: antennas[i].lat,
        lon: antennas[i].lon,
      };
    }
    reducedAntennas[val]['points'].push(antennas[i]);
  }

  const convertPoints = (points: [AccessPoint?]): [JSX.Element?] => {
    const converted: [JSX.Element?] = [];
    for (let i = 0; i < points.length; i++) {
      if (typeof points[i] === 'undefined' || points[i] === null) {
        continue;
      }
      converted.push(
        <div className="flex flex-row justify-center align-baseline">
          <p className="m-0 p-0">{points[i]?.modelName} --</p>
          <button
            className="ml-2 hover:text-black"
            onClick={() => {
              if (currentAntenna === null) {
                setCurrentAntenna(points[i] ?? null);
                if (!getToggle) {
                  changeToggle();
                }
              } else if (currentAntenna?.id === points[i]?.id) {
                changeToggle();
              } else {
                setCurrentAntenna(points[i] ?? null);
                if (!getToggle) {
                  changeToggle();
                }
              }
            }}
          >
            Info
          </button>
        </div>
      );
    }
    return converted;
  };

  return Object.entries(reducedAntennas).map(
    (value: [string, ReducedContent]) => (
      // Creation of the circle for each antenna
      <Circle
        center={[value[1].lat, value[1].lon]}
        radius={30}
        color="black"
        fillOpacity={1}
        fillColor="red"
        key={value[0]}
      >
        {/* Create a popup which has the names of all antennas at some node */}
        <Popup>
          <div className="m-0 p-0">
            Access Points: {value[1].points.length}
            {convertPoints(value[1].points)}
          </div>
        </Popup>
      </Circle>
    )
  );
}
