import { ForagingWaypoint } from '../types';

export class GpxService {
  /**
   * Generates a standard TopoGrafix GPX 1.1 XML file with embedded field safety guides
   */
  static generateGPX(waypoints: ForagingWaypoint[], routeName = 'Shroom_Room_Foraging_Route'): string {
    const timestamp = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<gpx version="1.1" creator="Shroom Room - https://github.com/shroom-room"\n`;
    xml += `     xmlns="http://www.topografix.com/GPX/1/1"\n`;
    xml += `     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
    xml += `     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">\n`;
    xml += `  <metadata>\n`;
    xml += `    <name>${this.escapeXml(routeName)}</name>\n`;
    xml += `    <desc>Offline Foraging Trail with Habitat Suitability, Weather Triggers, Field Identification Keys and Toxic Lookalike Safety Warnings.</desc>\n`;
    xml += `    <time>${timestamp}</time>\n`;
    xml += `  </metadata>\n`;

    // 1. Waypoints
    const speciesTitles: Record<string, string> = {
      boletus: 'Boletus edulis (King Bolete / Porcini)',
      cantharellus: 'Cantharellus cibarius (Golden Chanterelle)',
      hydnum: 'Hydnum repandum (Wood Hedgehog / Pied-de-mouton)',
      craterellus_cornucopioides: 'Craterellus cornucopioides (Black Trumpet / Trompette de la mort)',
      craterellus_tubaeformis: 'Craterellus tubaeformis (Trumpet Chanterelle / Yellowfoot)',
      imleria_badia: 'Imleria badia (Bay Bolete / Maronen-Röhrling)',
      laetiporus_sulphureus: 'Laetiporus sulphureus (Chicken of the Woods / Polypore soufré)',
      macrolepiota_procera: 'Macrolepiota procera (Parasol Mushroom / Coulemelle)',
      suillus_luteus: 'Suillus luteus / grevillei (Slippery Jack & Larch Bolete)'
    };

    waypoints.forEach((wpt, index) => {
      const speciesTitle = speciesTitles[wpt.speciesId] || wpt.speciesId;
      const descText = this.buildFieldGuideText(wpt, speciesTitle);

      xml += `  <wpt lat="${wpt.lat.toFixed(6)}" lon="${wpt.lon.toFixed(6)}">\n`;
      if (wpt.elevationMeters !== undefined) {
        xml += `    <ele>${wpt.elevationMeters.toFixed(1)}</ele>\n`;
      }
      xml += `    <name>${this.escapeXml(wpt.name || `Hotspot ${index + 1}`)}</name>\n`;
      xml += `    <cmt>Suitability: ${wpt.suitabilityScore}% | Prob: ${wpt.probabilityScore}% | pH: ${wpt.soilPH}</cmt>\n`;
      xml += `    <desc>${this.escapeXml(descText)}</desc>\n`;
      xml += `    <sym>Mushroom</sym>\n`;
      xml += `    <type>Foraging Target</type>\n`;
      xml += `  </wpt>\n`;
    });

    // 2. Track Route connecting waypoints
    if (waypoints.length > 1) {
      xml += `  <trk>\n`;
      xml += `    <name>${this.escapeXml(routeName)} Trail</name>\n`;
      xml += `    <trkseg>\n`;
      waypoints.forEach((wpt) => {
        xml += `      <trkpt lat="${wpt.lat.toFixed(6)}" lon="${wpt.lon.toFixed(6)}">\n`;
        if (wpt.elevationMeters !== undefined) {
          xml += `        <ele>${wpt.elevationMeters.toFixed(1)}</ele>\n`;
        }
        xml += `        <time>${timestamp}</time>\n`;
        xml += `      </trkpt>\n`;
      });
      xml += `    </trkseg>\n`;
      xml += `  </trk>\n`;
    }

    xml += `</gpx>`;
    return xml;
  }

  private static buildFieldGuideText(wpt: ForagingWaypoint, speciesTitle: string): string {
    let text = `==================================================\n`;
    text += `🍄 SHROOM ROOM FIELD GUIDE: ${speciesTitle}\n`;
    text += `==================================================\n`;
    text += `📍 SITE TELEMETRY:\n`;
    text += `- Habitat Suitability: ${wpt.suitabilityScore}% (Soil & Trees)\n`;
    text += `- Weather Trigger Index: ${wpt.weatherScore}% (14d Rainfall & Soil Temp)\n`;
    text += `- Overall Fruiting Probability: ${wpt.probabilityScore}%\n`;
    text += `- Soil pH: ${wpt.soilPH.toFixed(1)} | Host Trees: ${wpt.dominantTree}\n`;
    text += `- 14-Day Rain Sum: ${wpt.rain14DaysMm}mm | Soil Temp: ${wpt.currentSoilTempC}°C\n\n`;

    if (wpt.speciesId === 'boletus') {
      text += `🔍 DIAGNOSTIC IDENTIFICATION (Porcini / King Bolete):\n`;
      text += `1. Cap: Greasy/smooth brown with distinct thin WHITE edge margin line.\n`;
      text += `2. Pores: Spongy tubes (NO GILLS). White when young -> creamy yellow -> olive-green. DOES NOT STAIN BLUE.\n`;
      text += `3. Stem: Bulbous club with fine WHITE RAISED NETTING (reticulation) on upper half.\n`;
      text += `4. Flesh: Thick, solid, unchanging white when sliced. Pleasant nutty aroma.\n\n`;

      text += `⚠️ CRITICAL TOXIC LOOKALIKE WARNINGS:\n`;
      text += `- ❌ Rubroboletus satanas (Devil's Bolete): Pale gray cap, BLOOD-RED PORES, bruises DARK BLUE. SEVERE TOXIC!\n`;
      text += `- ❌ Tylopilus felleus (Bitter Bolete): PINKISH pores, coarse DARK BROWN/BLACK stem netting. EXTREMELY BITTER.\n`;
      text += `- RULE OF THUMB: Never harvest boletes with red/orange pores or blue-staining flesh!\n\n`;
    } else if (wpt.speciesId === 'cantharellus') {
      text += `🔍 DIAGNOSTIC IDENTIFICATION (Golden Chanterelle / Girolle):\n`;
      text += `1. Color: Uniform egg-yolk golden yellow to apricot throughout.\n`;
      text += `2. Underside: FALSE GILLS (thick, blunt ridges/folds) running down stem. Cannot be peeled off.\n`;
      text += `3. Cap: Irregular, wavy, funnel-shaped when mature.\n`;
      text += `4. Flesh: Solid white interior, distinct sweet APRICOT scent, peppery raw taste.\n\n`;

      text += `⚠️ CRITICAL TOXIC LOOKALIKE WARNINGS:\n`;
      text += `- ❌ Omphalotus olearius (Jack-o'-Lantern): Grows in dense tufts DIRECTLY ON WOOD/STUMPS, sharp true gills. TOXIC!\n`;
      text += `- ❌ Hygrophoropsis aurantiaca (False Chanterelle): Flimsy orange cap, thin crowded true gills, hollow dark stem.\n\n`;
    } else if (wpt.speciesId === 'hydnum') {
      text += `🔍 DIAGNOSTIC IDENTIFICATION (Wood Hedgehog / Pied-de-mouton):\n`;
      text += `1. Underside: Soft downward-pointing SPINES (TEETH). NO GILLS, NO PORES. Detach easily when rubbed.\n`;
      text += `2. Cap: Creamy-buff, pale ochre to salmon-beige, dry, irregular wavy edge.\n`;
      text += `3. Stem: Stout, off-center, solid, whitish to pale cream.\n`;
      text += `4. Flesh: Firm, brittle, white to cream. Pleasant nutty aroma with mildly peppery finish.\n\n`;

      text += `⚠️ CRITICAL SAFETY NOTICE (ZERO TOXIC LOOKALIKES):\n`;
      text += `- ✅ Safe Gold Standard: There are NO poisonous toothed mushrooms in Europe.\n`;
      text += `- Similar edible: Hydnum rufescens (Terracotta Hedgehog) - smaller, orange-red cap, equally edible.\n`;
      text += `- Inedible note: Sarcodon / Hydnellum species have dark brown/black tough or bitter flesh; not toxic, but unpalatable.\n\n`;
    } else if (wpt.speciesId === 'craterellus_cornucopioides') {
      text += `🔍 DIAGNOSTIC IDENTIFICATION (Black Trumpet / Trompette de la mort):\n`;
      text += `1. Shape: Hollow funnel or trumpet/horn expanding outwards; hollow straight through to the base.\n`;
      text += `2. Color: Soot-black when damp, drying to ash-grey/dark brown.\n`;
      text += `3. Fertile Surface: Outer surface is nearly smooth to gently wrinkled (NO GILLS, NO PORES).\n`;
      text += `4. Flesh: Thin, elastic, dark grey/black. Intense fragrance reminiscent of black truffles.\n\n`;

      text += `⚠️ CRITICAL SAFETY NOTICE (ZERO TOXIC LOOKALIKES):\n`;
      text += `- ✅ Safe Gold Standard: Impossible to confuse with any poisonous species in Europe.\n`;
      text += `- Similar edible: Craterellus cinereus and Pseudocraterellus undulatus are also prized edibles.\n\n`;
    } else if (wpt.speciesId === 'craterellus_tubaeformis') {
      text += `🔍 DIAGNOSTIC IDENTIFICATION (Trumpet Chanterelle / Yellowfoot):\n`;
      text += `1. Underside: Blunt, forking, decurrent FALSE GILLS (ribs/veins), grey-yellowish to brownish.\n`;
      text += `2. Stem: Slender, bright golden-yellow to orange-ochre, completely HOLLOW.\n`;
      text += `3. Cap: Funnel-shaped with a distinct central depression/hole piercing into the hollow stem.\n`;
      text += `4. Season: Prolific in late autumn through frosty winter (Oct - Jan).\n\n`;

      text += `⚠️ CRITICAL SAFETY WARNINGS:\n`;
      text += `- ✅ No dangerous lookalikes. False chanterelles have thin knife-sharp blade gills and solid dark stems.\n\n`;
    } else if (wpt.speciesId === 'imleria_badia') {
      text += `🔍 DIAGNOSTIC IDENTIFICATION (Bay Bolete / Maronen-Röhrling):\n`;
      text += `1. Pores: Pale yellow to olive-yellow tubes, bruising INSTANT DEEP BLUE/CYAN when touched.\n`;
      text += `2. Cap: Rich chestnut to bay brown, velvety dry becoming slightly tacky in wet weather.\n`;
      text += `3. Stem: Solid cylindrical, fibrillose brown WITHOUT raised netting (no white mesh, no dark mesh).\n`;
      text += `4. Flesh: White to yellowish, slowly turning pale blue directly above the tube layer.\n\n`;

      text += `⚠️ CRITICAL TOXIC LOOKALIKE WARNINGS:\n`;
      text += `- ❌ Rubroboletus satanas (Devil's Bolete): Pale grey cap with BLOOD-RED pores. TOXIC!\n`;
      text += `- ❌ Tylopilus felleus (Bitter Bolete): Dirty pink pores and prominent coarse black/brown netting. EXTREMELY BITTER.\n`;
      text += `- Rule: Blue-staining pores with smooth brown stipe under conifers = safe Bay Bolete.\n\n`;
    } else if (wpt.speciesId === 'laetiporus_sulphureus') {
      text += `🔍 DIAGNOSTIC IDENTIFICATION (Chicken of the Woods / Polypore soufré):\n`;
      text += `1. Appearance: Striking neon sulfur-yellow and bright peach-orange overlapping bracket shelves.\n`;
      text += `2. Underside: Minute sulfur-yellow pores (NO GILLS).\n`;
      text += `3. Substrate: Grows directly on living trunks, stumps, or dead wood of hardwoods (esp. Oak).\n`;
      text += `4. Texture: Thick, succulent, cheese-like flesh when young; shreds like cooked poultry.\n\n`;

      text += `⚠️ CRITICAL SAFETY GUIDANCE:\n`;
      text += `- ✅ Unmistakable. No toxic bracket fungus in Europe displays this vivid sulphur-yellow/orange coloration.\n`;
      text += `- Caution: Must be cooked thoroughly. Avoid specimens growing on toxic Yew (Taxus).\n\n`;
    } else if (wpt.speciesId === 'macrolepiota_procera') {
      text += `🔍 DIAGNOSTIC IDENTIFICATION (Parasol Mushroom / Coulemelle):\n`;
      text += `1. Size: Giant cap (15 to 30 cm across when open), dome-shaped expanding to flat umbrella.\n`;
      text += `2. Stem: Very tall (up to 40 cm), fibrous, with distinct zig-zag snakeskin bands (tigré).\n`;
      text += `3. Ring: Thick, double-edged, felt-like ring that SLIDES FREELY up and down the stem like a ring on a finger.\n`;
      text += `4. Gills: Cream-white, crowded, completely free from the stem.\n\n`;

      text += `⚠️ CRITICAL SAFETY RULES (AVOID POISONOUS LEPIOTAS):\n`;
      text += `- ❌ RULE 1: NEVER pick parasol mushrooms with caps smaller than 10 cm across.\n`;
      text += `- ❌ RULE 2: NEVER pick specimens whose ring is glued/fixed to the stipe (must slide freely!).\n`;
      text += `- Avoids: Deadly small Lepiota species (Lepiota brunneoincarnata, Lepiota cristata).\n\n`;
    } else if (wpt.speciesId === 'suillus_luteus') {
      text += `🔍 DIAGNOSTIC IDENTIFICATION (Slippery Jack & Larch Bolete):\n`;
      text += `1. Cap: Very slimy/sticky chocolate-brown cap with peelable gelatinous cuticle.\n`;
      text += `2. Pores: Bright yellow to olive-yellow tubes with white milky droplets when young.\n`;
      text += `3. Stem: Covered by a distinct whitish/purplish membranous ring on the upper half.\n`;
      text += `4. Symbionts: Strictly obligate to 2-needle Pines (Pinus) or Larch (Larix for S. grevillei).\n\n`;

      text += `⚠️ FORAGING & PREPARATION ADVICE:\n`;
      text += `- ✅ No toxic lookalikes in European pine forests.\n`;
      text += `- Culinary note: Always peel and discard the slimy cap skin before cooking to prevent digestive upset.\n\n`;
    }

    text += `🚑 EMERGENCY POISON CONTROL HOTLINES:\n`;
    text += `- Germany (GIZ-Nord Göttingen): +49 551 19240 | Berlin: +49 30 19240\n`;
    text += `- France (CAPTV Grand Ouest Rennes/Angers): +33 2 41 48 21 21 | SAMU: 15\n`;
    text += `- European Emergency Number: 112\n`;
    text += `- Keep raw specimen in paper bag; never consume unverified wild fungi.\n`;
    text += `==================================================`;
    return text;
  }

  private static escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Triggers client-side download of the generated GPX file
   */
  static downloadGPX(waypoints: ForagingWaypoint[], filename = 'shroom_foraging_route.gpx'): void {
    if (waypoints.length === 0) {
      alert('Please place at least one waypoint on the map before exporting.');
      return;
    }

    const gpxData = this.generateGPX(waypoints, filename.replace('.gpx', ''));
    const blob = new Blob([gpxData], { type: 'application/gpx+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
