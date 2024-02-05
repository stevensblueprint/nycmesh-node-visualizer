/**
 * @jest-environment node
 */

import { pool } from '@/app/api/v1/connection';
import { GET as getAntenna } from '@/app/api/v1/antenna/route';
import { createRequest } from 'node-mocks-http';

describe('Testing /api/v1/antenna GET endpoint', () => {
  it('Normal testing for getting all antennas', async () => {
    const req = createRequest({
      method: 'GET',
    });

    const res = await getAntenna(req);
    expect(res.status).toBe(200);
  });

  afterAll(async () => {
    // Closing the DB connection allows Jest to exit successfully.
    await pool.end();
  });
});
