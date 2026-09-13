import { SupportedLocale, TranslationSchema, SpeciesNameEntry } from './types';
import { SpeciesId } from '../types';

export const SPECIES_I18N: Record<SpeciesId, SpeciesNameEntry> = {
  boletus: {
    latin: 'Boletus edulis',
    common: {
      fr: 'Cèpe de Bordeaux',
      en: 'King Bolete',
      de: 'Steinpilz',
      ja: 'ヤマドリタケ (ポルチーニ)'
    },
    short: {
      fr: 'Cèpe',
      en: 'Porcini',
      de: 'Steinpilz',
      ja: 'ヤマドリタケ'
    }
  },
  cantharellus: {
    latin: 'Cantharellus cibarius',
    common: {
      fr: 'Girolle',
      en: 'Golden Chanterelle',
      de: 'Pfifferling',
      ja: 'アンズタケ (ジロール)'
    },
    short: {
      fr: 'Girolle',
      en: 'Chanterelle',
      de: 'Pfifferling',
      ja: 'アンズタケ'
    }
  },
  hydnum: {
    latin: 'Hydnum repandum',
    common: {
      fr: 'Pied-de-mouton',
      en: 'Wood Hedgehog',
      de: 'Semmel-Stoppelpilz',
      ja: 'カノシタ (シロカノシタ)'
    },
    short: {
      fr: 'Pied-de-mouton',
      en: 'Hedgehog',
      de: 'Stoppelpilz',
      ja: 'カノシタ'
    }
  },
  craterellus_cornucopioides: {
    latin: 'Craterellus cornucopioides',
    common: {
      fr: 'Trompette de la mort',
      en: 'Black Trumpet',
      de: 'Totentrompete',
      ja: 'クロラッパタケ (死のトランペット)'
    },
    short: {
      fr: 'Trompette',
      en: 'Black Trumpet',
      de: 'Totentrompete',
      ja: 'クロラッパタケ'
    }
  },
  craterellus_tubaeformis: {
    latin: 'Craterellus tubaeformis',
    common: {
      fr: 'Chanterelle en tube',
      en: 'Trumpet Chanterelle',
      de: 'Trompetenpfifferling',
      ja: 'キアシアンズタケ'
    },
    short: {
      fr: 'Chanterelle tube',
      en: 'Yellowfoot',
      de: 'Trompetenpfiff.',
      ja: 'キアシアンズタケ'
    }
  },
  imleria_badia: {
    latin: 'Imleria badia',
    common: {
      fr: 'Bolet bai',
      en: 'Bay Bolete',
      de: 'Maronen-Röhrling',
      ja: 'ニセイロガワリ (ベイボリート)'
    },
    short: {
      fr: 'Bolet bai',
      en: 'Bay Bolete',
      de: 'Marone',
      ja: 'ニセイロガワリ'
    }
  },
  laetiporus_sulphureus: {
    latin: 'Laetiporus sulphureus',
    common: {
      fr: 'Polypore soufré',
      en: 'Chicken of the Woods',
      de: 'Gemeiner Schwefelporling',
      ja: 'マスタケ (森のチキン)'
    },
    short: {
      fr: 'Polypore soufré',
      en: 'Chicken Woods',
      de: 'Schwefelporling',
      ja: 'マスタケ'
    }
  },
  macrolepiota_procera: {
    latin: 'Macrolepiota procera',
    common: {
      fr: 'Coulemelle',
      en: 'Parasol Mushroom',
      de: 'Parasol',
      ja: 'カラカサタケ'
    },
    short: {
      fr: 'Coulemelle',
      en: 'Parasol',
      de: 'Parasol',
      ja: 'カラカサタケ'
    }
  },
  suillus_luteus: {
    latin: 'Suillus luteus',
    common: {
      fr: 'Nonnette voilée',
      en: 'Slippery Jack',
      de: 'Butterpilz',
      ja: 'ヌメリイグチ (バターピルツ)'
    },
    short: {
      fr: 'Nonnette voilée',
      en: 'Slippery Jack',
      de: 'Butterpilz',
      ja: 'ヌメリイグチ'
    }
  }
};

export const TRANSLATIONS: Record<SupportedLocale, TranslationSchema> = {
  fr: {
    anatomy: {
      chapeau: 'Chapeau',
      ecailles: 'Écailles',
      verrues: 'Verrues',
      dessous_du_chapeau: 'Dessous du chapeau',
      aiguillons: 'Aiguillons',
      lamelles: 'Lamelles',
      tubes: 'Tubes',
      pores: 'Pores',
      anneau: 'Anneau',
      anneau_descendant: 'Anneau descendant',
      anneau_ascendant: 'Anneau ascendant',
      pied: 'Pied',
      bulbe: 'Bulbe',
      volve: 'Volve',
      filaments_de_mycelium: 'Filaments de mycélium'
    },
    ui: {
      appName: 'SHROOM ROOM',
      tagline: "Moteur de prédiction d'habitat et de fructification",
      species: 'Espèce',
      basemap: 'Fond de carte',
      simulationDate: 'Date de simulation',
      fieldGuide: 'Guide de terrain',
      weather: 'Météo',
      waypoints: 'Points de route',
      anatomyBtn: '🔬 Anatomie du champignon',
      dedicatedPageBtn: "📖 Fiche détaillée de l'espèce",
      backToMap: '← Retour à la carte',
      anatomyTitle: 'Anatomie du champignon',
      anatomySubtitle: "Repères morphologiques essentiels pour l'identification sur le terrain",
      anatomyNotice: 'Schéma anatomique avec étiquettes positionnées traduites dynamiquement.',
      locate: 'Localiser',
      pinSpot: 'Épingler',
      layers: 'Couches',
      trail: 'Parcours',
      visualSynthesis: 'Synthèse visuelle des couches',
      suitabilityMap: "Carte d'habitabilité (Rouge)",
      suitabilityDesc: 'pH du sol statique, essences hôtes, relief',
      weatherTrigger: 'Déclencheur météo (Bleu)',
      weatherDesc: 'Précipitations cumulées sur 14j & température du sol',
      suitabilityOpacity: "Opacité habitabilité",
      weatherOpacity: 'Opacité météo',
      routePlannerTitle: '📍 Planificateur de parcours',
      clear: 'Effacer',
      estimatedRoute: 'Distance estimée',
      avgSuitability: 'Habitabilité moy.',
      avgFruitingProb: 'Prob. fructification',
      noWaypoints: 'Aucun point d’étape placé.',
      noWaypointsHint: 'Cliquez sur la carte pour tracer votre itinéraire de cueillette avant de partir en forêt.',
      exportGpx: '📥 Exporter en GPX (Garmin / OsmAnd / Komoot)',
      safetyNotice: "⚠️ L'export intègre une check-list d'identification et les numéros d'urgence anti-poison.",
      selectSpeciesTitle: 'Sélectionner une espèce',
      selectSpeciesSubtitle: 'Classées par proximité de la pleine saison',
      peakSeason: 'Pleine saison',
      inSeason: 'En saison',
      offSeason: 'Hors saison',
      dedicatedPageTitle: 'Page dédiée à l’espèce',
      dedicatedPageNotice: 'Cette page dédiée sera fournie prochainement. L’infrastructure de navigation est opérationnelle !'
    }
  },
  en: {
    anatomy: {
      chapeau: 'Cap',
      ecailles: 'Scales',
      verrues: 'Warts',
      dessous_du_chapeau: 'Underside of cap',
      aiguillons: 'Spines',
      lamelles: 'Gills',
      tubes: 'Tubes',
      pores: 'Pores',
      anneau: 'Ring',
      anneau_descendant: 'Descending ring',
      anneau_ascendant: 'Ascending ring',
      pied: 'Stem',
      bulbe: 'Bulb',
      volve: 'Volva',
      filaments_de_mycelium: 'Mycelium filaments'
    },
    ui: {
      appName: 'SHROOM ROOM',
      tagline: 'Habitat & Fruiting Prediction Engine',
      species: 'Species',
      basemap: 'Basemap',
      simulationDate: 'Simulation Date',
      fieldGuide: 'Field Guide',
      weather: 'Weather',
      waypoints: 'Waypoints',
      anatomyBtn: '🔬 Mushroom Anatomy',
      dedicatedPageBtn: '📖 Dedicated Species Page',
      backToMap: '← Back to Map',
      anatomyTitle: 'Mushroom Anatomy',
      anatomySubtitle: 'Essential morphological features for field identification',
      anatomyNotice: 'Anatomical diagram with dynamically translated positioned labels.',
      locate: 'Locate',
      pinSpot: 'Pin Spot',
      layers: 'Layers',
      trail: 'Trail',
      visualSynthesis: 'Visual Layer Synthesis',
      suitabilityMap: 'Suitability Map (Red)',
      suitabilityDesc: 'Static soil pH, host trees, elevation',
      weatherTrigger: 'Weather Trigger (Blue)',
      weatherDesc: '14-day rainfall pulse & soil temp',
      suitabilityOpacity: 'Suitability Opacity',
      weatherOpacity: 'Weather Opacity',
      routePlannerTitle: '📍 Foraging Trail Planner',
      clear: 'Clear',
      estimatedRoute: 'Estimated Route',
      avgSuitability: 'Avg Suitability',
      avgFruitingProb: 'Avg Fruiting Prob',
      noWaypoints: 'No waypoints placed yet.',
      noWaypointsHint: 'Click on the map or select hotspots to build your foraging trail before heading into the forest.',
      exportGpx: '📥 Export Route as GPX (Garmin / OsmAnd / Komoot)',
      safetyNotice: '⚠️ Export embeds offline field identification checklists & poison control contacts.',
      selectSpeciesTitle: 'Select Mushroom Species',
      selectSpeciesSubtitle: 'Sorted by closest proximity to peak season',
      peakSeason: 'Peak Season',
      inSeason: 'In Season',
      offSeason: 'Off Season',
      dedicatedPageTitle: 'Dedicated Species Page',
      dedicatedPageNotice: 'This dedicated species page will be provided soon. The pages infrastructure is ready!'
    }
  },
  de: {
    anatomy: {
      chapeau: 'Hut',
      ecailles: 'Schuppen',
      verrues: 'Warzen',
      dessous_du_chapeau: 'Hutunterseite',
      aiguillons: 'Stacheln',
      lamelles: 'Lamellen',
      tubes: 'Röhren',
      pores: 'Poren',
      anneau: 'Ring',
      anneau_descendant: 'Hängender Ring',
      anneau_ascendant: 'Aufsteigender Ring',
      pied: 'Stiel',
      bulbe: 'Knolle',
      volve: 'Scheide (Volva)',
      filaments_de_mycelium: 'Myzelfäden'
    },
    ui: {
      appName: 'SHROOM ROOM',
      tagline: 'Habitat- & Fruchtungs-Vorhersage-Engine',
      species: 'Art',
      basemap: 'Basiskarte',
      simulationDate: 'Simulationsdatum',
      fieldGuide: 'Feldführer',
      weather: 'Wetter',
      waypoints: 'Wegpunkte',
      anatomyBtn: '🔬 Pilzanatomie',
      dedicatedPageBtn: '📖 Detaillierte Artseite',
      backToMap: '← Zurück zur Karte',
      anatomyTitle: 'Pilzanatomie',
      anatomySubtitle: 'Wesentliche morphologische Merkmale zur Feldbestimmung',
      anatomyNotice: 'Anatomisches Diagramm mit dynamisch übersetzten positionierten Bezeichnungen.',
      locate: 'Standort',
      pinSpot: 'Punkt setzen',
      layers: 'Ebenen',
      trail: 'Route',
      visualSynthesis: 'Visuelle Ebenen-Synthese',
      suitabilityMap: 'Eignungskarte (Rot)',
      suitabilityDesc: 'Statischer Boden-pH, Wirtsbäume, Höhe',
      weatherTrigger: 'Wetterauslöser (Blau)',
      weatherDesc: '14-Tage-Niederschlagspuls & Bodentemperatur',
      suitabilityOpacity: 'Eignungstransparenz',
      weatherOpacity: 'Wettertransparenz',
      routePlannerTitle: '📍 Pilzrouten-Planer',
      clear: 'Löschen',
      estimatedRoute: 'Geschätzte Route',
      avgSuitability: 'Durchschn. Eignung',
      avgFruitingProb: 'Fruchtungswahrsch.',
      noWaypoints: 'Noch keine Wegpunkte gesetzt.',
      noWaypointsHint: 'Klicken Sie auf die Karte, um Ihre Sammelroute vor dem Aufbruch in den Wald zu planen.',
      exportGpx: '📥 Route als GPX exportieren (Garmin / OsmAnd / Komoot)',
      safetyNotice: '⚠️ Der Export enthält Offline-Identifikationschecklisten und Giftnotruf-Kontakte.',
      selectSpeciesTitle: 'Pilzart auswählen',
      selectSpeciesSubtitle: 'Sortiert nach Nähe zur Hauptsaison',
      peakSeason: 'Hauptsaison',
      inSeason: 'In Saison',
      offSeason: 'Außerhalb Saison',
      dedicatedPageTitle: 'Spezielle Artseite',
      dedicatedPageNotice: 'Diese spezielle Artseite wird in Kürze bereitgestellt. Die Seiten-Infrastruktur steht bereit!'
    }
  },
  ja: {
    anatomy: {
      chapeau: '傘 (カサ)',
      ecailles: '鱗片 (りんぺん)',
      verrues: 'いぼ',
      dessous_du_chapeau: '傘の裏面 (子実層托)',
      aiguillons: '針 / 棘 (はり)',
      lamelles: 'ひだ (菌褶)',
      tubes: '管孔 (くだあな)',
      pores: '孔口 (こうこう)',
      anneau: 'つば (内被膜)',
      anneau_descendant: '垂下つば',
      anneau_ascendant: '上生つば',
      pied: '柄 (え)',
      bulbe: '根球 (こんきゅう)',
      volve: 'つぼ (外被膜)',
      filaments_de_mycelium: '菌糸束 / 菌糸体'
    },
    ui: {
      appName: 'SHROOM ROOM',
      tagline: 'キノコ生息適地・発生予測エンジン',
      species: 'キノコの種類',
      basemap: '背景地図',
      simulationDate: 'シミュレーション日',
      fieldGuide: 'フィールド図鑑',
      weather: '気象データ',
      waypoints: 'ウェイポイント',
      anatomyBtn: '🔬 キノコの解剖図',
      dedicatedPageBtn: '📖 種別詳細ページ',
      backToMap: '← 地図に戻る',
      anatomyTitle: 'キノコの解剖図',
      anatomySubtitle: '野外同定に必要な重要部位の解剖図',
      anatomyNotice: '多言語対応のラベルが配置されたキノコの解剖ダイアグラムです。',
      locate: '現在地',
      pinSpot: '地点登録',
      layers: 'レイヤー',
      trail: '探索ルート',
      visualSynthesis: '視覚レイヤー合成',
      suitabilityMap: '環境適合度マップ (赤)',
      suitabilityDesc: '土壌pH、共生樹種、地形による定着適地',
      weatherTrigger: '気象発生トリガー (青)',
      weatherDesc: '過去14日間の積算降水量・地温ショック',
      suitabilityOpacity: '適合度の不透明度',
      weatherOpacity: '気象の不透明度',
      routePlannerTitle: '📍 キノコ採集ルートプランナー',
      clear: '消去',
      estimatedRoute: '推定総距離',
      avgSuitability: '平均適合度',
      avgFruitingProb: '平均発生確率',
      noWaypoints: 'ウェイポイントが登録されていません。',
      noWaypointsHint: '地図をクリックして探索ルートを作成し、GPXファイルをダウンロードできます。',
      exportGpx: '📥 GPXエクスポート (Garmin / OsmAnd / Komoot)',
      safetyNotice: '⚠️ GPXにはオフライン同定ガイドと緊急毒物相談窓口が埋め込まれます。',
      selectSpeciesTitle: 'キノコを選択',
      selectSpeciesSubtitle: '最盛期に近い順にソートされています',
      peakSeason: '最盛期',
      inSeason: '発生中',
      offSeason: 'シーズン外',
      dedicatedPageTitle: '種別専用ページ',
      dedicatedPageNotice: 'この専用ページは準備中です。画面遷移基盤は動作しています！'
    }
  }
};

