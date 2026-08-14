# Ticket 04: Suitability & Probability Algorithm Scoring Specification

Status: resolved
Type: grilling
Blocked by: 01, 02, 03

## Question

What exact mathematical scoring functions and parameter weightings (0–100%) combine soil pH penalty curves, host tree proximity buffers, elevation suitability, rainfall pulse thresholds, and soil temperature drop triggers into the final **Suitability Map** and **Probability Map** for *Boletus edulis* and *Cantharellus cibarius*?

## Answer

Resolved by specification and pluggable pipeline architecture at [docs/research/scoring-algorithm-specification.md](file:///d:/William/Documents/git/shroom-room/docs/research/scoring-algorithm-specification.md).

Key decisions:
1. **Pluggable Architecture (ADR-0001)**: Decomposed into species-specific suitability pipelines (`ISuitabilityPipeline`) and modular weather trigger strategies (`IProbabilityPipeline`).
2. **Static Suitability Models**:
   - Host tree proximity binary kill-gate (within 20m root buffer, otherwise 0%).
   - Gaussian soil pH curves: *Boletus edulis* ($\mu=5.5, \sigma=0.7$), *Cantharellus cibarius* ($\mu=4.6, \sigma=0.5$).
   - Weightings: 70% Soil pH, 15% Soil Texture (clay/sand), 15% Topography/Elevation.
3. **Dynamic Probability Models**:
   - `RainColdShockTriggerPipeline` for *Boletus edulis*: Combines 14-day rainfall pulse with autumn soil temperature drop ($13.5^\circ\text{C}$ optimum, $\Delta T \ge 2.5^\circ\text{C}$ shock bonus).
   - `RainPulseTriggerPipeline` for *Cantharellus cibarius*: Rain-dominated summer window ($17.5^\circ\text{C}$ optimum, sustained moisture).
4. **Composition**: $P(x, y, t) = S(x, y) \times \text{SeasonActive} \times M_{\text{weather}} \times 100\%$.
