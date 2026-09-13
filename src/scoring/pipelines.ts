import { EnvironmentalInputs, ScoringResult, SpeciesId } from '../types';
import { isSeasonActive, SPECIES_SEASONS, getDaysToSeasonMidpoint, type SpeciesSeasonWindow } from './season';

export { isSeasonActive, SPECIES_SEASONS, getDaysToSeasonMidpoint, type SpeciesSeasonWindow };

/**
 * Pipeline Interfaces according to ADR-0001
 */
export interface ISuitabilityPipeline {
  name: string;
  speciesId: SpeciesId;
  computeSuitability(env: EnvironmentalInputs): {
    suitabilityScore: number;
    pHScore: number;
    hostTreeScore: number;
  };
}

export interface IProbabilityPipeline {
  name: string;
  computeWeatherMultiplier(env: EnvironmentalInputs): {
    weatherScore: number;
    rainScore: number;
    tempScore: number;
    tempDrop: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Concrete Suitability Pipelines
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Boletus edulis (Porcini / King Bolete) Suitability Pipeline
 * - Symbionts: Picea (1), Pinus (2), Fagus (3), Quercus (4)
 * - Optimal pH: 4.8 - 6.2 (center 5.5, sigma 0.7)
 * - Strict 20m root zone gate
 */
export class BoletusSuitabilityPipeline implements ISuitabilityPipeline {
  name = 'boletus-edulis-suitability-v1';
  speciesId: SpeciesId = 'boletus';

  computeSuitability(env: EnvironmentalInputs) {
    const isHostTree = [1, 2, 3, 4].includes(env.hostTreeGenus);
    const hostTreeScore = (isHostTree && env.distToHostMeters <= 20) ? 1.0 : 0.0;

    if (hostTreeScore === 0.0) {
      return { suitabilityScore: 0.0, pHScore: 0.0, hostTreeScore: 0.0 };
    }

    // Gaussian pH penalty curve centered at 5.5
    const pHScore = Math.exp(-Math.pow(env.soilPH - 5.5, 2) / (2 * 0.49));
    
    // Soil texture factor (prefers well-draining loamy sand)
    const textureScore = (env.clayPct <= 35 && env.sandPct >= 20) ? 1.0 : 0.6;
    
    // Topography factor
    const topoScore = 1.0;

    const suitabilityScore = hostTreeScore * (0.70 * pHScore + 0.15 * textureScore + 0.15 * topoScore);
    return {
      suitabilityScore: Math.min(1.0, Math.max(0.0, suitabilityScore)),
      pHScore,
      hostTreeScore
    };
  }
}

/**
 * Cantharellus cibarius (Golden Chanterelle) Suitability Pipeline
 * - Symbionts: Pinus (2), Fagus (3), Quercus (4)
 * - Strongly acidophilic: Optimal pH 4.0 - 5.2 (center 4.6, sigma 0.5)
 * - Strict 20m root zone gate
 */
export class CantharellusSuitabilityPipeline implements ISuitabilityPipeline {
  name = 'cantharellus-cibarius-suitability-v1';
  speciesId: SpeciesId = 'cantharellus';

  computeSuitability(env: EnvironmentalInputs) {
    const isHostTree = [2, 3, 4].includes(env.hostTreeGenus);
    const hostTreeScore = (isHostTree && env.distToHostMeters <= 20) ? 1.0 : 0.0;

    if (hostTreeScore === 0.0) {
      return { suitabilityScore: 0.0, pHScore: 0.0, hostTreeScore: 0.0 };
    }

    // Gaussian pH penalty curve centered at 4.6
    const pHScore = Math.exp(-Math.pow(env.soilPH - 4.6, 2) / (2 * 0.25));
    
    // Soil texture factor (prefers acidic leaf litter and moderate clay)
    const textureScore = (env.clayPct <= 30) ? 1.0 : 0.5;
    
    // Topography factor
    const topoScore = 1.0;

    const suitabilityScore = hostTreeScore * (0.70 * pHScore + 0.15 * textureScore + 0.15 * topoScore);
    return {
      suitabilityScore: Math.min(1.0, Math.max(0.0, suitabilityScore)),
      pHScore,
      hostTreeScore
    };
  }
}

/**
 * Hydnum repandum (Wood Hedgehog / Pied-de-mouton) Suitability Pipeline
 * - Symbionts: Picea (1), Pinus (2), Fagus (3), Quercus (4)
 * - Optimal pH: 4.5 - 6.5 (center 5.3, sigma 0.8)
 * - Strict 20m root zone gate
 */
export class HydnumSuitabilityPipeline implements ISuitabilityPipeline {
  name = 'hydnum-repandum-suitability-v1';
  speciesId: SpeciesId = 'hydnum';

  computeSuitability(env: EnvironmentalInputs) {
    const isHostTree = [1, 2, 3, 4].includes(env.hostTreeGenus);
    const hostTreeScore = (isHostTree && env.distToHostMeters <= 20) ? 1.0 : 0.0;

    if (hostTreeScore === 0.0) {
      return { suitabilityScore: 0.0, pHScore: 0.0, hostTreeScore: 0.0 };
    }

    // Gaussian pH penalty curve centered at 5.3
    const pHScore = Math.exp(-Math.pow(env.soilPH - 5.3, 2) / (2 * 0.64));
    
    // Soil texture factor (prefers well-drained mossy woodland floor, moderate clay)
    const textureScore = (env.clayPct <= 35 && env.sandPct >= 20) ? 1.0 : 0.6;
    
    // Topography factor
    const topoScore = 1.0;

    const suitabilityScore = hostTreeScore * (0.70 * pHScore + 0.15 * textureScore + 0.15 * topoScore);
    return {
      suitabilityScore: Math.min(1.0, Math.max(0.0, suitabilityScore)),
      pHScore,
      hostTreeScore
    };
  }
}

/**
 * Craterellus cornucopioides (Black Trumpet / Totentrompete / Trompette de la mort) Suitability Pipeline
 * - Symbionts: Fagus (3), Quercus (4)
 * - Optimal pH: 5.2 - 6.8 (center 6.0, sigma 0.7)
 * - Soil texture: Moisture-retaining loam/clay (clayPct >= 15)
 * - Strict 20m root zone gate
 */
export class CraterellusCornucopioidesSuitabilityPipeline implements ISuitabilityPipeline {
  name = 'craterellus-cornucopioides-suitability-v1';
  speciesId: SpeciesId = 'craterellus_cornucopioides';

  computeSuitability(env: EnvironmentalInputs) {
    const isHostTree = [3, 4].includes(env.hostTreeGenus);
    const hostTreeScore = (isHostTree && env.distToHostMeters <= 20) ? 1.0 : 0.0;

    if (hostTreeScore === 0.0) {
      return { suitabilityScore: 0.0, pHScore: 0.0, hostTreeScore: 0.0 };
    }

    // Gaussian pH penalty curve centered at 6.0
    const pHScore = Math.exp(-Math.pow(env.soilPH - 6.0, 2) / (2 * 0.49));
    
    // Soil texture factor (prefers damp clayey/loamy soil)
    const textureScore = (env.clayPct >= 15 && env.clayPct <= 45) ? 1.0 : 0.6;
    const topoScore = 1.0;

    const suitabilityScore = hostTreeScore * (0.70 * pHScore + 0.15 * textureScore + 0.15 * topoScore);
    return {
      suitabilityScore: Math.min(1.0, Math.max(0.0, suitabilityScore)),
      pHScore,
      hostTreeScore
    };
  }
}

/**
 * Craterellus tubaeformis (Trumpet Chanterelle / Yellowfoot) Suitability Pipeline
 * - Symbionts: Picea (1), Pinus (2), Fagus (3)
 * - Acidophilic: Optimal pH 4.0 - 5.5 (center 4.7, sigma 0.6)
 * - Soil texture: Acidic mossy ground & sphagnum cushions
 * - Strict 20m root zone gate
 */
export class CraterellusTubaeformisSuitabilityPipeline implements ISuitabilityPipeline {
  name = 'craterellus-tubaeformis-suitability-v1';
  speciesId: SpeciesId = 'craterellus_tubaeformis';

  computeSuitability(env: EnvironmentalInputs) {
    const isHostTree = [1, 2, 3].includes(env.hostTreeGenus);
    const hostTreeScore = (isHostTree && env.distToHostMeters <= 20) ? 1.0 : 0.0;

    if (hostTreeScore === 0.0) {
      return { suitabilityScore: 0.0, pHScore: 0.0, hostTreeScore: 0.0 };
    }

    // Gaussian pH penalty curve centered at 4.7
    const pHScore = Math.exp(-Math.pow(env.soilPH - 4.7, 2) / (2 * 0.36));
    
    // Soil texture factor (prefers moss cushions & acidic soil)
    const textureScore = (env.clayPct <= 30) ? 1.0 : 0.6;
    const topoScore = 1.0;

    const suitabilityScore = hostTreeScore * (0.70 * pHScore + 0.15 * textureScore + 0.15 * topoScore);
    return {
      suitabilityScore: Math.min(1.0, Math.max(0.0, suitabilityScore)),
      pHScore,
      hostTreeScore
    };
  }
}

/**
 * Imleria badia (Bay Bolete / Maronen-Röhrling / Cèpe bai) Suitability Pipeline
 * - Symbionts: Picea (1), Pinus (2), Fagus (3)
 * - Strongly acidophilic: Optimal pH 3.8 - 5.4 (center 4.5, sigma 0.6)
 * - Soil texture: Sandy, well-draining podzolic soils
 * - Strict 20m root zone gate
 */
export class ImleriaBadiaSuitabilityPipeline implements ISuitabilityPipeline {
  name = 'imleria-badia-suitability-v1';
  speciesId: SpeciesId = 'imleria_badia';

  computeSuitability(env: EnvironmentalInputs) {
    const isHostTree = [1, 2, 3].includes(env.hostTreeGenus);
    const hostTreeScore = (isHostTree && env.distToHostMeters <= 20) ? 1.0 : 0.0;

    if (hostTreeScore === 0.0) {
      return { suitabilityScore: 0.0, pHScore: 0.0, hostTreeScore: 0.0 };
    }

    // Gaussian pH penalty curve centered at 4.5
    const pHScore = Math.exp(-Math.pow(env.soilPH - 4.5, 2) / (2 * 0.36));
    
    // Soil texture factor (prefers sandy, well-drained acidic soil)
    const textureScore = (env.sandPct >= 30 && env.clayPct <= 30) ? 1.0 : 0.6;
    const topoScore = 1.0;

    const suitabilityScore = hostTreeScore * (0.70 * pHScore + 0.15 * textureScore + 0.15 * topoScore);
    return {
      suitabilityScore: Math.min(1.0, Math.max(0.0, suitabilityScore)),
      pHScore,
      hostTreeScore
    };
  }
}

/**
 * Laetiporus sulphureus (Chicken of the Woods / Schwefelporling) Suitability Pipeline
 * - Hosts: Quercus (4), Other broadleaf (6), Fagus (3)
 * - Lignicolous / tree-bound: within 15m trunk zone
 * - Broad soil pH tolerance
 */
export class LaetiporusSulphureusSuitabilityPipeline implements ISuitabilityPipeline {
  name = 'laetiporus-sulphureus-suitability-v1';
  speciesId: SpeciesId = 'laetiporus_sulphureus';

  computeSuitability(env: EnvironmentalInputs) {
    const isHostTree = [3, 4, 6].includes(env.hostTreeGenus);
    const hostTreeScore = (isHostTree && env.distToHostMeters <= 15) ? 1.0 : 0.0;

    if (hostTreeScore === 0.0) {
      return { suitabilityScore: 0.0, pHScore: 0.0, hostTreeScore: 0.0 };
    }

    // Broad pH curve centered at 5.5, sigma 1.2
    const pHScore = Math.exp(-Math.pow(env.soilPH - 5.5, 2) / (2 * 1.44));
    const textureScore = 1.0;
    const topoScore = 1.0;

    const suitabilityScore = hostTreeScore * (0.60 * pHScore + 0.20 * textureScore + 0.20 * topoScore);
    return {
      suitabilityScore: Math.min(1.0, Math.max(0.0, suitabilityScore)),
      pHScore,
      hostTreeScore
    };
  }
}

/**
 * Macrolepiota procera (Parasol Mushroom / Parasolpilz) Suitability Pipeline
 * - Saprotrophic: Forest openings, grassy margins, edges (distToHost <= 30m)
 * - Requires rich organic content (socDgKg >= 250)
 * - Optimal pH: 5.0 - 7.2 (center 6.0, sigma 0.8)
 */
export class MacrolepiotaProceraSuitabilityPipeline implements ISuitabilityPipeline {
  name = 'macrolepiota-procera-suitability-v1';
  speciesId: SpeciesId = 'macrolepiota_procera';

  computeSuitability(env: EnvironmentalInputs) {
    const isForestOrEdge = env.hostTreeGenus !== 7 && env.distToHostMeters <= 30;
    const habitatScore = isForestOrEdge ? 1.0 : 0.0;

    if (habitatScore === 0.0) {
      return { suitabilityScore: 0.0, pHScore: 0.0, hostTreeScore: 0.0 };
    }

    // Gaussian pH curve centered at 6.0, sigma 0.8
    const pHScore = Math.exp(-Math.pow(env.soilPH - 6.0, 2) / (2 * 0.64));
    
    // High organic matter / humus preference
    const socScore = (env.socDgKg >= 250) ? 1.0 : 0.6;
    const topoScore = 1.0;

    const suitabilityScore = habitatScore * (0.50 * pHScore + 0.30 * socScore + 0.20 * topoScore);
    return {
      suitabilityScore: Math.min(1.0, Math.max(0.0, suitabilityScore)),
      pHScore,
      hostTreeScore: habitatScore
    };
  }
}

/**
 * Suillus luteus / grevillei (Slippery Jack & Larch Bolete) Suitability Pipeline
 * - Obligate Pinus (2) and Larix (0) symbionts
 * - Acidic sandy soils (sandPct >= 25, optimal pH 4.2 - 6.0)
 * - Strict 20m root zone gate
 */
export class SuillusLuteusSuitabilityPipeline implements ISuitabilityPipeline {
  name = 'suillus-luteus-suitability-v1';
  speciesId: SpeciesId = 'suillus_luteus';

  computeSuitability(env: EnvironmentalInputs) {
    const isHostTree = [0, 2].includes(env.hostTreeGenus);
    const hostTreeScore = (isHostTree && env.distToHostMeters <= 20) ? 1.0 : 0.0;

    if (hostTreeScore === 0.0) {
      return { suitabilityScore: 0.0, pHScore: 0.0, hostTreeScore: 0.0 };
    }

    // Gaussian pH curve centered at 5.0, sigma 0.7
    const pHScore = Math.exp(-Math.pow(env.soilPH - 5.0, 2) / (2 * 0.49));
    
    // Sandy soil preference
    const textureScore = (env.sandPct >= 25) ? 1.0 : 0.6;
    const topoScore = 1.0;

    const suitabilityScore = hostTreeScore * (0.70 * pHScore + 0.15 * textureScore + 0.15 * topoScore);
    return {
      suitabilityScore: Math.min(1.0, Math.max(0.0, suitabilityScore)),
      pHScore,
      hostTreeScore
    };
  }
}

/**
 * Coprinus comatus (Shaggy Mane / Coprin chevelu / Schopftintling) Suitability Pipeline
 * - Saprotrophic: Grassy woodland borders, clearings, path edges (distToHost <= 35m)
 * - Optimal pH: 6.0 - 7.8 (center 6.8, sigma 0.7)
 * - Nitrophilic: Requires rich organic matter / humus (socDgKg >= 220)
 * - Soil texture: Loamy, well-aerated soil (clayPct <= 35)
 */
export class CoprinusComatusSuitabilityPipeline implements ISuitabilityPipeline {
  name = 'coprinus-comatus-suitability-v1';
  speciesId: SpeciesId = 'coprinus_comatus';

  computeSuitability(env: EnvironmentalInputs) {
    const isForestOrEdge = env.hostTreeGenus !== 7 && env.distToHostMeters <= 35;
    const habitatScore = isForestOrEdge ? 1.0 : 0.0;

    if (habitatScore === 0.0) {
      return { suitabilityScore: 0.0, pHScore: 0.0, hostTreeScore: 0.0 };
    }

    // Gaussian pH curve centered at 6.8, sigma 0.7
    const pHScore = Math.exp(-Math.pow(env.soilPH - 6.8, 2) / (2 * 0.49));

    // High organic matter / humus preference (nitrophilic saprotroph)
    const socScore = (env.socDgKg >= 220) ? 1.0 : 0.6;

    // Soil texture factor (prefers moist loamy ground)
    const textureScore = (env.clayPct <= 35 && env.sandPct >= 15) ? 1.0 : 0.7;
    const topoScore = 1.0;

    const suitabilityScore = habitatScore * (0.50 * pHScore + 0.30 * socScore + 0.10 * textureScore + 0.10 * topoScore);
    return {
      suitabilityScore: Math.min(1.0, Math.max(0.0, suitabilityScore)),
      pHScore,
      hostTreeScore: habitatScore
    };
  }
}

/**
 * Sparassis crispa (Cauliflower Mushroom / Krause Glucke / Sparassis crépu) Suitability Pipeline
 * - Parasitic / Lignicolous brown-rot on conifer roots/bases, predominantly Pinus (2), occasionally Picea (1), Larix (0)
 * - Strict 15m trunk proximity gate
 * - Acidophilic: Optimal pH 4.0 - 5.5 (center 4.7, sigma 0.6)
 * - Sandy podzols and well-drained pine forest floor
 */
export class SparassisCrispaSuitabilityPipeline implements ISuitabilityPipeline {
  name = 'sparassis-crispa-suitability-v1';
  speciesId: SpeciesId = 'sparassis_crispa';

  computeSuitability(env: EnvironmentalInputs) {
    let hostWeight = 0.0;
    if (env.hostTreeGenus === 2) {
      hostWeight = 1.0;
    } else if ([0, 1].includes(env.hostTreeGenus)) {
      hostWeight = 0.75;
    }

    const hostTreeScore = (hostWeight > 0.0 && env.distToHostMeters <= 15) ? hostWeight : 0.0;

    if (hostTreeScore === 0.0) {
      return { suitabilityScore: 0.0, pHScore: 0.0, hostTreeScore: 0.0 };
    }

    // Gaussian pH penalty curve centered at 4.7, sigma 0.6
    const pHScore = Math.exp(-Math.pow(env.soilPH - 4.7, 2) / (2 * 0.36));

    // Soil texture factor (prefers sandy, well-draining pine soils)
    const textureScore = (env.sandPct >= 25 && env.clayPct <= 35) ? 1.0 : 0.6;
    const topoScore = 1.0;

    const suitabilityScore = hostTreeScore * (0.65 * pHScore + 0.20 * textureScore + 0.15 * topoScore);
    return {
      suitabilityScore: Math.min(1.0, Math.max(0.0, suitabilityScore)),
      pHScore,
      hostTreeScore
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Concrete Probability Pipelines
// ─────────────────────────────────────────────────────────────────────────────

/**
 * RainColdShockTriggerPipeline (Autumn / Bolete Guild)
 * - Evaluates 14-day rainfall pulse (optimal >= 50mm)
 * - Evaluates autumn cold-shock drop (delta T >= 2.5°C with current temp 10-17°C)
 */
export class RainColdShockTriggerPipeline implements IProbabilityPipeline {
  name = 'rain-cold-shock-trigger-v1';

  computeWeatherMultiplier(env: EnvironmentalInputs) {
    // 1. Rain Pulse Index (15mm threshold, 50mm optimal)
    const rainScore = Math.min(1.0, Math.max(0.0, (env.rain14DaysMm - 15.0) / 35.0));

    // 2. Soil Temperature & Thermal Cold Shock Drop
    const tempDrop = Math.max(0.0, env.pastWeekSoilTempC - env.currentSoilTempC);
    const thermalBell = Math.exp(-Math.pow(env.currentSoilTempC - 13.5, 2) / (2 * 12.25)); // opt 13.5°C, sigma 3.5°C
    const shockBonus = 0.60 + 0.40 * Math.min(1.0, Math.max(0.0, tempDrop / 3.0));
    const tempScore = thermalBell * shockBonus;

    // 3. Combined Weather Multiplier
    const weatherScore = Math.pow(rainScore, 0.60) * Math.pow(tempScore, 0.40);

    return {
      weatherScore: Math.min(1.0, Math.max(0.0, weatherScore)),
      rainScore,
      tempScore,
      tempDrop
    };
  }
}

/**
 * RainPulseTriggerPipeline (Summer / Chanterelle Guild)
 * - Evaluates summer sustained moisture (optimal >= 42mm)
 * - Evaluates warm season soil temperature window (14°C - 22°C) without requiring cold-shock
 */
export class RainPulseTriggerPipeline implements IProbabilityPipeline {
  name = 'rain-pulse-trigger-v1';

  computeWeatherMultiplier(env: EnvironmentalInputs) {
    // 1. Rain Pulse Index (12mm threshold, 42mm optimal)
    const rainScore = Math.min(1.0, Math.max(0.0, (env.rain14DaysMm - 12.0) / 30.0));

    // 2. Summer Temperature Window (opt 17.5°C, sigma 4.0°C)
    const tempScore = Math.exp(-Math.pow(env.currentSoilTempC - 17.5, 2) / (2 * 16.0));
    const tempDrop = Math.max(0.0, env.pastWeekSoilTempC - env.currentSoilTempC);

    // 3. Combined Weather Multiplier (Rain dominated)
    const weatherScore = Math.pow(rainScore, 0.75) * Math.pow(tempScore, 0.25);

    return {
      weatherScore: Math.min(1.0, Math.max(0.0, weatherScore)),
      rainScore,
      tempScore,
      tempDrop
    };
  }
}

/**
 * HydnumWeatherTriggerPipeline (Late Autumn / Hedgehog Mushroom Guild)
 * - Evaluates late-season 14-day rainfall pulse (15mm threshold, 40mm optimal)
 * - Evaluates cool autumn temperature window (8°C - 16°C, opt 12.0°C) with cold-tolerance
 */
export class HydnumWeatherTriggerPipeline implements IProbabilityPipeline {
  name = 'hydnum-weather-trigger-v1';

  computeWeatherMultiplier(env: EnvironmentalInputs) {
    // 1. Rain Pulse Index (15mm threshold, 40mm optimal)
    const rainScore = Math.min(1.0, Math.max(0.0, (env.rain14DaysMm - 15.0) / 25.0));

    // 2. Late Autumn Temperature Window (opt 12.0°C, sigma 4.0°C)
    const thermalBell = Math.exp(-Math.pow(env.currentSoilTempC - 12.0, 2) / (2 * 16.0));
    const tempDrop = Math.max(0.0, env.pastWeekSoilTempC - env.currentSoilTempC);
    const shockBonus = 0.70 + 0.30 * Math.min(1.0, Math.max(0.0, tempDrop / 3.0));
    const tempScore = thermalBell * shockBonus;

    // 3. Combined Weather Multiplier
    const weatherScore = Math.pow(rainScore, 0.65) * Math.pow(tempScore, 0.35);

    return {
      weatherScore: Math.min(1.0, Math.max(0.0, weatherScore)),
      rainScore,
      tempScore,
      tempDrop
    };
  }
}

/**
 * WinterChanterelleWeatherTriggerPipeline (Late Autumn & Winter Guild)
 * - Evaluates cold-hardy fruiting window down to near-frost (opt 9.0°C, sigma 4.5°C)
 * - Evaluates late season rainfall persistence
 */
export class WinterChanterelleWeatherTriggerPipeline implements IProbabilityPipeline {
  name = 'winter-chanterelle-weather-trigger-v1';

  computeWeatherMultiplier(env: EnvironmentalInputs) {
    const rainScore = Math.min(1.0, Math.max(0.0, (env.rain14DaysMm - 15.0) / 30.0));
    const thermalBell = Math.exp(-Math.pow(env.currentSoilTempC - 9.0, 2) / (2 * 20.25));
    const weatherScore = Math.pow(rainScore, 0.70) * Math.pow(thermalBell, 0.30);

    return {
      weatherScore: Math.min(1.0, Math.max(0.0, weatherScore)),
      rainScore,
      tempScore: thermalBell,
      tempDrop: Math.max(0.0, env.pastWeekSoilTempC - env.currentSoilTempC)
    };
  }
}

/**
 * WarmSeasonWoodTriggerPipeline (Lignicolous Polypore Guild: Laetiporus)
 * - Evaluates warm season growth (opt 18.5°C, sigma 4.5°C)
 * - Moderate rain requirement (tree heartwood buffers short droughts)
 */
export class WarmSeasonWoodTriggerPipeline implements IProbabilityPipeline {
  name = 'warm-season-wood-trigger-v1';

  computeWeatherMultiplier(env: EnvironmentalInputs) {
    const rainScore = Math.min(1.0, Math.max(0.0, (env.rain14DaysMm - 10.0) / 25.0));
    const thermalBell = Math.exp(-Math.pow(env.currentSoilTempC - 18.5, 2) / (2 * 20.25));
    const weatherScore = Math.pow(rainScore, 0.50) * Math.pow(thermalBell, 0.50);

    return {
      weatherScore: Math.min(1.0, Math.max(0.0, weatherScore)),
      rainScore,
      tempScore: thermalBell,
      tempDrop: 0
    };
  }
}

/**
 * ParasolWeatherTriggerPipeline (Saprotrophic Meadow/Edge Guild: Macrolepiota)
 * - Evaluates late summer / autumn warm-to-mild trigger (opt 16.0°C, sigma 4.0°C)
 */
export class ParasolWeatherTriggerPipeline implements IProbabilityPipeline {
  name = 'parasol-weather-trigger-v1';

  computeWeatherMultiplier(env: EnvironmentalInputs) {
    const rainScore = Math.min(1.0, Math.max(0.0, (env.rain14DaysMm - 12.0) / 26.0));
    const thermalBell = Math.exp(-Math.pow(env.currentSoilTempC - 16.0, 2) / (2 * 16.0));
    const weatherScore = Math.pow(rainScore, 0.65) * Math.pow(thermalBell, 0.35);

    return {
      weatherScore: Math.min(1.0, Math.max(0.0, weatherScore)),
      rainScore,
      tempScore: thermalBell,
      tempDrop: Math.max(0.0, env.pastWeekSoilTempC - env.currentSoilTempC)
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoring Engine Registry & Evaluator
// ─────────────────────────────────────────────────────────────────────────────

export class ScoringEngine {
  private suitabilityPipelines: Map<SpeciesId, ISuitabilityPipeline> = new Map();
  private probabilityPipelines: Map<SpeciesId, IProbabilityPipeline> = new Map();

  constructor() {
    // 1. Boletus edulis
    this.suitabilityPipelines.set('boletus', new BoletusSuitabilityPipeline());
    this.probabilityPipelines.set('boletus', new RainColdShockTriggerPipeline());

    // 2. Cantharellus cibarius
    this.suitabilityPipelines.set('cantharellus', new CantharellusSuitabilityPipeline());
    this.probabilityPipelines.set('cantharellus', new RainPulseTriggerPipeline());

    // 3. Hydnum repandum
    this.suitabilityPipelines.set('hydnum', new HydnumSuitabilityPipeline());
    this.probabilityPipelines.set('hydnum', new HydnumWeatherTriggerPipeline());

    // 4. Craterellus cornucopioides
    this.suitabilityPipelines.set('craterellus_cornucopioides', new CraterellusCornucopioidesSuitabilityPipeline());
    this.probabilityPipelines.set('craterellus_cornucopioides', new RainColdShockTriggerPipeline());

    // 5. Craterellus tubaeformis
    this.suitabilityPipelines.set('craterellus_tubaeformis', new CraterellusTubaeformisSuitabilityPipeline());
    this.probabilityPipelines.set('craterellus_tubaeformis', new WinterChanterelleWeatherTriggerPipeline());

    // 6. Imleria badia
    this.suitabilityPipelines.set('imleria_badia', new ImleriaBadiaSuitabilityPipeline());
    this.probabilityPipelines.set('imleria_badia', new RainColdShockTriggerPipeline());

    // 7. Laetiporus sulphureus
    this.suitabilityPipelines.set('laetiporus_sulphureus', new LaetiporusSulphureusSuitabilityPipeline());
    this.probabilityPipelines.set('laetiporus_sulphureus', new WarmSeasonWoodTriggerPipeline());

    // 8. Macrolepiota procera
    this.suitabilityPipelines.set('macrolepiota_procera', new MacrolepiotaProceraSuitabilityPipeline());
    this.probabilityPipelines.set('macrolepiota_procera', new ParasolWeatherTriggerPipeline());

    // 9. Suillus luteus
    this.suitabilityPipelines.set('suillus_luteus', new SuillusLuteusSuitabilityPipeline());
    this.probabilityPipelines.set('suillus_luteus', new RainColdShockTriggerPipeline());

    // 10. Coprinus comatus
    this.suitabilityPipelines.set('coprinus_comatus', new CoprinusComatusSuitabilityPipeline());
    this.probabilityPipelines.set('coprinus_comatus', new ParasolWeatherTriggerPipeline());

    // 11. Sparassis crispa
    this.suitabilityPipelines.set('sparassis_crispa', new SparassisCrispaSuitabilityPipeline());
    this.probabilityPipelines.set('sparassis_crispa', new HydnumWeatherTriggerPipeline());
  }

  isSeasonActive(speciesId: SpeciesId, dateStr: string): boolean {
    return isSeasonActive(speciesId, dateStr);
  }

  evaluate(speciesId: SpeciesId, env: EnvironmentalInputs): ScoringResult {
    const suitPipe = this.suitabilityPipelines.get(speciesId) || new BoletusSuitabilityPipeline();
    const probPipe = this.probabilityPipelines.get(speciesId) || new RainColdShockTriggerPipeline();

    const suitRes = suitPipe.computeSuitability(env);
    const probRes = probPipe.computeWeatherMultiplier(env);
    const seasonActive = this.isSeasonActive(speciesId, env.date);

    // Final Probability Composition: P = S * Season * WeatherMultiplier
    const overallProbability = seasonActive 
      ? suitRes.suitabilityScore * probRes.weatherScore 
      : 0.0;

    return {
      suitabilityScore: suitRes.suitabilityScore,
      weatherScore: probRes.weatherScore,
      overallProbability,
      isSeasonActive: seasonActive,
      factors: {
        pHScore: suitRes.pHScore,
        hostTreeScore: suitRes.hostTreeScore,
        rainScore: probRes.rainScore,
        tempScore: probRes.tempScore,
        tempDrop: probRes.tempDrop
      }
    };
  }
}

