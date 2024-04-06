import { z } from 'zod';

export type Antenna = {
  id: string;
  name: string;
  hostname: string;
  model: string;
  modelname: string;
  frequency: number;
  playground_frequency: number;
  latitude: string;
  longitude: number;
  azimuth: number;
  typeAntenna: number;
  antenna_status: string;
  cpu: number;
  ram: string;
};

export function isAntenna(antenna: unknown): antenna is Antenna {
  const antennaSchema = z.object({
    id: z.string(),
    name: z.string(),
    hostname: z.string(),
    model: z.string(),
    modelname: z.string(),
    frequency: z.number().int().gte(0),
    playground_frequency: z.number().int().gte(0),
    latitude: z.string(),
    longitude: z.string(),
    azimuth: z.number().int().gte(0).lt(360),
    typeAntenna: z.number().gte(0).lte(2),
    cpu: z.string(),
    ram: z.string(),
  });

  const res = antennaSchema.safeParse(antenna);
  return res.success;
}
