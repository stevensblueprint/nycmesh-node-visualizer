-- Create SectorLobes table
CREATE TABLE SectorLobes (
  sector_lobe_id VARCHAR(255),
  modelName VARCHAR(255),
  angle FLOAT,
  radius FLOAT,
  PRIMARY KEY (sector_lobe_id)
);

-- Create Antennas table
CREATE TABLE Antennas (
  id VARCHAR(255),
  name VARCHAR(255),
  hostname VARCHAR(255),
  model VARCHAR(255),
  modelName VARCHAR(255),
  frequency INT,
  location VARCHAR(255),
  heading INT,
  sectorLobe VARCHAR(255),
  FOREIGN KEY (sectorLobe) REFERENCES SectorLobes(sector_lobe_id)
);

-- Insert data into the SectorLobes table
INSERT INTO SectorLobes (sector_lobe_id, modelName, angle, radius)
VALUES
  ('sector_lobe_1', 'Model A Name', 45.0, 10.0),
  ('sector_lobe_2', 'Model B Name', 90.0, 15.0),
  ('sector_lobe_3', 'Model C Name', 135.0, 20.0);

-- Insert data into the Antennas table
INSERT INTO Antennas (id, name, hostname, model, modelName, frequency, location, heading, sectorLobe)
VALUES
  ('antenna_1', 'Antenna A', 'hostnameA', 'modelA', 'Model A Name', 2400, 'Location A', 90, 'sector_lobe_1'),
  ('antenna_2', 'Antenna B', 'hostnameB', 'modelB', 'Model B Name', 5800, 'Location B', 180, 'sector_lobe_2');