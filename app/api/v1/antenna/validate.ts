import { z } from 'zod';

/**
 * Types
 */

export type Antenna = {
  id: number;
  name: string;
  hostname: string;
  model: string;
  modelName: string;
  frequency: number;
  playground_frequency: number;
  latitude: string;
  longitude: string;
  azimuth: number;
  typeAntenna: -1 | 0 | 1 | 2; // -1 for unknown type of antenna
  antenna_status: string;
  cpu: number | null;
  ram: number | null;
};

export type NYCAntenna = {
  name: string | null;
  hostname: string | null;
  model: string | null;
  modelName: string | null;
  frequency: number | null;
  playground_frequency: number | null;
  latitude: string | null;
  longitude: string | null;
  azimuth: number | null;
  typeAntenna: -1 | 0 | 1 | 2 | null;
  antenna_status: string | null;
  cpu: number | null;
  ram: number | null;
};

/**
 * Schema
 */

const antennaSchema = z.object({
  id: z.number(),
  name: z.string(),
  hostname: z.string(),
  model: z.string(),
  modelName: z.string(),
  frequency: z.number().int().gte(0),
  playground_frequency: z.number().int().gte(0),
  latitude: z.string(),
  longitude: z.string(),
  azimuth: z.number().int().gte(0).lt(360),
  typeAntenna: z.union([
    z.literal(-1),
    z.literal(0),
    z.literal(1),
    z.literal(2),
  ]),
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
    name: z.nullable(z.string()), // nullable?
    hostname: z.nullable(z.string()), // nullable?
    model: z.nullable(z.string()), // nullable?
    modelName: z.nullable(z.string()), // nullable?

    frequency: z.nullable(z.number().int().gte(0)),
    playground_frequency: z.nullable(z.number().int().gte(0)),
    latitude: z.nullable(z.string()),
    longitude: z.nullable(z.string()),
    azimuth: z.nullable(z.number().int().gte(0).lt(360)),

    typeAntenna: z.nullable(
      z.union([z.literal(-1), z.literal(0), z.literal(1), z.literal(2)])
    ), // nullable?
    antenna_status: z.nullable(z.string()), // nullable?
  });
  const res = NYCAntennaSchema.safeParse(antenna);
  return res.success;
}
