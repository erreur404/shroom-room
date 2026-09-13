import { ForagingWaypoint } from '../types';
import { SupportedLocale } from '../i18n/types';
import { currentLocale } from '../i18n';
import { FieldGuideService } from './fieldGuideService';

export class GpxService {
  /**
   * Generates a standard TopoGrafix GPX 1.1 XML file with embedded field safety guides
   * localized into the user's active language (FR, EN, DE, JA).
   */
  static generateGPX(
    waypoints: ForagingWaypoint[],
    routeName = 'Shroom_Room_Foraging_Route',
    locale: SupportedLocale = currentLocale.value
  ): string {
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
      // Generate field guide via common service and convert/clean HTML tags for GPX format
      const descText = FieldGuideService.generateGpxDescription(wpt, locale);

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

  /**
   * Helper to build field guide text, delegating to the unified FieldGuideService.
   */
  static buildFieldGuideText(wpt: ForagingWaypoint, locale: SupportedLocale = currentLocale.value): string {
    return FieldGuideService.generateGpxDescription(wpt, locale);
  }

  private static escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Triggers client-side download of the generated GPX file
   */
  static downloadGPX(
    waypoints: ForagingWaypoint[],
    filename = 'shroom_foraging_route.gpx',
    locale: SupportedLocale = currentLocale.value
  ): void {
    if (waypoints.length === 0) {
      alert('Please place at least one waypoint on the map before exporting.');
      return;
    }

    const gpxData = this.generateGPX(waypoints, filename.replace('.gpx', ''), locale);
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
