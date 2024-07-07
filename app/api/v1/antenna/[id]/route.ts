import { NextResponse } from 'next/server';
import { isAntenna } from '@/app/api/v1/antenna/validate';
import { pool } from '@/app/api/v1/connection';
import StatusError from '@/app/api/(utils)/StatusError';

export async function DELETE(_: Request, context: { params: { id: number } }) {
  const client = await pool.connect();
  try {
    if (!context.params.id) {
      throw new StatusError(
        500,
        'Internal Error: Id is missing from parameter'
      );
    }
    const id = context.params.id;
    const result = await client.query(
      'DELETE FROM Antennas WHERE Antennas.id = $1 RETURNING *;',
      [id]
    );

    if (result.rows.length === 0) {
      throw new StatusError(404, `Antenna with ${id} does not exist.`);
    }
    if (result.rows.length > 1) {
      throw new StatusError(
        500,
        `Internal Error: Deleted more than 1 id with the following id provided: ${id}`
      );
    }
    if (!isAntenna(result.rows[0])) {
      throw new StatusError(
        500,
        'Internal Error: Antenna deleted from database has the incorrect data types / values'
      );
    }
    const antenna = result.rows[0];
    return NextResponse.json(antenna, { status: 200 });
  } catch (error) {
    const message =
      error instanceof StatusError ? error.message : 'Internal Server Error';
    const status = error instanceof StatusError ? error.status : 500;
    return NextResponse.json({ message }, { status });
  } finally {
    client.release();
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: number } }
) {
  const client = await pool.connect();
  try {
    if (!context.params.id) {
      throw new StatusError(
        500,
        'Internal Error: Id is missing from parameter'
      );
    }
    const id = context.params.id;
    const { frequency } = (await request.json()) as { frequency: number };

    // Ensure frequency is valid
    if (typeof frequency !== 'number' || frequency < 0) {
      throw new StatusError(400, 'Invalid frequency value provided.');
    }

    const query = `
      UPDATE Antennas
      SET playground_frequency = $1
      WHERE id = $2
      RETURNING *;
    `;
    const result = await client.query(query, [frequency, id]);

    if (result.rowCount === 0) {
      throw new StatusError(404, `Antenna with id ${id} does not exist.`);
    }
    if (!isAntenna(result.rows[0])) {
      throw new StatusError(
        500,
        'Updated antenna has incorrect data types or values.'
      );
    }

    const updatedAntenna = result.rows[0];
    return NextResponse.json(updatedAntenna, { status: 200 });
  } catch (error) {
    let message = 'Internal Server Error';
    let status = 500;
    if (error instanceof StatusError) {
      message = error.message;
      status = error.status;
    }
    return NextResponse.json({ message }, { status });
  } finally {
    client.release();
  }
}
