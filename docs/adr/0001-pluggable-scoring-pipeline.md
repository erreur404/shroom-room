# ADR-0001: Pluggable Scoring Pipeline Architecture

**Status**: Accepted  
**Date**: 2026-08-13  
**Deciders**: William

## Context

The Shroom Room system computes two map layers — the **Suitability Map** (static, habitat-based) and the **Probability Map** (dynamic, weather-triggered). The initial MVP will use hand-tuned, rule-based scoring functions (pH penalty curves, host-tree proximity buffers, rainfall/temperature triggers).

However, a future goal is to explore data-driven approaches — MaxEnt species distribution models, Random Forest classifiers trained on GBIF occurrence data, and potentially other ML pipelines. We want to be able to **compare** these approaches side-by-side and swap them without re-architecting the system.

## Decision

Design the scoring architecture around a **pluggable pipeline interface** from day one:

1. **Pipeline contract**: Define a common interface that any scoring pipeline must implement — given a species, a spatial cell, and the relevant environmental inputs (soil, tree, elevation, weather), return a suitability score (0–100%) and/or a probability score (0–100%).

2. **Pipeline registry**: The system maintains a registry of available pipelines (e.g. `rule-based-v1`, `maxent-boletus-v1`). The active pipeline is selected per species or globally via configuration, not hard-coded.

3. **Input normalisation layer**: Environmental data (SoilGrids pH, ForestPaths tree proximity, Open-Meteo weather) is fetched and normalised *before* reaching the pipeline, so pipelines receive clean, uniform inputs regardless of upstream data source quirks.

4. **Output contract**: All pipelines produce the same output shape — a grid of scored cells with metadata (pipeline id, version, timestamp) — so the frontend and any comparison tooling remain pipeline-agnostic.

## Consequences

- **Positive**: New scoring approaches (ML models, ensemble methods) can be added as new pipeline implementations without touching the data ingestion, tiling, or frontend layers.
- **Positive**: A/B comparison between pipelines becomes straightforward — run two pipelines on the same region and diff the output grids.
- **Positive**: The rule-based MVP pipeline serves as a concrete reference implementation and baseline for evaluating ML alternatives.
- **Trade-off**: Slightly more upfront design work to define the interface before the first pipeline is built, but this is modest — the interface is small (species + cell + env → score).
- **Risk**: Over-abstracting too early. Mitigated by keeping the interface minimal and only extracting shared behaviour once a second pipeline actually exists.

## Alternatives Considered

- **Hard-code the rule-based approach, refactor later**: Rejected because the ML pipeline is already a known future goal (not speculative), and retrofitting a plugin boundary into a monolithic scorer is more expensive than designing it in.
- **Full plugin system with dynamic loading**: Rejected as over-engineering for this stage. A simple interface/strategy pattern with a config-driven selector is sufficient.
