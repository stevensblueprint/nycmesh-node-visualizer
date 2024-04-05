import { z } from 'zod';

/**
 * Types
 */

export type Antenna = {
  id: string;
  name: string;
  hostname: string;
  model: string;
  modelName: string;
  frequency: number;
  playground_frequency: number;
  latitude: string;
  longitude: string;
  azimuth: number;
  typeAntenna: 0 | 1 | 2;
  antenna_status: string;
  cpu: number | null;
  ram: number | null;
};

export type NYCAntenna = Omit<Antenna, 'id'>;

/**
 * Schema
 */

const antennaSchema = z.object({
  id: z.string(),
  name: z.string(),
  hostname: z.string(),
  model: z.string(),
  modelName: z.string(),
  frequency: z.number().int().gte(0),
  playground_frequency: z.number().int().gte(0),
  latitude: z.string(),
  longitude: z.string(),
  azimuth: z.number().int().gte(0).lt(360),
  typeAntenna: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  antenna_status: z.string(),
  cpu: z.nullable(z.number().gte(0)),
  ram: z.nullable(z.number().gte(0)),
});

/**
 * Type Guards
 */

export function isAntenna(antenna: unknown): antenna is Antenna {
  const res = antennaSchema.safeParse(antenna);
  return res.success;
}

export function isNYCAntenna(antenna: unknown): antenna is NYCAntenna {
  const NYCAntennaSchema = antennaSchema.omit({ id: true }).extend({
    azimuth: z.nullable(z.number().int().gte(0).lt(360)),
  });
  const res = NYCAntennaSchema.safeParse(antenna);
  return res.success;
}
