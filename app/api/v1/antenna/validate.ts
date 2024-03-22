import { z } from 'zod';

export type Antenna = {
  id: number;
  name: string;
  hostname: string;
  model: string;
  modelname: string;
  frequency: number;
  playground_frequency: number;
  latitude: string;
  longitude: string;
  azimuth: number;
  typeantenna: number;
  antenna_status: string;
  cpu: number;
  ram: number;
};

export function isAntenna(antenna: unknown): antenna is Antenna {
  const antennaSchema = z.object({
    id: z.number(),
    name: z.string(),
    hostname: z.string(),
    model: z.string(),
    modelname: z.string(),
    frequency: z.number().int().gte(0),
    playground_frequency: z.number().int().gte(0),
    latitude: z.string(),
    longitude: z.string(),
    azimuth: z.number().int().gte(0).lt(360),
    typeantenna: z.number().gte(0).lte(2),
    antenna_status: z.string(),
    cpu: z.number(),
    ram: z.number(),
  });

  const res = antennaSchema.safeParse(antenna);
  return res.success;
}
