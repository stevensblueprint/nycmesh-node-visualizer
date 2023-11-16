import { NextResponse } from 'next/server';
import { pool } from '../connection';

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM Antennas');
    const antennas = result.rows;
    client.release();
    return NextResponse.json(antennas, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
