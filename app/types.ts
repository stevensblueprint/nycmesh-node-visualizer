// Interfaces

export interface AccessPoint {
  id: string;
  modelName: string;
  status: string;
  cpu: number | null;
  ram: number | null;
  lat: number;
  lon: number;
}

export interface ReducedContent {
  points: [AccessPoint?];
  lat: number;
  lon: number;
}

export interface ReducedPoints {
  [key: string]: ReducedContent;
}

export interface labeledFrequencies {
  id: number;
  frequency: number;
}

// Props

export interface InfoProps {
  currentAntenna: AccessPoint | null;
  setCurrentAntenna: React.Dispatch<React.SetStateAction<AccessPoint | null>>;
  getToggle: boolean;
  changeToggle: () => void;
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
