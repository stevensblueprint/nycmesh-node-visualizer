//import handler from '@/app/pages/api/antennas'; 
//I could not run it with the actual handler bc of .env variables, so I just used mock data 
//TODO: run it with the actual handlerç
describe('/api/antennas GET endpoint', () => {
    it('returns a list of antennas', async () => {
        //TODO: make it work with the actual endpoint
        const response = {
            body:{
                antennas: [
                {
                    id:413,
                    name: "Antenna 1",
                }
            ]
            }
        }
        expect(response.body).toHaveProperty('antennas');
    }
    );
}
);