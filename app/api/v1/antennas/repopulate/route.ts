import { NextResponse } from 'next/server';
import 'dotenv/config';

import { Antenna, NYCAntenna } from '@/app/api/v1/antenna/validate';
import { isAntennas } from '@/app/api/v1/antennas/validate';
import { pool } from '@/app/api/v1/connection';
import StatusError from '@/app/api/(utils)/StatusError';

import { getNYCAntenna } from './_getNYCAntenna';
import { PoolClient } from 'pg';

function antennaNeedUpdate(antenna: Antenna, nycAntenna: NYCAntenna) {
  switch (true) {
    case nycAntenna.name && antenna.name != nycAntenna.name:
    case nycAntenna.hostname && antenna.hostname != nycAntenna.hostname:
    case nycAntenna.model && antenna.model != nycAntenna.model:
    case nycAntenna.modelName && antenna.modelName != nycAntenna.modelName:
    case nycAntenna.frequency && antenna.frequency != nycAntenna.frequency:
    case nycAntenna.playground_frequency &&
      antenna.playground_frequency != nycAntenna.playground_frequency:
    case nycAntenna.latitude && antenna.latitude != nycAntenna.latitude:
    case nycAntenna.longitude && antenna.longitude != nycAntenna.longitude:
    case nycAntenna.azimuth && antenna.azimuth != nycAntenna.azimuth:
    case nycAntenna.typeAntenna &&
      antenna.typeAntenna != nycAntenna.typeAntenna:
    case nycAntenna.antenna_status &&
      antenna.antenna_status != nycAntenna.antenna_status:
      return true;
    default:
      return false;
  }
}

async function updateAntenna(
  client: PoolClient,
  antenna: Antenna,
  nycAntenna: NYCAntenna
) {
  const updateResult = await client.query(
    `UPDATE Antennas SET name = $1, hostname = $2, model = $3, modelname = $4, frequency = $5, latitude = $6, longitude = $7, azimuth = $8, typeAntenna = $9, antenna_status = $10, cpu = $11, ram = $12 WHERE id = ${antenna.id} RETURNING *`,
    [
      nycAntenna.name ?? antenna.name,
      nycAntenna.hostname ?? antenna.hostname,
      nycAntenna.model ?? antenna.model,
      nycAntenna.modelName ?? antenna.modelName,
      nycAntenna.frequency ?? antenna.frequency,
      nycAntenna.latitude ?? antenna.latitude,
      nycAntenna.longitude ?? antenna.longitude,
      nycAntenna.azimuth ?? antenna.azimuth,
      nycAntenna.typeAntenna ?? antenna.typeAntenna,
      nycAntenna.antenna_status ?? antenna.antenna_status,
      nycAntenna.cpu ?? antenna.cpu,
      nycAntenna.ram ?? antenna.ram,
    ]
  );
  // TODO: Check update result
  if (updateResult === null)
    throw new StatusError(500, 'Unknown id error while updating.');
}

async function createAntenna(client: PoolClient, nycAntenna: NYCAntenna) {
  const insertResult = await client.query(
    `INSERT INTO Antennas (name, hostname, model, modelName, frequency, playground_frequency, latitude, longitude, azimuth, typeAntenna, antenna_status, cpu, ram) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
    [
      nycAntenna.name,
      nycAntenna.hostname,
      nycAntenna.model,
      nycAntenna.modelName,
      nycAntenna.frequency,
      nycAntenna.playground_frequency,
      nycAntenna.latitude,
      nycAntenna.longitude,
      nycAntenna.azimuth,
      nycAntenna.typeAntenna,
      nycAntenna.antenna_status,
      nycAntenna.cpu,
      nycAntenna.ram,
    ]
  );
  // TODO: Check insert result
  if (insertResult === null)
    throw new Error('Unknown id error while inserting.');
}

function antennaExists(ourAntennas: Antenna[], nycAntenna: NYCAntenna) {
  let antenna: Antenna | null = null;
  for (const ourAntenna of ourAntennas) {
    if (nycAntenna.hostname === ourAntenna.hostname) {
      antenna = ourAntenna;
      break;
    }
  }
  return antenna;
}

export async function POST() {
  let client;
  try {
    client = await pool.connect();
    const antennas = (await client.query('SELECT * FROM Antennas')).rows;

    // FIXME: Unclear if database will allow null values for Antenna table. If so, make Antenna properties nullable, else clean NYCAntenna properties to make then default values like -1 and empty strings
    if (!isAntennas(antennas))
      throw new StatusError(500, 'Server is unable to fetch antenna data.');

    const convertedNycData: NYCAntenna[] = await getNYCAntenna();

    for (const nycAntenna of convertedNycData) {
      const antenna: Antenna | null = antennaExists(antennas, nycAntenna);

      if (antenna != null && antennaNeedUpdate(antenna, nycAntenna)) {
        if (nycAntenna.azimuth === null) nycAntenna.azimuth = antenna.azimuth;
        await updateAntenna(client, antenna, nycAntenna);
      } else if (antenna === null) await createAntenna(client, nycAntenna);
    }

    client.release();
    return NextResponse.json(antennas, { status: 200 });
  } catch (error) {
    console.error(error);
    if (client) client.release();
    let message = 'Internal Server Error';
    let status = 500;
    if (error instanceof Error) message = error.message;
    if (error instanceof StatusError) status = error.status;
    return NextResponse.json({ message }, { status });
  }
}
