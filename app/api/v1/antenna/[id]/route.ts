import { NextResponse } from 'next/server';

import { isAntenna } from '../validate';
import { pool } from '../../connection';

export async function DELETE(_: Request, context: { params: { id: string } }) {
  try {
    if (context.params.id.trim().length == 0)
      throw {
        status: 500,
        message: 'Internal Error: Id is missing from parameter',
      };
    const id = context.params.id;
    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM Antennas WHERE Antennas.id = '${id}' RETURNING *;`
    );
    if (result.rows.length === 0)
      throw {
        status: 404,
        message: `Antenna with ${id} does not exist.`,
      };

    if (result.rows.length > 1)
      throw {
        status: 500,
        message: `Internal Error: Deleted more than 1 id with the following id provided: ${id}`,
      };

    if (!isAntenna(result.rows[0]))
      throw {
        status: 500,
        message: `Internal Error: Antenna deleted from database has the incorrect data types / values`,
      };
    const antenna = result.rows[0];

    client.release();
    return NextResponse.json(antenna, { status: 200 });
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
