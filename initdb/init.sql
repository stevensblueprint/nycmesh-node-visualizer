-- Create Antennas table
CREATE TABLE Antennas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  hostname VARCHAR(255),
  model VARCHAR(255),
  modelName VARCHAR(255),
  frequency INT,
  playground_frequency INT,
  latitude VARCHAR(255),
  longitude VARCHAR(255),
  azimuth INT, --Technical Term for heading
  typeAntenna INT, -- 0 for Omni, 1 for Point to Point, 2 for Sector
  antenna_status VARCHAR(255) DEFAULT 'Active',
  cpu INT,
  ram INT
);

INSERT INTO Antennas (name, hostname, model, modelName, frequency, playground_frequency, latitude, longitude, azimuth, typeAntenna, antenna_status, cpu, ram) VALUES
('Antenna One', 'ant1.hostname.com', 'X100', 'X100-1A', 2400, 2450, '34.0522', '-118.2437', 0, 0, 'Active', 4, 16),
('Antenna Two', 'ant2.hostname.com', 'Y200', 'Y200-1B', 5200, 5250, '40.7128', '-74.0060', 90, 1, 'Inactive', 8, 32),
('Antenna Three', 'ant3.hostname.com', 'Z300', 'Z300-1C', 5800, 5850, '51.5074', '-0.1278', 180, 2, 'Maintenance', 16, 64),
('Antenna Four', 'ant4.hostname.com', 'W400', 'W400-1D', 2400, 2450, '48.8566', '2.3522', 270, 0, 'Active', 4, 16),
('Antenna Five', 'ant5.hostname.com', 'V500', 'V500-1E', 5200, 5250, '-33.8688', '151.2093', 45, 1, 'Active', 8, 32);