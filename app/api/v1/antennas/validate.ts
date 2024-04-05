import { Antenna, isAntenna } from '@/app/api/v1/antenna/validate';

/**
 * Type Guards
 */

export function isAntennas(antennas: unknown): antennas is Antenna[] {
  if (!Array.isArray(antennas)) return false;

  return antennas.reduce(
    (acc: boolean, antenna: unknown) => acc && isAntenna(antenna),
    true
  );
}
