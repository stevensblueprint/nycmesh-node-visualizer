import { z } from 'zod';

export type Antenna = {
  id: string;
  name: string;
  hostname: string;
  model: string;
  modelName: string;
  frequency: number;
  location: string;
  heading: number;
  sectorLobe: string;
};

export type AntennaNoId = Omit<Antenna, 'id'>;

export function isAntenna(antenna: unknown): antenna is Antenna {
  const antennaSchema = z.object({
    id: z.string(),
    name: z.string(),
    hostname: z.string(),
    model: z.string(),
    modelName: z.string(),
    frequency: z.number().int().gte(0),
    location: z.string(),
    heading: z.number().int().gte(0).lt(360),
    sectorLobe: z.string(),
  });

  const res = antennaSchema.safeParse(antenna);
  return res.success;
}

export function isAntennas(antennas: unknown): antennas is Antenna[] {
  if (!Array.isArray(antennas)) return false;

  return antennas.reduce(
    (acc: boolean, antenna: unknown) => acc && isAntenna(antenna),
    true
  );
}

export function isAntennaNoId(antenna: unknown): antenna is AntennaNoId {
  const antennaSchema = z.object({
    name: z.string(),
    hostname: z.string(),
    model: z.string(),
    modelName: z.string(),
    frequency: z.number().int().gte(0),
    location: z.string(),
    heading: z.number().int().gte(0).lt(360),
    sectorLobe: z.string(),
  });

  const res = antennaSchema.safeParse(antenna);
  return res.success;
}
