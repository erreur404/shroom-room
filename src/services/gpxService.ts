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
    waypoints.forEach((wpt, index) => {
      const isBoletus = wpt.speciesId === 'boletus';
      const speciesTitle = isBoletus 
        ? 'Boletus edulis (King Bolete / Porcini)' 
        : 'Cantharellus cibarius (Golden Chanterelle)';

      const descText = this.buildFieldGuideText(wpt, speciesTitle, isBoletus);

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

  private static buildFieldGuideText(wpt: ForagingWaypoint, speciesTitle: string, isBoletus: boolean): string {
    let text = `==================================================\n`;
    text += `🍄 SHROOM ROOM FIELD GUIDE: ${speciesTitle}\n`;
    text += `==================================================\n`;
    text += `📍 SITE TELEMETRY:\n`;
    text += `- Habitat Suitability: ${wpt.suitabilityScore}% (Soil & Trees)\n`;
    text += `- Weather Trigger Index: ${wpt.weatherScore}% (14d Rainfall & Soil Temp)\n`;
    text += `- Overall Fruiting Probability: ${wpt.probabilityScore}%\n`;
    text += `- Soil pH: ${wpt.soilPH.toFixed(1)} | Host Trees: ${wpt.dominantTree}\n`;
    text += `- 14-Day Rain Sum: ${wpt.rain14DaysMm}mm | Soil Temp: ${wpt.currentSoilTempC}°C\n\n`;

    if (isBoletus) {
      text += `🔍 DIAGNOSTIC IDENTIFICATION (Porcini / King Bolete):\n`;
      text += `1. Cap: Greasy/smooth brown with distinct thin WHITE edge margin line.\n`;
      text += `2. Pores: Spongy tubes (NO GILLS). White when young -> creamy yellow -> olive-green. DOES NOT STAIN BLUE.\n`;
      text += `3. Stem: Bulbous club with fine WHITE RAISED NETTING (reticulation) on upper half.\n`;
      text += `4. Flesh: Thick, solid, unchanging white when sliced. Pleasant nutty aroma.\n\n`;

      text += `⚠️ CRITICAL TOXIC LOOKALIKE WARNINGS:\n`;
      text += `- ❌ Rubroboletus satanas (Devil's Bolete): Pale gray cap, BLOOD-RED PORES, bruises DARK BLUE. SEVERE TOXIC!\n`;
      text += `- ❌ Tylopilus felleus (Bitter Bolete): PINKISH pores, coarse DARK BROWN/BLACK stem netting. EXTREMELY BITTER.\n`;
      text += `- RULE OF THUMB: Never harvest boletes with red/orange pores or blue-staining flesh!\n\n`;
    } else {
      text += `🔍 DIAGNOSTIC IDENTIFICATION (Golden Chanterelle / Girolle):\n`;
      text += `1. Color: Uniform egg-yolk golden yellow to apricot throughout.\n`;
      text += `2. Underside: FALSE GILLS (thick, blunt ridges/folds) running down stem. Cannot be peeled off.\n`;
      text += `3. Cap: Irregular, wavy, funnel-shaped when mature.\n`;
      text += `4. Flesh: Solid white interior, distinct sweet APRICOT scent, peppery raw taste.\n\n`;

      text += `⚠️ CRITICAL TOXIC LOOKALIKE WARNINGS:\n`;
      text += `- ❌ Omphalotus olearius (Jack-o'-Lantern): Grows in dense tufts DIRECTLY ON WOOD/STUMPS, sharp true gills. TOXIC!\n`;
      text += `- ❌ Hygrophoropsis aurantiaca (False Chanterelle): Flimsy orange cap, thin crowded true gills, hollow dark stem.\n\n`;
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
