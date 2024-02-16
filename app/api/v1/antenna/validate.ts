import { z } from 'zod';

export type Antenna = {
  id: string;
  name: string;
  hostname: string;
  model: string;
  modelname: string;
  frequency: number;
  location: string;
  initialheading: number;
  heading: number;
  radius: number;
  sectorlobe: string;
};

export function isAntenna(antenna: unknown): antenna is Antenna {
  const antennaSchema = z.object({
    id: z.string(),
    name: z.string(),
    hostname: z.string(),
    model: z.string(),
    modelname: z.string(),
    frequency: z.number().int().gte(0),
    location: z.string(),
    initialheading: z.number().int().gte(0).lt(360),
    heading: z.number().int().gte(0).lt(360),
    radius: z.number().int().gte(0),
    sectorlobe: z.string(),
  });

  const res = antennaSchema.safeParse(antenna);
  return res.success;
}
