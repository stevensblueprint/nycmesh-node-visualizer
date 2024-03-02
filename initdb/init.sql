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
);

INSERT INTO Antennas (name, hostname, model, modelName, frequency, playground_frequency, latitude, longitude, azimuth, typeAntenna) VALUES
('Antenna 1', 'antenna1', 'Model A', 'Model A1', 2400, 2450, '35.6895', '139.6917', 180, 0),
('Antenna 2', 'antenna2', 'Model B', 'Model B1', 5200, 5250, '40.7128', '-74.0060', 90, 1),
('Antenna 3', 'antenna3', 'Model C', 'Model C1', 5800, 5850, '51.5074', '-0.1278', 270, 2);

