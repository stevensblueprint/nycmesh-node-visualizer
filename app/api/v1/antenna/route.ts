import { NextResponse } from 'next/server';
import { pool } from '../connection';

export async function GET() {
  try {
    console.log('Connecting...');
    const client = await pool.connect();
    console.log('Connection Sucessful!');

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
