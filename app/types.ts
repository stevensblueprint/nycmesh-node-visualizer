// Interfaces
export type Antenna = {
  id: string;
  name: string;
  hostname: string;
  model: string;
  modelname: string;
  frequency: number;
  playground_frequency: number;
  latitude: string;
  longitude: string;
  azimuth: number;
  typeAntenna: number;
  antenna_status: string;
  cpu: number;
  ram: number;
};
export interface AccessPoint {
  id: string;
  modelName: string;
  lat: string;
  lon: string;
  frequency: number;
  azimuth: number;
  antenna_status: string;
  cpu: number;
  ram: number;
}

export interface ReducedContent {
  points: [AccessPoint?];
  lat: string;
  lon: string;
}

export interface ReducedPoints {
  [key: string]: ReducedContent;
}

// Props

export interface InfoProps {
  currentAntenna: AccessPoint | null;
  setCurrentAntenna: React.Dispatch<React.SetStateAction<AccessPoint | null>>;
  getToggle: boolean;
  changeToggle: () => void;
  antennasData: AccessPoint[];
}
export interface SectorLobesProps {
  antennasData: AccessPoint[];
}
export interface SectorLobeProps {
  key: string;
  val: ReducedContent;
}

export interface AntennaInfoProps {
  currentAntenna: AccessPoint | null;
  setCurrentAntenna: React.Dispatch<React.SetStateAction<AccessPoint | null>>;
  getToggle: boolean;
  changeToggle: React.Dispatch<React.SetStateAction<boolean>>;
}
