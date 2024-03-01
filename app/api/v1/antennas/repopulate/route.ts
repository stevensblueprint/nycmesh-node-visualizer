/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import {
  Antenna,
  AntennaNoId,
  isAntenna,
  isAntennaNoId,
  isAntennas,
} from '@/app/api/v1/validate';
import { pool } from '../../connection';
import StatusError from '@/app/api/(utils)/StatusError';

import axios from 'axios';
import https from 'https';
import * as R from 'ramda';
import 'dotenv/config';

function convertAntenna(ant: unknown): AntennaNoId {
  if (typeof ant !== 'object' || ant == null || ant == undefined)
    throw new StatusError(500, `Antenna provided is invalid.\n${String(ant)}`);

  if (!('name' in ant))
    throw new StatusError(
      500,
      'Name of antenna not provided by nycmesh database.'
    );

  if (!('hostname' in ant))
    throw new StatusError(
      500,
      'Hostname of antenna not provided by nycmesh database.'
    );

  if (!('model' in ant))
    throw new StatusError(
      500,
      'model of antenna not provided by nycmesh database.'
    );

  if (!('modelName' in ant))
    throw new StatusError(
      500,
      'modelName of antenna not provided by nycmesh database.'
    );

  if (
    !(
      'overview' in ant &&
      typeof ant.overview === 'object' &&
      ant.overview != null &&
      'frequency' in ant.overview
    )
  ) {
    throw new StatusError(
      500,
      'frequency of antenna not provided by nycmesh database.'
    );
  }

  if (
    !(
      'attributes' in ant &&
      typeof ant.attributes === 'object' &&
      ant.attributes != null &&
      'ssid' in ant.attributes
    )
  )
    throw new StatusError(
      500,
      'location of antenna not provided by nycmesh database.'
    );

  if (
    !(
      'location' in ant &&
      typeof ant.location === 'object' &&
      ant.location != null &&
      'heading' in ant.location
    )
  )
    throw new StatusError(
      500,
      'heading of antenna not provided by nycmesh database.'
    );

  const antenna: unknown = {
    name: ant.name,
    hostname: ant.hostname,
    model: ant.model,
    modelname: ant.modelName,
    frequency: ant.overview.frequency,
    location: ant.attributes.ssid,
    heading: ant.location.heading,
    sectorlobe: 'unknown',
  };

  if (isAntennaNoId(antenna)) return antenna;
  else
    throw new StatusError(500, 'Incorrect type fetched from nycmesh database.');
}

function convertAntennas(data: unknown): AntennaNoId[] {
  if (!Array.isArray(data))
    throw new StatusError(
      500,
      'Data provided by nycmesh server is not an array.'
    );

  return data.map((antenna) => convertAntenna(antenna));
}

async function getData(): Promise<AntennaNoId[]> {
  const tokenRes = await axios.post(
    'https://uisp.mesh.nycmesh.net/nms/api/v2.1/user/login',
    {
      username: process.env.MESH_USERNAME,
      password: process.env.MESH_PASSWORD,
    },
    {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    }
  );
  const token: unknown = tokenRes.headers['x-auth-token'];
  if (typeof token != 'string') {
    throw new StatusError(
      500,
      'Unable to populate database due to server errors.'
    );
  }

  const dataRes = await axios.get(
    'https://uisp.mesh.nycmesh.net/nms/api/v2.1/devices',
    {
      headers: {
        'x-auth-token': token,
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    }
  );

  return convertAntennas(dataRes.data);
}

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const client = await pool.connect();
    const antennas = (await client.query('SELECT * FROM Antennas')).rows;

    if (!isAntennas(antennas))
      throw new StatusError(500, 'Server is unable to fetch antenna data.');

    const nycData: AntennaNoId[] = await getData();

    for (const nycAntenna of nycData) {
      let antennaDoesNotExist = true;
      for (const ourAntenna of antennas) {
        if (nycAntenna.hostname === ourAntenna.hostname) {
          if (!R.equals(nycAntenna)(R.omit(['id'], ourAntenna))) {
            // TODO: waiting for pr on inithead and initfreq
            const updateResult = await client.query(
              `UPDATE Antennas SET name = $1, model = $2, modelName = $3, frequency = $4, location = $5, heading = $6, sectorLobe = $7 WHERE id = ${ourAntenna.id} RETURNING *`,
              [
                nycAntenna.name,
                nycAntenna.model,
                nycAntenna.modelName,
                nycAntenna.frequency,
                nycAntenna.location,
                nycAntenna.heading,
                nycAntenna.sectorLobe,
              ]
            );
            // TODO: Check update result
          }
          antennaDoesNotExist = false;
          break;
        }
      }

      if (antennaDoesNotExist) {
        // TODO: waiting for pr on inithead and initfreq
        const insertResult = await client.query(
          `INSERT INTO Antennas (id, name, hostname, model, modelName, frequency, location, heading, sectorLobe) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [
            nycAntenna.name,
            nycAntenna.hostname,
            nycAntenna.model,
            nycAntenna.modelName,
            nycAntenna.frequency,
            nycAntenna.location,
            nycAntenna.heading,
            nycAntenna.sectorLobe,
          ]
        );
        // TODO: Check insert result
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

/*
TODO: 
- Where is sectorlobe? 
- What is location?
- What do I do when heading is null? How often is heading null? Should I set it to 0, or allow nulls in our db for initial headings too?
- Do we want our db to generate the id for each new antenna?
- Why is modelName and sectorLobe camelcase but hostname is not camelcase? There needs to be some change to validate.ts since Antenna type and Antenna table in database do not have the same properties/columns.
- Waiting to merge changes for initialHeading and initalFrequency.
 */
