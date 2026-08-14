# Ticket 06: GPX Field Guide Metadata & Toxic Lookalike Safety Research

Status: resolved
Type: research
Blocked by: none

## Question

How should the GPX export engine embed rich in-field identification tips (micro-habitat search rules, host tree proximity, diagnostic morphological features), dangerous toxic/inedible lookalike warnings (e.g. *Rubroboletus satanas*, *Tylopilus felleus*, *Omphalotus olearius*, *Hygrophoropsis aurantiaca*), and regional emergency poison control contacts (DE / FR) into standard GPX 1.1 waypoint descriptions (`<desc>` / `<cmt>` / `<extensions>`) for maximum offline safety?

## Answer

Resolved by research and GPX template design at [docs/research/field-identification-toxic-lookalikes.md](file:///d:/William/Documents/git/shroom-room/docs/research/field-identification-toxic-lookalikes.md).

Key outputs:
1. **In-Field Identification Keys**:
   - *Boletus edulis*: White cap margin line, spongy white->olive pores (no blue staining), club stem with fine *white* netting, unchanging solid white flesh.
   - *Cantharellus cibarius*: Uniform egg-yolk yellow, blunt decurrent *false gills* (folds/veins), apricot scent, solid white interior.
2. **Toxic & Inedible Lookalike Warnings**:
   - ❌ *Rubroboletus satanas* (Devil's Bolete - toxic): Blood-red pores, instant dark blue bruising. Rule: Never pick red-pored boletes.
   - ❌ *Tylopilus felleus* (Bitter Bolete - inedible): Dirty pink pores, coarse *black/brown* stem netting.
   - ❌ *Omphalotus olearius* (Jack-o'-Lantern - toxic): True sharp gills, grows directly in tufts on wood/stumps.
3. **Emergency Poison Control Integration**:
   - Direct emergency hotline numbers for Germany (GIZ-Nord Göttingen `+49 551 19240`) and France (CAPTV Grand Ouest `+33 2 41 48 21 21`, SAMU `15`, EU `112`) embedded into every exported waypoint `<desc>` tag.
4. **Offline GPX Compatibility**: Structured plain-text template rendered inside `<desc>` ensuring 100% offline readability on Garmin devices, Komoot, OsmAnd, and Gaia GPS.
