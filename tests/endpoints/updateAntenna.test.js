/**
 * @jest-environment node
 */

import { pool } from '@/app/api/v1/connection';
import { PUT as updateAntenna } from '@/app/api/v1/antenna/[id]/route';
import { createRequest } from 'node-mocks-http';

describe('Testing /api/v1/{id} PUT endpoint', () => {
    it('Should update antenna sucessfully', async () => {
        const requestData = {
            heading: 123,
            radius: 123
        };
        const updatedAntenna = {
            id: 'antenna_1', 
            name: 'Antenna A', 
            hostname: 'hostnameA',
            model: 'modelC', 
            modelname: 'Model A Name', 
            frequency: 2400, 
            location: 'Location A', 
            heading: 123, 
            sectorlobe: "sector_lobe_1"
        }
        const req = createRequest({
            method: 'PUT',
            body: requestData
        });

        const res = await updateAntenna(req, {
            params: {id: updateAntenna.id}
        });
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual(updatedAntenna.id);
    });
    it('Should return 404 for nonexistent antenna', async () =>{
        const req = createRequest({
            method: 'PUT',
            body: requestData
        });
        const res = await updateAntenna(req, {
            params: {id: 'nah, id win'}
        });
        expect(res.status).toBe(404);
    });
    afterAll(async () => {
        // Closing the DB connection allows Jest to exit successfully.
        await pool.end();
    });
});
    
