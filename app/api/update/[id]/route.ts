import { Pool } from 'pg';
import { NextResponse } from 'next/server';
import dotenv from 'dotenv';

interface RequestData {
  heading: number;
  radius: number;
}
interface Antenna {
  id: string;
  name: string;
  hostname: string;
  model: string;
  modelname: string;
  frequency: number;
  location: string;
  heading: number;
  sectorlobe: string;
}

dotenv.config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT
    ? parseInt(process.env.POSTGRES_PORT)
    : undefined,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    if (context.params.id.length === 0) {
      throw {
        status: 500,
        message: 'Internal Error: Id is missing from parameter',
      };
    }

    const id = context.params.id;
    const { heading, radius }: RequestData =
      (await request.json()) as RequestData;

    console.log('Connecting...');
    const client = await pool.connect();
    console.log('Connection Sucessful!');

    const query = `
      WITH updated_antenna AS (
        UPDATE Antennas
        SET heading = $1
        WHERE id = $2
        RETURNING *
      )
      UPDATE SectorLobes s
      SET radius = $3
      FROM updated_antenna ua
      WHERE s.sector_lobe_id = ua.sectorLobe
      RETURNING ua.*;
      `;

    const result = await client.query(query, [heading, id, radius]);
    if (result.rowCount === 0) {
      throw {
        status: 404,
        message: `Antenna with id: ${id} does not exist`,
      };
    }

    const updatedAntenna = result.rows[0] as Antenna;

    client.release();

    return NextResponse.json(updatedAntenna, { status: 200 });
  } catch (error) {
    let message = 'Internal Server Error';
    let status = 500;
    if (typeof error === 'object') {
      if (error && 'message' in error && typeof error.message === 'string')
        message = error.message;
      if (error && 'status' in error && typeof error.status === 'number')
        status = error.status;
    }

    return NextResponse.json({ message }, { status });
  }
}
