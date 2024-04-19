import { Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Types are temporary until the API is up and running
import {
  AccessPoint,
  InfoProps,
  ReducedPoints,
  ReducedContent,
} from '../types';

import { useAppSelector } from '../../lib/hooks';

export default function Antennas({
  currentAntenna,
  setCurrentAntenna,
  getToggle,
  changeToggle,
}: InfoProps) {
  const antennasData = useAppSelector((state) => state.currentAntennas.value);

  const antennas: AccessPoint[] = antennasData.data;
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
        center={[
          parseFloat(value[1].lat.trim()),
          parseFloat(value[1].lon.trim()),
        ]}
        radius={30}
        color="black"
        fillOpacity={1}
        fillColor="red"
        key={value[0]}
      >
        {/* Create a popup which has the names of all antennas at some node */}
        <Popup>
          <div className="m-0 p-0" key={`${value[0]}_popup`}>
            Access Points: {value[1].points.length}
            {convertPoints(value[1].points)}
          </div>
        </Popup>
      </Circle>
    )
  );
}
