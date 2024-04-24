import React, { useState, useEffect, useCallback } from 'react';
import { Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { LatLngExpression } from 'leaflet';

import { SectorLobeProps } from '../types';

import { useAppSelector, useAppDispatch } from '../../lib/hooks';

import { updateCurrent } from '@/lib/features/currentAntennas/currentAntennasSlice';
import { addToUpdatePlayground } from '@/lib/features/playground/playgroundSlice';

export default function SectorLobe({
  key_path,
  val,
  ap,
  freqRange,
}: SectorLobeProps) {
  const currentMode = useAppSelector(
    (state) => state.currentAntennas.value.mode
  );
  const dispatch = useAppDispatch();

  const center: LatLngExpression = [
    parseFloat(val.lat.trim()),
    parseFloat(val.lon.trim()),
  ];
  const radiusInMeters = 100;
  const sectorWidth = 45;

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

  const [heading, setHeading] = useState(ap.azimuth);
  const [freq, setFreq] = useState(ap.frequency);
  // const [color, setColor] = useState(getColor(ap.frequency));
  const [currentAp, setCurrentAp] = useState(ap);

  // holds previous values in case they do not want to commit
  const [tempHeading, setTempHeading] = useState(ap.azimuth);
  const [tempFreq, setTempFreq] = useState(ap.frequency);

  // Won't update if the ap changes without useEffect
  useEffect(() => {
    setHeading(ap.azimuth);
    setFreq(ap.frequency);
    setCurrentAp(ap);
    // setColor(getColor(ap.frequency));
    setTempHeading(ap.azimuth);
    setTempFreq(ap.frequency);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ap]);

  // useEffect(() => {
  //   setColor(getColor(freq));
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [freq]);

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

  const scaleFactor = (radius / earthCircumferenceAtLatitude) * 360;

  // Calculate the latitudes and longitudes for the sector lobe
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

  function handleChangeFreq(e: React.ChangeEvent<HTMLInputElement>) {
    const currFreq = Number(e.target.value);
    setTempFreq(currFreq);
    // setColor(getColor(currFreq));
  }

  function handleChangeHeading(e: React.ChangeEvent<HTMLInputElement>) {
    let numChange: number = Number(e.target.value);
    if (numChange < 0) {
      numChange = 0;
    } else if (numChange >= 360) {
      numChange = 0;
    }
    setTempHeading(numChange);
  }

  function handleCommit(
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent
  ) {
    e.preventDefault();
    setHeading(tempHeading);
    setFreq(tempFreq);
    const newAp = { ...currentAp };
    newAp.azimuth = tempHeading;
    newAp.frequency = tempFreq;
    setCurrentAp(newAp);
    if (currentMode === 'playground') {
      dispatch(addToUpdatePlayground(newAp));
      dispatch(updateCurrent(newAp));
    }
  }

  function handleCancel(
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent
  ) {
    e.preventDefault();
    setTempHeading(heading);
    setTempFreq(freq);
  }

  return (
    <Polygon
      pathOptions={{
        color: getColor(),
        fillOpacity: 0.5,
        weight: 3,
      }}
      positions={sectorVertices}
      key={String(key_path)}
    >
      <Popup>
        <form
          className="flex flex-col"
          id={`form ${String(key_path)}`}
          // onSubmit={(e) => handleCommit(e)}
        >
          <p>Change Sector Lobe of {ap.id}</p>
          <div className="my-2 flex flex-row">
            <label htmlFor="sectorwidth" className="mx-2">
              Frequency:{' '}
            </label>
            {currentMode === 'playground' ? (
              <input
                className="mx-2 rounded-md border-2 border-slate-400 hover:bg-slate-200 focus:border-black"
                type="text"
                name="sectorwidth"
                id="sectorwidth"
                value={String(tempFreq)}
                placeholder={String(freq)}
                onChange={(e) => handleChangeFreq(e)}
              />
            ) : (
              `${freq} `
            )}
            Hz
          </div>
          <div className="my-2 flex flex-row">
            <label htmlFor="heading" className="mx-2">
              Heading:
            </label>
            {currentMode === 'playground' ? (
              <input
                className="mx-2 rounded-md border-2 border-slate-400 hover:bg-slate-200 focus:border-black"
                type="text"
                name="heading"
                id="heading"
                value={String(tempHeading)}
                placeholder={String(heading)}
                onChange={(e) => handleChangeHeading(e)}
              />
            ) : (
              `${heading}`
            )}
            &deg;
          </div>
          {currentMode === 'playground' ? (
            <div className="flex flex-row justify-between">
              <button
                className="rounded-md border-[1px] border-black bg-green-300 p-1 hover:bg-green-900"
                onClick={(e) => handleCommit(e)}
                type="submit"
              >
                Save
              </button>
              <button
                className="rounded-md border-[1px] border-black bg-red-400 p-1 hover:bg-red-900"
                onClick={(e) => handleCancel(e)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <></>
          )}
        </form>
      </Popup>
    </Polygon>
  );
}
