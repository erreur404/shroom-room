# Field Identification, Toxic Lookalikes & GPX Safety Guide

This document details the diagnostic field identification rules, toxic and inedible lookalike warnings, and regional emergency poison control protocols embedded directly into GPX waypoint export metadata (`<desc>` / `<cmt>`) by Shroom Room.

---

## 1. Boletus edulis (King Bolete / Cèpe de Bordeaux / Steinpilz)

### A. Habitat & Search Strategy
- **Symbionts**: Norway Spruce (*Picea abies*), European Beech (*Fagus sylvatica*), Pedunculate/Sessile Oak (*Quercus robur/petraea*), Scots Pine (*Pinus sylvestris*).
- **Search Zone**: 2 to 15 meters from the trunk of mature trees. Target mossy path edges, ditch embankments, and semi-open clearings where direct sunlight warms the soil after rainfall.

### B. Diagnostic Identification Keys (The "Porcini Checklist")
1. **Cap**: Smooth, greasy/tacky when damp, hazelnut to dark chestnut brown with a distinct **thin white margin line** along the edge of the cap.
2. **Pores (Tubes)**: Spongy tube layer under the cap (**NO GILLS**).
   - *Young*: Pure chalk-white, firm.
   - *Mature*: Turns creamy-yellow, then olive-green.
   - *Reaction*: **Does NOT stain blue or brown when pressed**.
3. **Stem (Stipe)**: Club-shaped / bulbous at base, whitish to pale fawn. Covered on the upper half by a **fine white raised netting (reticulation)** pattern.
4. **Flesh**: Thick, firm, snow-white throughout. Does not change color when sliced. Mild, pleasant hazelnut aroma and nutty taste.

### C. Toxic & Inedible Lookalikes (CRITICAL SAFETY RULES)

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      BOLETE SAFETY RULES OF THUMB                       │
│  1. NEVER pick boletes with RED, ORANGE, or CRIMSON pores.              │
│  2. NEVER pick boletes whose flesh INSTANTLY STAINS DARK BLUE or RED.   │
│  3. ALWAYS check the stem netting: WHITE = Porcini, DARK/BLACK = Bitter.│
└─────────────────────────────────────────────────────────────────────────┘
```

1. ❌ **Rubroboletus satanas (Devil's Bolete / Satan's Bolete)** — **POISONOUS (Severe GI distress, violent vomiting)**:
   - *Cap*: Chalky off-white to dirty pale grey.
   - *Pores*: **Blood-red to orange-yellow**, staining blue when bruised.
   - *Stem*: Swollen, covered in a prominent red mesh pattern.
   - *Flesh*: Whitish, turns slowly blue when cut. Foul rotting smell when old.
   - *Substrate*: Thermophilic, calcareous/limestone beech and oak woods.

2. ❌ **Tylopilus felleus (Bitter Bolete / Gallenröhrling)** — **INEDIBLE (Extreme bitterness — ruins entire dish)**:
   - *Cap*: Similar light brown to Porcini.
   - *Pores*: Start white, but become **dirty pinkish/salmon** when mature (never olive-green).
   - *Stem*: Covered in a **coarse, dark brown or black raised netting** (contrast with Porcini's fine *white* netting).
   - *Test*: Touching a tiny piece of raw cap to the tip of the tongue reveals immediate overpowering bitterness.

3. ❌ **Caloboletus calopus (Bitter Beech Bolete / Schönfußröhrling)** — **INEDIBLE / MILDLY TOXIC**:
   - *Pores*: Lemon yellow, turning blue when touched.
   - *Stem*: Bright yellow at top, crimson red at bottom with coarse yellow mesh. Intensely bitter taste.

---

## 2. Cantharellus cibarius (Golden Chanterelle / Girolle / Echter Pfifferling)

### A. Habitat & Search Strategy
- **Symbionts**: Oak (*Quercus*), Beech (*Fagus*), Pine (*Pinus*), Birch (*Betula*).
- **Search Zone**: Moist, mossy, acidic soils, leaf litter cushions, and shaded moss-covered ditch banks. Often grows in clusters or fairy rings.

### B. Diagnostic Identification Keys (The "Chanterelle Checklist")
1. **Color**: Uniform egg-yolk golden yellow to pale apricot yellow throughout (cap, folds, and stem).
2. **Underside**: **FALSE GILLS (ridges / folds)**:
   - Thick, blunt-edged, repeatedly forked and interconnected (cross-veined).
   - Decurrent: They run down the stem smoothly.
   - **Cannot be separated** or scraped off the cap flesh without tearing the mushroom.
3. **Cap**: Irregular, wavy margin, funnel-shaped when mature.
4. **Flesh**: Pale yellowish-white, solid (never hollow). Distinct **apricot / fruity aroma** and slightly peppery raw taste.

### C. Toxic Lookalikes

1. ❌ **Omphalotus olearius / illudens (Jack-o'-Lantern / Clitocybe de l'olivier)** — **TOXIC (Severe muscarinic gastrointestinal poisoning)**:
   - *Substrate*: Grows in **dense tufts directly on decaying wood, tree stumps, or buried roots** (Genuine Chanterelles grow *on the ground / moss*).
   - *Gills*: **TRUE knife-sharp, blade-like, unbranched gills** that can be scraped off.
   - *Flesh*: Orange-yellow inside, unpleasant oily smell. Bioluminescent (faint green glow in total darkness).

2. ❌ **Hygrophoropsis aurantiaca (False Chanterelle / Falscher Pfifferling)** — **INEDIBLE / GASTROTOXIC**:
   - *Cap*: Bright pumpkin-orange to yellowish, thin and flimsy.
   - *Gills*: Crowded, thin, sharp true gills that fork dichotomously.
   - *Stem*: Slender, dark orange to brownish-black at base, often hollow. Lacks white meaty flesh and apricot scent.

---

## 3. GPX 1.1 Embedded Field Guide Formatting

The following structured text block is generated automatically and embedded into each `<desc>` tag within the GPX export file:

```xml
<wpt lat="51.782100" lon="10.451200">
  <ele>480.0</ele>
  <name>Boletus_01_Harz</name>
  <desc>
==================================================
🍄 SHROOM ROOM FIELD GUIDE: Boletus edulis (Porcini)
==================================================
📍 SITE DATA:
- Suitability: 88% | Probability: 82%
- Target Soil pH: 5.2 (Favorable) | 14d Rain: 42mm
- Habitat: Mature Spruce/Beech forest (2-15m from trees)

🔍 DIAGNOSTIC IDENTIFICATION:
1. Cap: Greasy brown with distinct thin WHITE edge line.
2. Pores: Spongy tubes (NO GILLS). White in youth -> yellow/olive-green. NO BLUE BRUISING.
3. Stem: Bulbous base with fine WHITE NETTING on upper half.
4. Flesh: Solid white, unchanging when sliced. Nutty smell.

⚠️ TOXIC LOOKALIKE WARNINGS:
- ❌ Rubroboletus satanas (Devil's Bolete): Pale gray cap, BLOOD-RED PORES, bruises DARK BLUE. TOXIC!
- ❌ Tylopilus felleus (Bitter Bolete): PINKISH pores, DARK/BLACK coarse netting. EXTREMELY BITTER.
- RULE: Never pick boletes with RED pores or instant BLUE flesh staining.

🚑 EMERGENCY POISON CONTROL:
- Germany (GIZ-Nord): +49 551 19240 | Berlin: +49 30 19240
- France (CAPTV Grand Ouest): +33 2 41 48 21 21 | SAMU: 15
- European Emergency: 112
- Note: Keep a raw specimen in paper bag; never consume unknown wild fungi.
==================================================
  </desc>
  <sym>Mushroom</sym>
</wpt>
```

---

## 4. Emergency First-Aid Protocols for Foragers

If accidental ingestion of an unknown or toxic mushroom is suspected:

1. **Immediate Action**:
   - Call the regional Poison Control Center or Emergency Services (**112**) immediately.
   - Do **NOT** induce vomiting or ingest activated charcoal, milk, or alcohol unless explicitly instructed by a toxicologist.
2. **Specimen Preservation**:
   - Keep any raw leftovers, trimmings, or uncleaned specimens stored in a dry paper bag (not plastic) for mycological analysis.
   - Take clear photos of the mushroom in its original habitat showing the cap, pores/gills, stem base, and cross-section.
3. **Medical Information to Provide**:
   - Time of ingestion and exact time symptoms began (onset $< 4\text{ hours}$ vs $> 6\text{ hours}$ is a critical diagnostic differentiator for lethal amatoxin poisoning).
