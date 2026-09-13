export type SupportedLocale = 'fr' | 'en' | 'de' | 'ja';

export interface SpeciesNameEntry {
  latin: string;
  common: Record<SupportedLocale, string>;
  short: Record<SupportedLocale, string>;
}

export interface AnatomyLabels {
  chapeau: string;
  ecailles: string;
  verrues: string;
  dessous_du_chapeau: string;
  aiguillons: string;
  lamelles: string;
  tubes: string;
  pores: string;
  anneau: string;
  anneau_descendant: string;
  anneau_ascendant: string;
  pied: string;
  bulbe: string;
  volve: string;
  filaments_de_mycelium: string;
}

export interface TranslationSchema {
  anatomy: AnatomyLabels;
  ui: {
    appName: string;
    tagline: string;
    species: string;
    basemap: string;
    simulationDate: string;
    fieldGuide: string;
    weather: string;
    waypoints: string;
    anatomyBtn: string;
    dedicatedPageBtn: string;
    backToMap: string;
    anatomyTitle: string;
    anatomySubtitle: string;
    anatomyNotice: string;
    locate: string;
    pinSpot: string;
    layers: string;
    trail: string;
    visualSynthesis: string;
    suitabilityMap: string;
    suitabilityDesc: string;
    weatherTrigger: string;
    weatherDesc: string;
    suitabilityOpacity: string;
    weatherOpacity: string;
    routePlannerTitle: string;
    clear: string;
    estimatedRoute: string;
    avgSuitability: string;
    avgFruitingProb: string;
    noWaypoints: string;
    noWaypointsHint: string;
    exportGpx: string;
    safetyNotice: string;
    selectSpeciesTitle: string;
    selectSpeciesSubtitle: string;
    peakSeason: string;
    inSeason: string;
    offSeason: string;
    dedicatedPageTitle: string;
    dedicatedPageNotice: string;
    firstLaunchTitle: string;
    firstLaunchBody1: string;
    firstLaunchBody2: string;
    firstLaunchBody3: string;
    firstLaunchAcknowledge: string;
    safetyAlertHeader: string;
    safetyAlertText: string;
    diagnosticChecklistTitle: string;
    diagnosticChecklistHint: string;
    lookalikesTitle: string;
    lookalikesSubtitle: string;
    crucialDifferences: string;
    offlineBanner: string;
    sporePrintLabel: string;
    learnAnatomyLink: string;
    mobileBasemapsTitle: string;
  };
}
