import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

interface AntennaUpdateRequest {
  heading: number;
  radius: number;
}
interface updatedAntenna {
  id: number;
  heading: number;
  radius: number;
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'PUT') {
      const client = await pool.connect();

      const id = req.query;
      const { heading, radius } = req.body as AntennaUpdateRequest;

      const query =
        'UPDATE antennas SET heading = $1, radius = $2 WHERE id = $3 RETURNING *';

      const result = await client.query(query, [heading, radius, id]);

      if (result.rowCount === 0) {
        res.status(404).json({ message: 'No Antennas found with this id.' });
      } else {
        const updatedAntenna = result.rows[0] as updatedAntenna;
        client.release();
        res.status(200).json(updatedAntenna);
      }
    } else {
      res.status(404).json({ message: 'This methid is not allowed.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
