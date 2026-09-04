import { SpeciesId } from '../types';

export interface SpeciesSeasonWindow {
  startMonth: number; // 1-12
  startDay: number;   // 1-31
  endMonth: number;   // 1-12
  endDay: number;     // 1-31
}

export const SPECIES_SEASONS: Record<SpeciesId, SpeciesSeasonWindow> = {
  boletus: { startMonth: 8, startDay: 15, endMonth: 11, endDay: 15 },
  cantharellus: { startMonth: 6, startDay: 15, endMonth: 10, endDay: 31 },
  hydnum: { startMonth: 8, startDay: 15, endMonth: 12, endDay: 15 },
  craterellus_cornucopioides: { startMonth: 8, startDay: 15, endMonth: 11, endDay: 30 },
  craterellus_tubaeformis: { startMonth: 9, startDay: 15, endMonth: 1, endDay: 15 },
  imleria_badia: { startMonth: 8, startDay: 1, endMonth: 11, endDay: 15 },
  laetiporus_sulphureus: { startMonth: 5, startDay: 15, endMonth: 10, endDay: 15 },
  macrolepiota_procera: { startMonth: 7, startDay: 15, endMonth: 11, endDay: 15 },
  suillus_luteus: { startMonth: 8, startDay: 1, endMonth: 11, endDay: 15 }
};

/**
 * Determines whether the fruiting season is active for a given species and date.
 */
export function isSeasonActive(speciesId: SpeciesId, dateStr: string): boolean {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1; // 1 - 12
  const day = d.getDate();

  switch (speciesId) {
    case 'boletus':
      return (month === 8 && day >= 15) || month === 9 || month === 10 || (month === 11 && day <= 15);
    case 'cantharellus':
      return (month === 6 && day >= 15) || month === 7 || month === 8 || month === 9 || month === 10;
    case 'hydnum':
      return (month === 8 && day >= 15) || month === 9 || month === 10 || month === 11 || (month === 12 && day <= 15);
    case 'craterellus_cornucopioides':
      return (month === 8 && day >= 15) || month === 9 || month === 10 || month === 11;
    case 'craterellus_tubaeformis':
      return (month === 9 && day >= 15) || month === 10 || month === 11 || month === 12 || (month === 1 && day <= 15);
    case 'imleria_badia':
      return month === 8 || month === 9 || month === 10 || (month === 11 && day <= 15);
    case 'laetiporus_sulphureus':
      return (month === 5 && day >= 15) || month === 6 || month === 7 || month === 8 || month === 9 || (month === 10 && day <= 15);
    case 'macrolepiota_procera':
      return (month === 7 && day >= 15) || month === 8 || month === 9 || month === 10 || (month === 11 && day <= 15);
    case 'suillus_luteus':
      return month === 8 || month === 9 || month === 10 || (month === 11 && day <= 15);
    default:
      return true;
  }
}

/**
 * Calculates the absolute distance in days between any given date and the species' season midpoint.
 */
export function getDaysToSeasonMidpoint(speciesId: SpeciesId, date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const season = SPECIES_SEASONS[speciesId];
  if (!season) return 999;

  let minDiffDays = Infinity;
  for (const y of [year - 1, year, year + 1]) {
    const start = new Date(y, season.startMonth - 1, season.startDay);
    const endYear = season.endMonth < season.startMonth ? y + 1 : y;
    const end = new Date(endYear, season.endMonth - 1, season.endDay);
    const midTime = start.getTime() + (end.getTime() - start.getTime()) / 2;

    const diffDays = Math.abs(d.getTime() - midTime) / (1000 * 60 * 60 * 24);
    if (diffDays < minDiffDays) {
      minDiffDays = diffDays;
    }
  }

  return minDiffDays;
}
