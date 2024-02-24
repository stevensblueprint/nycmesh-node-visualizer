import React, { useState } from 'react';
import { Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { LatLngExpression } from 'leaflet';

import { SectorLobeProps } from '../types';

export default function SectorLobe({ key, val }: SectorLobeProps) {
  const center: LatLngExpression = [
    parseFloat(val.lat.trim()),
    parseFloat(val.lon.trim()),
  ];
  const [radiusInMeters, setRadiusInMeters] = useState(100); // Adjust this as needed
  const [sectorWidth, setSectorWidth] = useState(45);
  const [heading, setHeading] = useState(0);

  // holds previous values in case they do not want to commit
  const [tempRadius, setTempRadius] = useState(100);
  const [tempSectorWidth, setTempSectorWidth] = useState(45);
  const [tempHeading, setTempHeading] = useState(0);

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

  function handleChangeRadius(e: React.ChangeEvent<HTMLInputElement>) {
    setTempRadius(Number(e.target.value));
  }

  function handleChangeSectorWidth(e: React.ChangeEvent<HTMLInputElement>) {
    setTempSectorWidth(Number(e.target.value));
  }

  function handleChangeHeading(e: React.ChangeEvent<HTMLInputElement>) {
    let numChange: number = Number(e.target.value);
    if (numChange < 0) {
      numChange = 0;
    } else if (numChange >= 360) {
      numChange = 359;
    }
    setTempHeading(numChange);
  }

  function handleCommit(
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent
  ) {
    e.preventDefault();
    setRadiusInMeters(tempRadius);
    setSectorWidth(tempSectorWidth);
    setHeading(tempHeading);
  }

  function handleCancel() {
    setTempRadius(radiusInMeters);
    setTempSectorWidth(sectorWidth);
    setTempHeading(heading);
  }

  return (
    <Polygon
      positions={sectorVertices}
      color="blue"
      fillOpacity={0.5}
      weight={1}
      key={String(key)}
    >
      <Popup>
        <form
          className="flex flex-col"
          id={`form ${String(key)}`}
          onSubmit={(e) => handleCommit(e)}
        >
          <p>Change Sector Lobe</p>
          <div className="my-2 flex flex-row">
            <label htmlFor="radius">Radius: </label>
            <input
              className="mx-2 rounded-md border-2 border-slate-400 hover:bg-slate-200 focus:border-black"
              type="text"
              name="radius"
              id="radius"
              value={String(tempRadius)}
              placeholder={String(radiusInMeters)}
              onChange={(e) => handleChangeRadius(e)}
            />{' '}
            m
          </div>
          <div className="my-2 flex flex-row">
            <label htmlFor="sectorwidth">Beam Width: </label>
            <input
              className="mx-2 rounded-md border-2 border-slate-400 hover:bg-slate-200 focus:border-black"
              type="text"
              name="sectorwidth"
              id="sectorwidth"
              value={String(tempSectorWidth)}
              placeholder={String(sectorWidth)}
              onChange={(e) => handleChangeSectorWidth(e)}
            />{' '}
            degrees
          </div>
          <div className="my-2 flex flex-row">
            <label htmlFor="heading">Heading: </label>
            <input
              className="mx-2 rounded-md border-2 border-slate-400 hover:bg-slate-200 focus:border-black"
              type="text"
              name="heading"
              id="heading"
              value={String(tempHeading)}
              placeholder={String(heading)}
              onChange={(e) => handleChangeHeading(e)}
            />{' '}
            degrees
          </div>
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
              onClick={() => handleCancel()}
            >
              Cancel
            </button>
          </div>
        </form>
      </Popup>
    </Polygon>
  );
}
