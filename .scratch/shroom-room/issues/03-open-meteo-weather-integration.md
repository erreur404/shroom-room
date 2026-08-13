# Ticket 03: Open-Meteo Weather Querying & Fruiting Trigger Scoring

Status: resolved
Type: prototype
Blocked by: none

## Question

How should the client/server query Open-Meteo's free Historical & Forecast APIs for a given user map bounding box (viewport grid points) to retrieve 14-day cumulative rainfall and 5cm soil temperature, and compute the dynamic **Probability Map** overlay in real time?

## Answer

Resolved by research and prototype implementation at [docs/research/open-meteo-weather-pipeline.md](file:///d:/William/Documents/git/shroom-room/docs/research/open-meteo-weather-pipeline.md).

Key findings:
1. **Endpoint & Multi-Location Querying**: Query `https://api.open-meteo.com/v1/forecast` with comma-separated `latitude` and `longitude` arrays and `past_days=14` in a single HTTP request (up to 1,000 coordinate points).
2. **Key Target Variables**: `daily=precipitation_sum,soil_temperature_0_to_10cm_mean,soil_moisture_0_to_7cm_mean`.
3. **Viewport Sampling**: Generate an $8 \times 8$ to $12 \times 12$ grid (64–144 points) spanning the user's viewport, with an LRU cache (TTL 3 hours).
4. **Trigger Math**: Compute 14-day cumulative rainfall $R_{14} \ge 25\text{mm}$, current soil temperature gaussian suitability ($10\text{--}18^\circ\text{C}$), and 7-day cold shock drop ($\Delta T \ge 2.5^\circ\text{C}$) to produce $M_{\text{weather}} \in [0.0, 1.0]$.
5. **Dynamic Overlay**: Interpolate spatial weather scores client-side via Inverse Distance Weighting (IDW) on an HTML5 canvas overlaid on the static Suitability Map.
