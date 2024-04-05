import { NYCAntenna, isNYCAntenna } from '@/app/api/v1/antenna/validate';
import StatusError from '@/app/api/(utils)/StatusError';

import axios from 'axios';
import https from 'https';
import 'dotenv/config';

function convertAntenna(ant: unknown): NYCAntenna {
  if (typeof ant !== 'object' || ant == null || ant == undefined)
    throw new StatusError(500, `Antenna provided is invalid.\n${String(ant)}`);

  if (
    'identification' in ant === false ||
    typeof ant.identification !== 'object' ||
    ant.identification === null
  )
    throw new StatusError(500, 'identification' + ' is missing from NYCMesh.');
  else if ('name' in ant.identification === false)
    throw new StatusError(500, 'name' + ' is missing from NYCMesh.');
  else if ('hostname' in ant.identification === false)
    throw new StatusError(500, 'hostname' + ' is missing from NYCMesh.');
  else if ('model' in ant.identification === false)
    throw new StatusError(500, 'model' + ' is missing from NYCMesh.');
  else if ('modelname' in ant.identification === false)
    throw new StatusError(500, 'modelname' + ' is missing from NYCMesh.');

  const identification = ant.identification as object &
    Record<'name', unknown> &
    Record<'hostname', unknown> &
    Record<'model', unknown> &
    Record<'modelname', unknown>;

  if (
    'overview' in ant === false ||
    typeof ant.overview !== 'object' ||
    ant.overview === null
  )
    throw new StatusError(500, 'overview' + ' is missing from NYCMesh.');
  else if ('frequency' in ant.overview === false)
    throw new StatusError(500, 'frequency' + ' is missing from NYCMesh.');
  else if ('cpu' in ant.overview === false)
    throw new StatusError(500, 'cpu' + ' is missing from NYCMesh.');
  else if ('ram' in ant.overview === false)
    throw new StatusError(500, 'ram' + ' is missing from NYCMesh.');
  else if ('status' in ant.overview === false)
    throw new StatusError(500, 'status' + ' is missing from NYCMesh.');

  const overview = ant.overview as object &
    Record<'frequency', unknown> &
    Record<'cpu', unknown> &
    Record<'ram', unknown> &
    Record<'status', unknown>;

  if (
    'location' in ant === false ||
    typeof ant.location !== 'object' ||
    ant.location === null
  )
    throw new StatusError(500, 'location' + ' is missing from NYCMesh.');
  else if ('latitude' in ant.location === false)
    throw new StatusError(500, 'latitude' + ' is missing from NYCMesh.');
  else if ('longitude' in ant.location === false)
    throw new StatusError(500, 'longitude' + ' is missing from NYCMesh.');
  else if ('heading' in ant.location === false)
    throw new StatusError(500, 'azimuth' + ' is missing from NYCMesh.');

  const location = ant.location as object &
    Record<'latitude', unknown> &
    Record<'longitude', unknown> &
    Record<'heading', unknown>;

  const azimuthType = 2; // TODO: Still need to check for typeAntenna?
  const antenna: unknown = {
    name: identification.name,
    hostname: identification.hostname,
    model: identification.model,
    modelName: identification.modelname,
    frequency: overview.frequency,
    playground_frequency: overview.frequency,
    latitude: location.latitude,
    longitude: location.longitude,
    azimuth: location.heading ?? 0,
    typeAntenna: azimuthType,
    antenna_status: overview.status,
    cpu: overview.cpu ?? null,
    ram: overview.ram ?? null,
  };

  if (isNYCAntenna(antenna)) {
    return antenna;
  } else
    throw new StatusError(500, 'Incorrect type fetched from nycmesh database.');
}

function convertAntennas(data: unknown): NYCAntenna[] {
  if (!Array.isArray(data))
    throw new StatusError(
      500,
      'Data provided by nycmesh server is not an array.'
    );

  return data.map((antenna) => convertAntenna(antenna));
}

export async function getNYCAntenna(): Promise<NYCAntenna[]> {
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
