type Site = {
  id: string | null;
  name: string | null;
  status: string | null;
  type: string | null;
  parent: Site | null;
};

type PSU = {
  psuType: string | null;
  connected: boolean | null;
  maxChargingPower: number | null;
  voltage: number | null;
  power: number | null;
  batteryCapacity: number | null;
  batteryTime: number | null;
  batteryType: string | null;
};

type MainInterfaceSpeed = {
  interfaceId: string | null;
  availableSpeed: string | null;
};

type Antenna = {
  builtIn: boolean | null;
  cableLoss: number | null;
  gain: number | null;
  id: string | null;
  name: string | null;
};

type Overview = {
  antenna: Antenna | null;
  downlinkCapacity: number | null;
  totalCapacity: number | null;
  downlinkUtilization: number | null;
  theoreticalTotalCapacity: number | null;
  theoreticalDownlinkCapacity: number | null;
  theoreticalUplinkCapacity: number | null;
  uplinkCapacity: number | null;
  uplinkUtilization: number | null;
  stationsCount: number | null;
  linkStationsCount: number | null;
  linkActiveStationsCount: number | null;
  runningOnBattery: boolean | null;
  status: string | null;
  canUpgrade: boolean | null;
  isLocateRunning: boolean | null;
  cpu: number | null;
  ram: number | null;
  signal: number | null;
  signalMax: number | null;
  remoteSignalMax: number | null;
  uptime: number | null;
  serviceUptime: number | null;
  serviceTime: number | null;
  distance: number | null;
  outageScore: number | null;
  lastSeen: string | null;
  createdAt: string | null;
  voltage: number | null;
  consumption: number | null;
  biasCurrent: number | null;
  outputPower: number | null;
  outputPowers: number[] | null;
  maximalPower: number | null;
  frequency: number | null;
  temperature: number | null;
  powerStatus: string | null;
  batteryCapacity: number | null;
  batteryTime: number | null;
  psu: PSU[] | null;
  linkScore: LinkScore | null;
  channelWidth: number | null;
  transmitPower: number | null;
  wirelessMode: string | null;
  wirelessActiveInterfaceIds: string[] | null;
  mainInterfaceSpeed: MainInterfaceSpeed | null;
};

type Semver = {
  major: number | null;
  minor: number | null;
  patch: number | null;
  prerelease: string[] | null;
  order: string | null;
};

type Firmware = {
  compatible: boolean | null;
  current: string | null;
  latest: string | null;
  latestOnCurrentMajorVersion: string | null;
  latestOver: string | null;
  upgradeRecommendedToVersion: string | null;
  prospective: string | null;
  semver: {
    current: Semver | null;
    latest: Semver | null;
    latestOver: Semver | null;
    latestOnCurrentMajorVersion: Semver | null;
  };
};

type LatestBackup = {
  timestamp: string | null;
  id: string | null;
};

type Configuration = {
  id: string | null;
  status: string | null;
  hash: string | null;
  createdAt: string | null;
};

type Location = {
  altitude: number | null;
  elevation: number | null;
  heading: number | null;
  latitude: number;
  longitude: number;
  magneticHeading: number | null;
  roll: number | null;
  tilt: number | null;
};

type Features = {
  has60GhzRadio: boolean | null;
  hasBackupAntenna: boolean | null;
  isUdapiSpeedTestSupported: boolean | null;
  isUsingUdapiUpdaters: boolean | null;
  isSupportRouter: boolean | null;
};

type Meta = {
  firmwareCompatibility: string | null;
  failedMessageDecryption: boolean | null;
  maintenance: boolean | null;
  maintenanceEnabledAt: string | null;
  restartTimestamp: string | null;
  alias: string | null;
  note: string | null;
};

type Attributes = {
  series?: string | null;
  ssid: string | null;
  secondarySsid?: string | null;
  apDevice: string | null;
  country: string | null;
  countryCode: number | null;
};

type LinkScore = {
  linkScore: number | null;
  score: number | null;
  scoreMax: number | null;
  airTime: number | null;
  airTimeScore: number | null;
  linkScoreHint: string | null;
  theoreticalTotalCapacity: number | null;
  theoreticalDownlinkCapacity: number | null;
  theoreticalUplinkCapacity: number | null;
};

type Upgrade = {
  status: string | null;
  progress: number | null;
  firmwareVersion: string | null;
  firmware: {
    major: number | null;
    minor: number | null;
    patch: number | null;
    prerelease: string[] | null;
    order: string | null;
  };
  upgradeInMaintenanceWindow: boolean | null;
};

export type Device = {
  identification: {
    id: string;
    site: Site | null;
    mac: string | null;
    name: string | null;
    hostname: string | null;
    serialNumber: string | null;
    firmwareVersion: string | null;
    udapiVersion: string | null;
    bridgeVersion: string | null;
    subsystemId: string | null;
    model: string | null;
    modelName: string;
    systemName: string | null;
    vendor: string | null;
    vendorName: string | null;
    platformId: string | null;
    platformName: string;
    type: string | null;
    category: string | null;
    authorized: boolean | null;
    updated: string | null;
    started: string | null;
    displayName: string | null;
    role: string | null;
  };
  uplinkDevice: string | null;
  features: Features;
  overview: Overview;
  discovery: string | null;
  mode: string | null;
  firmware: Firmware;
  upgrade: Upgrade | null;
  meta: Meta | null;
  attributes: Attributes | null;
  ipAddress: string | null;
  ipAddressList: string[];
  enabled: boolean | null;
  latestBackup: LatestBackup | null;
  configuration: Configuration | null;
  location: Location;
};
