import { DELETE as deleteAntenna } from '@/app/api/v1/antenna/[id]/route';
import { createRequest } from 'node-mocks-http';

describe('Testing /api/v1/antenna/{id} DELETE endpoint', () => {
  // it('Error testing for nonexistent id', async () => {
  //   const { req, res } = createMocks({
  //     method: 'DELETE',
  //     params: {
  //       id: 'lhsohf0uol2hljslf',
  //     },
  //   });

  //   await deleteAntenna(req, res);

  //   expect(res._getStatusCode()).toBe(404);
  // });

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
      params: {
        id: antenna.id,
      },
    });

    const res = await deleteAntenna(req, { params: { id: antenna.id } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(antenna);
  });
});

// TODO: What if... jest is actually not set up yet with NextTS?
