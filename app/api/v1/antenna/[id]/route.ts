import { NextResponse } from 'next/server';

import { isAntenna } from '@/app/api/v1/antenna/validate';
import { pool } from '@/app/api/v1/connection';
import StatusError from '@/app/api/(utils)/StatusError';

export async function DELETE(_: Request, context: { params: { id: string } }) {
  try {
    if (context.params.id.trim().length == 0)
      throw new StatusError(
        500,
        'Internal Error: Id is missing from parameter'
      );
    const id = context.params.id;
    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM Antennas WHERE Antennas.id = '${id}' RETURNING *;`
    );
    client.release();

    if (result.rows.length === 0)
      throw new StatusError(404, `Antenna with ${id} does not exist.`);
    if (result.rows.length > 1)
      throw new StatusError(
        500,
        `Internal Error: Deleted more than 1 id with the following id provided: ${id}`
      );
    if (!isAntenna(result.rows[0]))
      throw new StatusError(
        500,
        `Internal Error: Antenna deleted from database has the incorrect data types / values`
      );

    const antenna = result.rows[0];

    return NextResponse.json(antenna, { status: 200 });
  } catch (error) {
    let message = 'Internal Server Error';
    let status = 500;
    if (error instanceof Error) message = error.message;
    if (error instanceof StatusError) status = error.status;
    return NextResponse.json({ message }, { status });
  }
}
