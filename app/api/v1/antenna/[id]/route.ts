import { NextResponse } from 'next/server';

import { isAntenna } from '@/app/api/v1/antenna/validate';
import { pool } from '@/app/api/v1/connection';
import StatusError from '@/app/api/(utils)/StatusError';

interface RequestData {
  heading: number;
  radius: number;
}

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

    const client = await pool.connect();

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
      throw new StatusError(404, `Antenna with ${id} does not exist.`);
    }
    if (!isAntenna(result.rows[0])) {
      throw new StatusError(
        500,
        'Antenna must be updated with correct data types / values.'
      );
    }

    const updatedAntenna = result.rows[0];

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
