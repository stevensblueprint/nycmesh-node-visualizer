import React from 'react';
import { Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import access_points from '../../access_points.json';

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

export default function Antennas() {
  // Will be removed once calling the API is up and running
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

  const convertPoints = (points: [AccessPoint?]): [JSX.Element?] => {
    const converted: [JSX.Element?] = [];
    for (let i = 0; i < points.length; i++) {
      converted.push(<p className="m-0 p-0">{points[i]?.name}</p>);
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
