CREATE EXTENSION postgis;

-- Create SectorLobes table
CREATE TABLE SectorLobes (
  id SERIAL PRIMARY KEY,
  modelName VARCHAR(255),
  angle FLOAT
);

-- Create Antennas table
CREATE TABLE Antennas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  hostname VARCHAR(255),
  model VARCHAR(255),
  modelName VARCHAR(255),
  frequency INT,
  geom GEOMETRY(Point, 4326),
  initialHeading INT,
  heading INT,
  sectorLobeId INT,
  radius FLOAT,
  FOREIGN KEY (sectorLobeId) REFERENCES SectorLobes(id)
);

-- Insert dummy data into SectorLobes table
INSERT INTO SectorLobes (modelName, angle) VALUES
('Model A', 120.0),
('Model B', 90.0),
('Model C', 60.0);

-- Insert dummy data into Antennas table
INSERT INTO Antennas (name, hostname, model, modelName, frequency, geom, initialHeading, heading, sectorLobeId, radius) VALUES
('Antenna 1', 'host1', 'Model X', 'Model A', 2600, ST_SetSRID(ST_Point(-74.006, 40.7128), 4326), 0, 0, 1, 5.0),
('Antenna 2', 'host2', 'Model Y', 'Model B', 1800, ST_SetSRID(ST_Point(-73.935242, 40.730610), 4326), 90, 90, 2, 3.5),
('Antenna 3', 'host3', 'Model Z', 'Model C', 700, ST_SetSRID(ST_Point(-73.985428, 40.748817), 4326), 180, 180, 3, 2.0);
