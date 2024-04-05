import { NextResponse } from 'next/server';
import * as R from 'ramda';
import 'dotenv/config';

import { NYCAntenna } from '@/app/api/v1/antenna/validate';
import { isAntennas } from '@/app/api/v1/antennas/validate';
import { pool } from '@/app/api/v1/connection';
import StatusError from '@/app/api/(utils)/StatusError';

import { getNYCAntenna } from './_getNYCAntenna';

export async function POST() {
  try {
    const client = await pool.connect();
    const antennas = (await client.query('SELECT * FROM Antennas')).rows;

    if (!isAntennas(antennas))
      throw new StatusError(500, 'Server is unable to fetch antenna data.');

    const convertedNycData: NYCAntenna[] = await getNYCAntenna();

    for (const nycAntenna of convertedNycData) {
      let antennaDoesNotExist = true;
      for (const ourAntenna of antennas) {
        if (nycAntenna.hostname === ourAntenna.hostname) {
          if (nycAntenna.azimuth === 0) nycAntenna.azimuth = ourAntenna.azimuth;

          // checks if nycAntenna is not equivalent to ourAntenna without id property
          if (!R.equals(nycAntenna)(R.omit(['id'], ourAntenna))) {
            // FIXME: is it string NULL or undefined/null when passed from nycmesh?

            // if json is not 0, always pick json
            // else keep db

            const updateResult = await client.query(
              `UPDATE Antennas SET name = $1, hostname = $2, model = $3, modelname = $4, frequency = $5, latitude = $6, longitude = $7, azimuth = $8, typeAntenna = $9, antenna_status = $10, cpu = $11, ram = $12 WHERE id = ${ourAntenna.id} RETURNING *`,
              [
                nycAntenna.name,
                nycAntenna.hostname,
                nycAntenna.model,
                nycAntenna.modelName,
                nycAntenna.frequency,
                nycAntenna.latitude,
                nycAntenna.longitude,
                nycAntenna.azimuth,
                nycAntenna.typeAntenna,
                nycAntenna.antenna_status,
                nycAntenna.cpu,
                nycAntenna.ram,
              ]
            );
            // TODO: Check update result
            if (updateResult === null)
              throw new StatusError(500, 'Unknown id error while updating.');
          }
          antennaDoesNotExist = false;
          break;
        }
      }

      if (antennaDoesNotExist) {
        const insertResult = await client.query(
          `INSERT INTO Antennas (id, name, hostname, model, modelName, frequency, playground_frequency, latitude, longitude, azimuth, typeAntenna, antenna_status, cpu, ram) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
          [
            nycAntenna.name,
            nycAntenna.hostname,
            nycAntenna.model,
            nycAntenna.modelName,
            nycAntenna.frequency,
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
    }

    client.release();
    return NextResponse.json(antennas, { status: 200 });
  } catch (error) {
    let message = 'Internal Server Error';
    let status = 500;
    if (error instanceof Error) message = error.message;
    if (error instanceof StatusError) status = error.status;
    return NextResponse.json({ message }, { status });
  }
}
