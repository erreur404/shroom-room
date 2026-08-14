import { EnvironmentalInputs, ScoringResult, SpeciesId } from '../types';

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

// ─────────────────────────────────────────────────────────────────────────────
// Scoring Engine Registry & Evaluator
// ─────────────────────────────────────────────────────────────────────────────

export class ScoringEngine {
  private suitabilityPipelines: Map<SpeciesId, ISuitabilityPipeline> = new Map();
  private probabilityPipelines: Map<SpeciesId, IProbabilityPipeline> = new Map();

  constructor() {
    // Register Default Pipelines per Species
    this.suitabilityPipelines.set('boletus', new BoletusSuitabilityPipeline());
    this.suitabilityPipelines.set('cantharellus', new CantharellusSuitabilityPipeline());

    this.probabilityPipelines.set('boletus', new RainColdShockTriggerPipeline());
    this.probabilityPipelines.set('cantharellus', new RainPulseTriggerPipeline());
  }

  isSeasonActive(speciesId: SpeciesId, dateStr: string): boolean {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1; // 1 - 12
    const day = d.getDate();

    if (speciesId === 'boletus') {
      // Aug 15 to Nov 15
      return (month === 8 && day >= 15) || month === 9 || month === 10 || (month === 11 && day <= 15);
    } else if (speciesId === 'cantharellus') {
      // Jun 15 to Oct 31
      return (month === 6 && day >= 15) || month === 7 || month === 8 || month === 9 || month === 10;
    }
    return true;
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
