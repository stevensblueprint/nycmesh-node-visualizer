/**
 * @jest-environment node
 */

import { pool } from '@/app/api/v1/connection';
import { DELETE as deleteAntenna } from '@/app/api/v1/antenna/[id]/route';
import { createRequest } from 'node-mocks-http';

describe('Testing /api/v1/antenna/{id} DELETE endpoint', () => {
  it('Error testing for nonexistent id', async () => {
    const { req } = createRequest({
      method: 'DELETE',
    });

    const res = await deleteAntenna(req, {
      params: { id: 'lhsohf0uol2hljslf' },
    });
    expect(res.status).toBe(404);
  });

  it('Normal testing for deleting antenna with id antenna_3', async () => {
    const antenna = {
      id: 'antenna_3',
      name: 'Antenna C',
      hostname: 'hostnameC',
      model: 'modelC',
      modelname: 'Model C Name',
      frequency: 1234,
      location: 'Location C',
      heading: 359,
      sectorlobe: 'sector_lobe_3',
    };

    const req = createRequest({
      method: 'DELETE',
    });

    const res = await deleteAntenna(req, { params: { id: antenna.id } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(antenna);
  });

  afterAll(async () => {
    // Closing the DB connection allows Jest to exit successfully.
    await pool.end();
  });
});
