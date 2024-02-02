import React from 'react';

import { AntennaInfoProps } from '../types';

export default function AntennaInfo({
  currentAntenna,
  setCurrentAntenna,
  changeToggle,
}: AntennaInfoProps) {
  function renderInfo(): JSX.Element {
    return (
      <div>
        <div>
          <button
            className="float-right transition-all hover:text-gray-400 active:translate-y-[0.98px]"
            onClick={() => {
              changeToggle(false);
              setCurrentAntenna(null);
            }}
          >
            X
          </button>
        </div>
        <div className="">
          <p>ID: {currentAntenna && currentAntenna.modelName}</p>
          <p>Model Name: {currentAntenna && currentAntenna.id}</p>
          <p>Status: {currentAntenna && currentAntenna.status}</p>
          <p>CPU: {currentAntenna && currentAntenna.cpu}</p>
          <p>RAM: {currentAntenna && currentAntenna.ram}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-0 z-[1000] m-5 w-[30%] rounded-md border-2 border-black bg-slate-500 p-2">
      {currentAntenna === null ? (
        <div>
          <button
            className="float-right"
            onClick={() => {
              changeToggle(false);
            }}
          >
            X
          </button>
          <p>No Antenna Selected</p>
        </div>
      ) : (
        renderInfo()
      )}
    </div>
  );
}
