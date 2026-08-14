import { EnvironmentalInputs, RegionId, RegionPreset, SpeciesId, WeatherGridPoint } from '../types';
import { WeatherService } from './weatherService';

export const REGION_PRESETS: Record<RegionId, RegionPreset> = {
  harz: {
    id: 'harz',
    name: 'Harz National Park (Niedersachsen)',
    country: 'DE',
    center: [51.782, 10.451],
    zoom: 12,
    description: 'High-elevation montane Norway spruce and beech forest on acidic granite soils. Prime Boletus edulis habitat.',
    defaultSpecies: 'boletus'
  },
  goehrde: {
    id: 'goehrde',
    name: 'Göhrde State Forest (Niedersachsen)',
    country: 'DE',
    center: [53.142, 10.835],
    zoom: 12,
    description: 'Largest contiguous deciduous forest in Northern Germany with ancient oaks and beeches. Prime Cantharellus ground.',
    defaultSpecies: 'cantharellus'
  },
  lueneburg: {
    id: 'lueneburg',
    name: 'Lüneburg Heath (Niedersachsen)',
    country: 'DE',
    center: [53.165, 9.952],
    zoom: 11,
    description: 'Sandy pine and birch woodland on acidic podzolic soils with mossy forest margins.',
    defaultSpecies: 'cantharellus'
  },
  broceliande: {
    id: 'broceliande',
    name: 'Forêt de Brocéliande (Bretagne)',
    country: 'FR',
    center: [48.021, -2.172],
    zoom: 12,
    description: 'Ancient mythical forest on Brioverian schists and sandstones with dense oak and beech stands. Prime cèpes and girolles.',
    defaultSpecies: 'boletus'
  },
  huelgoat: {
    id: 'huelgoat',
    name: 'Forêt de Huelgoat (Bretagne)',
    country: 'FR',
    center: [48.364, -3.746],
    zoom: 12,
    description: 'Granite chaos and humid valley oak/beech/pine woodland with thick moss cushions.',
    defaultSpecies: 'cantharellus'
  }
};

export const SPECIES_DETAILS: Record<SpeciesId, {
  name: string;
  commonName: string;
  guild: string;
  symbionts: string[];
  optimalPH: string;
  seasonWindow: string;
  badgeColor: string;
}> = {
  boletus: {
    name: 'Boletus edulis',
    commonName: 'King Bolete / Porcini / Cèpe / Steinpilz',
    guild: 'Ectomycorrhizal (ECM)',
    symbionts: ['Spruce (Picea)', 'Beech (Fagus)', 'Oak (Quercus)', 'Pine (Pinus)'],
    optimalPH: 'pH 4.8 – 6.2 (Acidic to sub-neutral)',
    seasonWindow: 'August 15 – November 15 (Autumn Peak)',
    badgeColor: '#ef4444'
  },
  cantharellus: {
    name: 'Cantharellus cibarius',
    commonName: 'Golden Chanterelle / Girolle / Pfifferling',
    guild: 'Ectomycorrhizal (ECM)',
    symbionts: ['Oak (Quercus)', 'Beech (Fagus)', 'Pine (Pinus)', 'Birch (Betula)'],
    optimalPH: 'pH 4.0 – 5.2 (Strongly acidophilic)',
    seasonWindow: 'June 15 – October 31 (Summer/Autumn)',
    badgeColor: '#f59e0b'
  }
};

export class HabitatDataService {
  /**
   * Evaluates spatial environmental conditions (SoilGrids + ForestPaths) for a coordinate
   */
  getEnvironmentalInputs(
    lat: number,
    lon: number,
    dateStr: string,
    weatherGrid: WeatherGridPoint[],
    weatherService: WeatherService
  ): EnvironmentalInputs {
    // 1. Synthesize realistic SoilGrids pH based on regional geology and spatial variation
    const geoNoise = Math.sin(lat * 45.0) * Math.cos(lon * 45.0);
    const microNoise = Math.sin(lat * 180.0) * Math.cos(lon * 180.0);

    // Regional baseline pH: Harz (4.8), Brocéliande (4.6), Göhrde (5.4), Lüneburg (4.5), Huelgoat (4.4)
    let basePH = 5.0;
    if (lat > 51.5 && lat < 52.0) basePH = 4.9; // Harz
    else if (lat > 53.0 && lon > 10.5) basePH = 5.5; // Göhrde
    else if (lat > 53.0 && lon < 10.2) basePH = 4.6; // Lüneburg
    else if (lat < 48.2 && lon < -2.0) basePH = 4.7; // Brocéliande
    else if (lat > 48.2 && lon < -3.5) basePH = 4.4; // Huelgoat

    const soilPH = Math.max(3.8, Math.min(7.4, basePH + geoNoise * 0.5 + microNoise * 0.25));

    // 2. Synthesize ForestPaths 10m tree genus classification
    // Generates realistic patches of Spruce (1), Pine (2), Beech (3), Oak (4), Non-forest (7)
    const forestPatch = Math.sin(lat * 80.0) + Math.cos(lon * 80.0);
    const treeKindNoise = Math.sin(lat * 220.0) * Math.cos(lon * 220.0);
    
    let hostTreeGenus = 7; // Non-forest default
    let distToHostMeters = 50;

    if (forestPatch > -0.3) {
      // In forest patch
      distToHostMeters = Math.max(2, Math.floor(Math.abs(microNoise) * 22));
      if (treeKindNoise < -0.3) hostTreeGenus = 1; // Picea (Spruce)
      else if (treeKindNoise < 0.1) hostTreeGenus = 2; // Pinus (Pine)
      else if (treeKindNoise < 0.5) hostTreeGenus = 3; // Fagus (Beech)
      else hostTreeGenus = 4; // Quercus (Oak)
    }

    // 3. Soil texture
    const clayPct = Math.max(10, Math.min(45, 22 + geoNoise * 8));
    const sandPct = Math.max(20, Math.min(80, 55 - clayPct));
    const socDgKg = Math.max(120, Math.min(450, 240 + microNoise * 60));

    // 4. Topography / Elevation
    let elevationMeters = 180;
    if (lat > 51.5 && lat < 52.0) elevationMeters = Math.max(250, Math.floor(580 + geoNoise * 280)); // Harz
    else if (lat > 48.0 && lat < 48.5) elevationMeters = Math.max(80, Math.floor(190 + geoNoise * 110)); // Bretagne

    const aspectDegrees = Math.floor((Math.abs(geoNoise * 180) + 45) % 360);

    // 5. Interpolate weather for this point
    const weather = weatherService.interpolateAt(lat, lon, weatherGrid);

    return {
      lat,
      lon,
      soilPH: Math.round(soilPH * 10) / 10,
      clayPct: Math.round(clayPct),
      sandPct: Math.round(sandPct),
      socDgKg: Math.round(socDgKg),
      hostTreeGenus,
      distToHostMeters,
      elevationMeters,
      aspectDegrees,
      rain14DaysMm: weather.rain14DaysMm,
      currentSoilTempC: weather.currentSoilTempC,
      pastWeekSoilTempC: weather.pastWeekSoilTempC,
      date: dateStr
    };
  }

  getHostTreeName(genusId: number): string {
    switch (genusId) {
      case 0: return 'Larch (Larix)';
      case 1: return 'Norway Spruce (Picea abies)';
      case 2: return 'Scots Pine (Pinus sylvestris)';
      case 3: return 'European Beech (Fagus sylvatica)';
      case 4: return 'Oak (Quercus robur/petraea)';
      case 5: return 'Other Conifer';
      case 6: return 'Other Deciduous';
      default: return 'No host trees nearby (Clearcut/Grass)';
    }
  }
}
