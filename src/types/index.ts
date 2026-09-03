export type SpeciesId = 'boletus' | 'cantharellus';

export type BasemapId = 'opentopomap' | 'cyclosm' | 'osm';


export interface EnvironmentalInputs {
  lat: number;
  lon: number;
  soilPH: number;
  clayPct: number;
  sandPct: number;
  socDgKg: number;
  hostTreeGenus: number; // 0: Larix, 1: Picea, 2: Pinus, 3: Fagus, 4: Quercus, 5: Other Needle, 6: Other Broad, 7: None
  distToHostMeters: number;
  elevationMeters: number;
  aspectDegrees: number;
  rain14DaysMm: number;
  currentSoilTempC: number;
  pastWeekSoilTempC: number;
  date: string;
}

export interface ScoringResult {
  suitabilityScore: number; // 0.0 to 1.0 (Static habitat)
  weatherScore: number;     // 0.0 to 1.0 (Dynamic meteorological trigger)
  overallProbability: number; // 0.0 to 1.0 (Combined fruiting chance)
  isSeasonActive: boolean;
  factors: {
    pHScore: number;
    hostTreeScore: number;
    rainScore: number;
    tempScore: number;
    tempDrop: number;
  };
}

export interface ForagingWaypoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  elevationMeters?: number;
  suitabilityScore: number;
  weatherScore: number;
  probabilityScore: number;
  soilPH: number;
  dominantTree: string;
  rain14DaysMm: number;
  currentSoilTempC: number;
  speciesId: SpeciesId;
  createdAt: string;
}

export interface WeatherGridPoint {
  lat: number;
  lon: number;
  rain14DaysMm: number;
  currentSoilTempC: number;
  pastWeekSoilTempC: number;
  weatherMultiplier: number;
}
