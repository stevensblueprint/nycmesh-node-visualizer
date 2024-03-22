import { NextResponse } from 'next/server';
import { pool } from '../connection';
import { isAntenna, Antenna } from '@/app/api/v1/antenna/validate';
import StatusError from '@/app/api/(utils)/StatusError';

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM Antennas');
    const antennas = result.rows;
    client.release();
    return NextResponse.json(antennas, { status: 200 });
  } catch (error) {
    let message = 'Internal server error';
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const updatedAntennas: Antenna[] = [];
  try {
    const { ids, newFrequencies } = (await request.json()) as {
      ids: number[];
      newFrequencies: number[];
    };

    const client = await pool.connect();

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const frequency = newFrequencies[i];

      const query = `
        UPDATE Antennas
        SET playground_frequency = $1
        WHERE id = $2
        RETURNING *
      `;
      const result = await client.query(query, [frequency, id]);
      if (result.rowCount === 0) {
        throw new StatusError(404, `Antenna with ${id} does not exist.`);
      }
      if (!isAntenna(result.rows[0])) {
        throw new StatusError(
          500,
          'Antenna must be updated with correct data types / values.'
        );
      }
      const updatedAntenna = result.rows[0];
      updatedAntennas.push(updatedAntenna);
    }
    client.release();

    return NextResponse.json(updatedAntennas, { status: 200 });
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
