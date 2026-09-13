import { SpeciesId } from '../types';
import { SupportedLocale } from '../i18n/types';

export type EdibilityRating = 'choice' | 'edible' | 'caution' | 'inedible' | 'toxic' | 'deadly';

export type LocalizedString = Record<SupportedLocale, string> | string;
export type LocalizedStringList = Record<SupportedLocale, string[]> | string[];

export interface Lookalike {
  name: LocalizedString;
  latinName: string;
  edibility: EdibilityRating;
  dangerLevel: 'low' | 'moderate' | 'high' | 'deadly';
  crucialDifferences: LocalizedStringList;
  description: LocalizedString;
}

export interface DiagnosticCriterion {
  id: string;
  category: 'chapeau' | 'dessous' | 'pied' | 'chair' | 'spore';
  label: LocalizedString;
  anatomyTarget?: string; // Links to anatomy term (e.g. 'pores', 'lamelles', 'anneau')
  description: LocalizedString;
}

export interface SpeciesIdentificationGuide {
  speciesId: SpeciesId;
  edibility: EdibilityRating;
  edibilityLabel: LocalizedString;
  safetySummary: LocalizedString;
  sporePrintColor: LocalizedString;
  diagnosticChecklist: DiagnosticCriterion[];
  lookalikes: Lookalike[];
}

export function getLocalizedText(
  field: LocalizedString | undefined,
  locale: SupportedLocale = 'fr'
): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[locale] || field.fr || field.en || '';
}

export function getLocalizedList(
  field: LocalizedStringList | undefined,
  locale: SupportedLocale = 'fr'
): string[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  return field[locale] || field.fr || field.en || [];
}

export const SPECIES_IDENTIFICATION_DATA: Record<SpeciesId, SpeciesIdentificationGuide> = {
  boletus: {
    speciesId: 'boletus',
    edibility: 'choice',
    edibilityLabel: {
      fr: 'Excellent comestible',
      en: 'Choice Edible',
      de: 'Hervorragender Speisepilz',
      ja: '極上食菌'
    },
    safetySummary: {
      fr: 'Champignon à pores très facile à identifier. Inspectez le dessous (tubes, jamais de lamelles) et le pied orné d’un fin réseau blanc. Attention au Bolet de fiel très amer et au Bolet satan à pores rouges.',
      en: 'Easily identifiable pore-bearing mushroom. Check underside for tubes/pores (never gills) and inspect stipe for fine white net (reticulation). Beware of bitter Tylopilus and red-pored Rubroboletus.',
      de: 'Leicht identifizierbarer Röhrling mit Röhren (keine Lamellen) und feinem weißem Stielnetz. Vorsicht vor dem bitteren Gallenröhrling und dem rotporigen Satansröhrling.',
      ja: '管孔（網目状のスポンジ）を持つ識別しやすいキノコ。ヒダはなく、柄の上部に繊細な白い網目模様がある。苦いニガイグチや赤色管孔のサタンイグチに注意。'
    },
    sporePrintColor: {
      fr: 'Brun olive',
      en: 'Olive-brown',
      de: 'Olivbraun',
      ja: 'オリーブ褐色'
    },
    diagnosticChecklist: [
      {
        id: 'boletus-cap',
        category: 'chapeau',
        label: {
          fr: 'Chapeau',
          en: 'Cap',
          de: 'Hut',
          ja: '傘'
        },
        anatomyTarget: 'chapeau',
        description: {
          fr: 'Hémisphérique à convexe, 8–25 cm. Brun noisette à châtain chaud, cuticule légèrement grasse par temps humide, fine bordure blanche typique sur la marge.',
          en: 'Hemispherical to convex, 8–25 cm. Hazel to chestnut brown, slightly greasy in wet weather, with a narrow whitish edge when young.',
          de: 'Halbkugelig bis gewölbt, 8–25 cm. Haselnuss- bis kastanienbraun, feucht leicht klebrig, mit charakteristischem weißem Rand.',
          ja: '半球形から丸山形、8〜25cm。ヘーゼル褐色から濃い栗褐色。湿るとやや粘性があり、幼菌時は縁に白い縁取りがある。'
        }
      },
      {
        id: 'boletus-pores',
        category: 'dessous',
        label: {
          fr: 'Hyménium / Pores & Tubes',
          en: 'Hymenium / Pores & Tubes',
          de: 'Hymenium / Poren & Röhren',
          ja: '裏面 / 管孔・孔口'
        },
        anatomyTarget: 'pores',
        description: {
          fr: 'Sous le chapeau : tubes séparables à pores fins et ronds (AUCUNE LAMELLE). Blancs chez les jeunes, devenant jaune-verdâtre puis vert olive. Ne bleuit JAMAIS au froissement.',
          en: 'Underneath made of detachable tubes with fine round pores. White when young, becoming yellowish then greenish-olive with age. NEVER bruised blue when touched.',
          de: 'Schwammige Röhrenschicht mit feinen Poren (keine Lamellen). Jung weiß, später gelblich bis olivgrün. Bläut niemals auf Druck.',
          ja: '傘の裏面は容易に分離できる細孔の管孔（ヒダは無い）。幼菌時は純白で、成長すると黄色からオリーブ緑色になる。指で押しても決して青変しない。'
        }
      },
      {
        id: 'boletus-stem',
        category: 'pied',
        label: {
          fr: 'Pied / Stipe',
          en: 'Stipe / Stem',
          de: 'Stiel',
          ja: '柄'
        },
        anatomyTarget: 'pied',
        description: {
          fr: 'Robuste, ventru ou obèse en massue (bulbeux), blanchâtre à brun clair. Orné sur le haut d’un fin réseau de nervures BLANCHES en relief (réticulation).',
          en: 'Robust, bulbous or club-shaped (bulbe), whitish to light brownish. Covered with a delicate, fine WHITE raised mesh (reticulation) especially near the top.',
          de: 'Kräftig, bauchig-keulig, weißlich bis hellbräunlich. Im oberen Teil mit zartem, erhabenem weißem Netzmuster überzogen.',
          ja: '太く頑丈で徳利状または棍棒状。白色から淡褐色。特に柄の上部に繊細で浮き出た白い網目模様（レティキュレーション）がある。'
        }
      },
      {
        id: 'boletus-flesh',
        category: 'chair',
        label: {
          fr: 'Chair',
          en: 'Flesh',
          de: 'Fleisch',
          ja: '肉'
        },
        description: {
          fr: 'Ferme, épaisse, blanche et immuable (ne change pas de couleur et ne bleuit pas à la coupe). Odeur agréable de noisette fraîche, saveur douce.',
          en: 'Firm, solid white, does NOT change color or turn blue when cut. Pleasant nutty smell, mild sweet taste.',
          de: 'Fest, dick, weiß, unveränderlich beim Anschneiden (bläut nicht). Angenehm nussiger Geruch, milder Geschmack.',
          ja: '緻密で厚く、切断しても変色せず青変しない。上品で豊かなナッツの香りと、穏やかな甘みがある。'
        }
      },
      {
        id: 'boletus-spores',
        category: 'spore',
        label: {
          fr: 'Sporée',
          en: 'Spore Print',
          de: 'Sporenpulver',
          ja: '胞子紋'
        },
        description: {
          fr: 'Dépôt de spores brun-olive.',
          en: 'Olive-brown spore deposit.',
          de: 'Olivbrauner Sporenabdruck.',
          ja: 'オリーブ褐色の胞子堆積。'
        }
      }
    ],
    lookalikes: [
      {
        name: {
          fr: 'Bolet de fiel',
          en: 'Bitter Bolete',
          de: 'Gallenröhrling',
          ja: 'ニガイグチ'
        },
        latinName: 'Tylopilus felleus',
        edibility: 'inedible',
        dangerLevel: 'low',
        description: {
          fr: 'Saveur d’une amertume extrême qui gâte tout un plat. Non toxique mais totalement immangeable.',
          en: 'Extremely bitter taste that ruins any meal. Non-toxic but completely unpalatable.',
          de: 'Extrem bitterer Geschmack, der jedes Gericht verdirbt. Ungiftig, aber ungenießbar.',
          ja: '極めて苦く、ひとかけら混入しただけで料理全体が台無しになる。毒性はないが完全に食不適。'
        },
        crucialDifferences: {
          fr: [
            'Pied orné d’un gros réseau NOIR ou brun foncé en relief, alors que B. edulis a un fin réseau BLANC.',
            'Pores rosâtres ou rose sale à maturité (ceux du Cèpe virent au vert olive).',
            'Saveur amère intense (goûter un minuscule fragment sur le bout de la langue puis recracher).'
          ],
          en: [
            'Stem has a coarse, prominent DARK brown or black net (reticulation), whereas B. edulis has a fine WHITE net.',
            'Pores turn dirty pinkish-flesh colored at maturity, whereas B. edulis pores turn greenish-olive.',
            'Intense bitter taste (nibble a tiny piece and spit out).'
          ],
          de: [
            'Stiel mit grobem, dunklem (braun-schwarzem) erhabenem Netz, während B. edulis ein feines weißes Netz hat.',
            'Poren färben sich im Alter schmutzig rosafarben (beim Steinpilz olivgrün).',
            'Extrem bitterer Geschmack (kleinste Geschmacksprobe genügt).'
          ],
          ja: [
            '柄に粗く浮き出た黒褐色〜濃褐色の網目があり、ヤマドリタケの繊細な白い網目と対照的。',
            '成熟した管孔が汚れた淡紅色（肉色）を帯びる（ヤマドリタケはオリーブ緑色）。',
            '舌先に触れるだけで強烈な苦味がある（少量をかじってすぐ吐き出す）。'
          ]
        }
      },
      {
        name: {
          fr: 'Bolet satan',
          en: "Devil's Bolete",
          de: 'Satansröhrling',
          ja: 'サタンイグチ'
        },
        latinName: 'Rubroboletus satanas',
        edibility: 'toxic',
        dangerLevel: 'high',
        description: {
          fr: 'Provoque de violentes intoxications gastro-intestinales. Préfère les bois de feuillus calcaires chauds.',
          en: 'Causes severe gastrointestinal poisoning. Prefers warm calcareous broadleaf woods.',
          de: 'Verursacht schwere Magen-Darm-Vergiftungen. Bevorzugt warme Laubwälder auf Kalkböden.',
          ja: '激しい胃腸系中毒を引き起こす毒菌。温暖な石灰岩質の広葉樹林を好む。'
        },
        crucialDifferences: {
          fr: [
            'Chapeau blanc crayeux à gris argenté pâle, jamais brun châtain.',
            'Pores et tubes ROUGE carmin vif à orangé, bleuissant immédiatement au froissement.',
            'Chair bleuissant faiblement à la coupe, dégageant une odeur nauséabonde et cadavérique avec l’âge.'
          ],
          en: [
            'Cap is chalky whitish-gray to pale silvery, never rich chestnut brown.',
            'Pores and tubes are vivid blood RED to orange-red, bruising blue immediately.',
            'Flesh turns pale blue upon cutting and has a foul, nauseating smell at maturity.'
          ],
          de: [
            'Hut kreideweiß bis silbergrau, niemals warm kastanienbraun.',
            'Poren und Röhren blutrot bis orangerot, bläuen sofort bei Berührung.',
            'Fleisch bläut schwach beim Anschneiden und riecht im Alter aasartig faulig.'
          ],
          ja: [
            '傘は白亜質のような淡灰色〜銀白色で、栗褐色にはならない。',
            '管孔と孔口は鮮やかな血赤色〜橙赤色で、触れると瞬時に青変する。',
            '切断すると肉が淡青色に変色し、成熟すると死臭・悪臭を放つ。'
          ]
        }
      }
    ]
  },

  cantharellus: {
    speciesId: 'cantharellus',
    edibility: 'choice',
    edibilityLabel: {
      fr: 'Excellent comestible',
      en: 'Choice Edible',
      de: 'Hervorragender Speisepilz',
      ja: '極上食菌'
    },
    safetySummary: {
      fr: 'Couleur jaune d’or uniforme avec des PLIS ÉPAIS décurrents (et non de vraies lamelles). Odeur fruitée caractéristique de mirabelle ou d’abricot. Ne pousse jamais en touffes directement sur le bois.',
      en: 'Unmistakable golden-yellow color with decurrent RIDGES/FOLDS (plis), NOT true blade-like gills. Apricot fruity aroma. Never grows in dense clumps directly on wood.',
      de: 'Unverkennbar dottergelb mit herablaufenden LEISTEN (keine echten Lamellen). Fruchtiges Aprikosenaroma. Wächst niemals büschelig auf Holz.',
      ja: '全体が鮮やかな卵黄色で、刃状のひだではなく柄に垂生する厚い「しわひだ（偽ひだ）」を持つ。アンズの芳香。木の上に直接群生することはない。'
    },
    sporePrintColor: {
      fr: 'Blanc crème à jaune pâle',
      en: 'Pale yellow to creamy white',
      de: 'Hellgelb bis cremeweiß',
      ja: '淡黄色〜クリーム白色'
    },
    diagnosticChecklist: [
      {
        id: 'canth-cap',
        category: 'chapeau',
        label: {
          fr: 'Chapeau',
          en: 'Cap',
          de: 'Hut',
          ja: '傘'
        },
        anatomyTarget: 'chapeau',
        description: {
          fr: 'Convexe puis en entonnoir évasé aux bords ondulés et lobés. Teinte uniforme jaune d’œuf à jaune abricot.',
          en: 'Convex becoming funnel-shaped with wavy, lobed margins. Uniform egg-yellow to golden apricot color.',
          de: 'Gewölbt, bald trichterförmig vertieft mit wellig geschwungenem Rand. Einheitlich dotter- bis aprikosengelb.',
          ja: '丸山形からじょうご形になり、縁は波打つ。全体が均一な卵黄色〜アンズ色。'
        }
      },
      {
        id: 'canth-folds',
        category: 'dessous',
        label: {
          fr: 'Sous le chapeau / Plis (et non lamelles)',
          en: 'Underside / Folds (NOT Gills)',
          de: 'Hutunterseite / Leisten (keine Lamellen)',
          ja: '裏面 / しわひだ (偽ひだ)'
        },
        anatomyTarget: 'dessous_du_chapeau',
        description: {
          fr: 'Plis épais, mousses, fourchus et espacés (fausses lamelles) décurrents sur le pied. Ils font corps avec la chair et ne se détachent pas.',
          en: 'Thick, blunt, vein-like ridges or folds (plis) that fork repeatedly and run far down the stem. Cannot be separated cleanly from the cap flesh.',
          de: 'Dicke, stumpfe, gegabelte Adern/Leisten, die weit am Stiel herablaufen. Fest mit dem Hutfleisch verwachsen und nicht abwischbar.',
          ja: '太く丸みがあり、分岐しながら柄に長く垂生する「しわひだ」。傘の肉と完全に一体化しており、ひだのように剥離できない。'
        }
      },
      {
        id: 'canth-stem',
        category: 'pied',
        label: {
          fr: 'Pied / Stipe',
          en: 'Stipe / Stem',
          de: 'Stiel',
          ja: '柄'
        },
        anatomyTarget: 'pied',
        description: {
          fr: 'Plein, ferme, s’évasant vers le haut dans le chapeau, même teinte jaune. Aucun anneau, aucune volve.',
          en: 'Solid, continuous with the cap, tapering downward, same golden yellow color. No ring, no volva.',
          de: 'Voll, fest, nach unten verjüngt, von gleicher goldgelber Farbe. Kein Ring, keine Scheide.',
          ja: '肉が詰まっており硬く、傘に向かって広がる。同色の鮮黄色。つばもつぼも無い。'
        }
      },
      {
        id: 'canth-flesh',
        category: 'chair',
        label: {
          fr: 'Chair',
          en: 'Flesh',
          de: 'Fleisch',
          ja: '肉'
        },
        description: {
          fr: 'Ferme, blanche à crème au centre. Odeur fruitée remarquable d’abricot sec ou de mirabelle, saveur crue légèrement poivrée.',
          en: 'Dense, fibrous, whitish inside with yellowish tint under skin. Distinctive sweet, fruity fragrance reminiscent of dried apricots or mirabelles.',
          de: 'Fest, weißlich im Kern, gelblich unter der Huthaut. Unverkennbarer Duft nach reifen Aprikosen, mild bis pfeffrig.',
          ja: '緻密で内部は白色〜クリーム色。乾燥アンズやスモモを思わせるフルーティーな甘い芳香と、わずかにスパイシーな風味。'
        }
      },
      {
        id: 'canth-spores',
        category: 'spore',
        label: {
          fr: 'Sporée',
          en: 'Spore Print',
          de: 'Sporenpulver',
          ja: '胞子紋'
        },
        description: {
          fr: 'Dépôt blanc crème à jaune pâle.',
          en: 'Pale creamy-yellowish deposit.',
          de: 'Blassgelber bis cremeweißer Abrieb.',
          ja: '淡いクリーム黄色〜白色。'
        }
      }
    ],
    lookalikes: [
      {
        name: {
          fr: "Pleurote de l'olivier",
          en: "Jack-o'-Lantern",
          de: 'Ölbaumpilz',
          ja: 'ツキヨタケ近縁種'
        },
        latinName: 'Omphalotus olearius / illudens',
        edibility: 'toxic',
        dangerLevel: 'high',
        description: {
          fr: 'Très toxique, provoque de violents vomissements et douleurs abdominales. Bioluminescent dans l’obscurité.',
          en: 'Severely poisonous, causing intense vomiting and cramps. Bioluminescent in darkness.',
          de: 'Stark giftig, verursacht heftiges Erbrechen und schmerzhafte Krämpfe.',
          ja: '強い毒性を持ち、激しい嘔吐と腹痛を引き起こす。暗闇で発光性を持つ。'
        },
        crucialDifferences: {
          fr: [
            'Possède de VRAIES LAMELLES fines, serrées et tranchantes (contrairement aux plis mousses de la girolle).',
            'Pousse en touffes denses directement sur le bois (souches, racines de feuillus), alors que la girolle pousse au sol.',
            'Chair orange sombre de part en part, sans odeur d’abricot.'
          ],
          en: [
            'Has thin, sharp, crowded TRUE BLADE-LIKE GILLS, unlike the blunt, forked folds of Cantharellus.',
            'Grows in dense clusters directly on or at the base of hardwood trees or stumps, whereas Cantharellus grows on the forest floor soil.',
            'Flesh is dark orange throughout, lacks fruity apricot odor.'
          ],
          de: [
            'Besitzt echte, schneidende, blattartige Lamellen (keine stumpfen Leisten).',
            'Wächst büschelig direkt an Holz, Stümpfen oder Wurzeln (Pfifferlinge wachsen stets am Boden).',
            'Fleisch durchgehend orangerot ohne Aprikosenduft.'
          ],
          ja: [
            'アンズタケの丸いしわとは異なり、薄く鋭利な「真正ひだ」を持つ。',
            '広葉樹の切り株や幹の根元に大きな株となって密生する（アンズタケは土から生える）。',
            '肉は内部まで濃い橙色で、アンズの香気はない。'
          ]
        }
      },
      {
        name: {
          fr: 'Fausse girolle',
          en: 'False Chanterelle',
          de: 'Falscher Pfifferling',
          ja: 'ニセアンズタケ'
        },
        latinName: 'Hygrophoropsis aurantiaca',
        edibility: 'inedible',
        dangerLevel: 'low',
        description: {
          fr: 'Sans valeur gastronomique, texture molle et cotonneuse. Peut causer des troubles chez les personnes sensibles.',
          en: 'Can cause mild digestive upset in sensitive people. Poor taste and soft texture.',
          de: 'Ungenießbar und von geringem Wert; weiches, wattiges Fleisch.',
          ja: '食用価値なし。軟弱な綿状の肉で、消化器系に不快感を与えることがある。'
        },
        crucialDifferences: {
          fr: [
            'Possède de vraies lamelles serrées, minces, très fourchues et orange vif.',
            'Chapeau feutré à centre plus sombre; pied mince et brunissant à la base.',
            'Chair molle, flasque, inodore et insipide.'
          ],
          en: [
            'Possesses true crowded, thin gills that branch dichotomously, colored vibrant orange.',
            'Cap is darker orange with brownish center and soft, cottony texture.',
            'Stem is often thin, dark brownish-orange at the base; flesh is soft, flimsy, and odorless.'
          ],
          de: [
            'Echte, dichtstehende, dünne Lamellen von leuchtend oranger Farbe.',
            'Hut filzig mit braunem Zentrum; Stiel dünn und an der Basis bräunlich verfärbend.',
            'Fleisch weich, biegsam, ohne fruchtigen Duft.'
          ],
          ja: [
            '鮮やかな橙色の薄く密な真正ひだが二叉分岐する。',
            '傘はフェルト状で中央がやや褐色。柄は細く基部が黒ずむ。',
            '肉は軟弱でペラペラしており、果実香はない。'
          ]
        }
      }
    ]
  },

  hydnum: {
    speciesId: 'hydnum',
    edibility: 'choice',
    edibilityLabel: {
      fr: 'Excellent comestible',
      en: 'Choice Edible',
      de: 'Hervorragender Speisepilz',
      ja: '極上食菌'
    },
    safetySummary: {
      fr: 'L’un des champignons les plus sûrs au monde ! Le dessous du chapeau est couvert de petits AIGUILLONS fragiles (dents molles) et non de lamelles ou de tubes. Aucun sosie toxique à aiguillons au sol.',
      en: 'One of the safest mushrooms in the world! The underside has fragile, brittle downward-pointing TEETH or SPINES (aiguillons) instead of gills or pores. No toxic lookalikes with spines on soil.',
      de: 'Einer der sichersten Speisepilze weltweit! Die Hutunterseite ist dicht mit herabhängenden zarten STACHELN besetzt (keine Lamellen, keine Röhren). Keine giftigen Doppelgänger am Waldboden.',
      ja: '最も安全なキノコの一つ！傘の裏面にはヒダも管孔もなく、下向きの柔らかい「針（とげ）」が密集する。地面から生える針状キノコに有毒種は存在しない。'
    },
    sporePrintColor: {
      fr: 'Blanc pur à crème pâle',
      en: 'White to pale cream',
      de: 'Weiß bis hellcreme',
      ja: '純白〜淡クリーム色'
    },
    diagnosticChecklist: [
      {
        id: 'hydnum-cap',
        category: 'chapeau',
        label: {
          fr: 'Chapeau',
          en: 'Cap',
          de: 'Hut',
          ja: '傘'
        },
        anatomyTarget: 'chapeau',
        description: {
          fr: 'Irrégulier, bosselé, chamois à beige ocré ou saumoné pâle. Cuticule sèche, mate, marge sinueuse.',
          en: 'Irregular, lobed, cream-beige to pale biscuit-buff color. Dry, matt, often fused with neighboring specimens in fairy rings.',
          de: 'Unregelmäßig gelappt, semmelfarben, ocker- bis blass cremefarben. Trocken, samtig matt.',
          ja: '不規則に波打ち窪む。クリームベージュ〜淡いサーモン淡褐色。乾いており光沢はない。'
        }
      },
      {
        id: 'hydnum-spines',
        category: 'dessous',
        label: {
          fr: 'Sous le chapeau / Aiguillons',
          en: 'Underside / Spines (Teeth)',
          de: 'Unterseite / Stacheln',
          ja: '裏面 / 針状突起 (トゲ)'
        },
        anatomyTarget: 'aiguillons',
        description: {
          fr: 'Tapissé de petits aiguillons cylindriques et fragiles de 2 à 6 mm. Ils se détachent facilement sous le pouce (ni lamelles, ni pores).',
          en: 'Covered with crowded, brittle, downward-pointing teeth/spines 2–6 mm long, pale buff colored. Spines easily rub off with your thumb.',
          de: 'Dicht mit zarten, herabhängenden 2–6 mm langen Stacheln besetzt, die sich mit dem Daumen leicht abstreifen lassen.',
          ja: '2〜6mmの柔らかく脆い針状突起（トゲ）が密集して垂れ下がる。親指でなぞるとポロポロと容易に剥がれ落ちる。'
        }
      },
      {
        id: 'hydnum-stem',
        category: 'pied',
        label: {
          fr: 'Pied / Stipe',
          en: 'Stipe / Stem',
          de: 'Stiel',
          ja: '柄'
        },
        anatomyTarget: 'pied',
        description: {
          fr: 'Trapu, épais, solide, souvent excentré, cassant comme de la craie, blanc à crème roussissant légèrement.',
          en: 'Stout, off-center, solid, same pale cream color as cap, staining faintly orange-yellow when handled.',
          de: 'Dick, stämmig, oft asymmetrisch, bricht kreidig, weißlich bis blasscreme.',
          ja: '太く頑丈、柄が中心からずれることが多く、チョークのようにポキッと折れやすい。'
        }
      },
      {
        id: 'hydnum-flesh',
        category: 'chair',
        label: {
          fr: 'Chair',
          en: 'Flesh',
          de: 'Fleisch',
          ja: '肉'
        },
        description: {
          fr: 'Ferme, cassante, blanc craie. Odeur agréable de sous-bois, saveur douce puis légèrement amère ou poivrée chez les vieux sujets (gratter les aiguillons pour l’éliminer).',
          en: 'Firm, brittle, chalk-white. Mild mushroomy taste (slightly peppery/bitter in old specimens; scrape off old spines to remove bitterness).',
          de: 'Fest, brüchig, kreideweiß. Angenehmer Waldduft, bei alten Exemplaren leicht bitter (Stacheln abschaben).',
          ja: '硬く脆く純白。心地よいキノコ臭。古くなるとわずかに苦味・辛味が出るため、調理前に針をそぎ落とすとよい。'
        }
      },
      {
        id: 'hydnum-spores',
        category: 'spore',
        label: {
          fr: 'Sporée',
          en: 'Spore Print',
          de: 'Sporenpulver',
          ja: '胞子紋'
        },
        description: {
          fr: 'Blanc pur à crème pâle.',
          en: 'Pure white to pale cream.',
          de: 'Reinweiß bis blasscreme.',
          ja: '純白色〜淡クリーム色。'
        }
      }
    ],
    lookalikes: [
      {
        name: {
          fr: 'Pied-de-mouton roussissant',
          en: 'Terracotta Hedgehog',
          de: 'Rötlicher Stoppelpilz',
          ja: 'カノシタ近縁種'
        },
        latinName: 'Hydnum rufescens',
        edibility: 'edible',
        dangerLevel: 'low',
        description: {
          fr: 'Tout aussi comestible et savoureux; silhouette plus grêle et teinte rousse orangée.',
          en: 'Also fully edible and delicious; slightly smaller and more intensely orange-reddish.',
          de: 'Ebenfalls essbar und schmackhaft; zierlicher und rötlich-orange.',
          ja: '完全可食で美味。全体にやや小型で、橙赤色が強い。'
        },
        crucialDifferences: {
          fr: [
            'Chapeau roux orangé plus vif et chair plus mince.',
            'Aiguillons moins décurrents sur le pied.',
            'Aucun danger : tous les champignons à aiguillons poussant au sol en Europe sont comestibles.'
          ],
          en: [
            'Cap is distinctly terracotta-orange and thinner.',
            'Spines do not run as far down the stem.',
            'Shares the same safety profile: edible with no toxic spine-bearing ground lookalikes.'
          ],
          de: [
            'Hut kräftiger orangerot und dünnfleischiger.',
            'Stacheln laufen weniger am Stiel herab.',
            'Völlig ungefährlich: Am Boden wachsende Stachelpilze in Mitteleuropa sind ungiftig.'
          ],
          ja: [
            '傘がテラコッタ橙色で肉が薄い。',
            '針状突起の柄への垂生が少ない。',
            '安全上のリスクはなく、同じく美味な食用菌。'
          ]
        }
      }
    ]
  },

  craterellus_cornucopioides: {
    speciesId: 'craterellus_cornucopioides',
    edibility: 'choice',
    edibilityLabel: {
      fr: 'Excellent comestible',
      en: 'Choice Edible',
      de: 'Hervorragender Speisepilz',
      ja: '極上食菌'
    },
    safetySummary: {
      fr: 'Trompette de la mort. Forme inimitable de trompette ou de corne d’abondance entièrement creuse, gris ardoise à noir suie. Aucun sosie toxique.',
      en: 'Horn of Plenty / Black Trumpet. Distinctive deep horn or trumpet shape, hollow to the base, slate-gray to soot-black. Safe choice with zero toxic lookalikes.',
      de: 'Totentrompete / Herbsttrompete. Trichter- bis posaunenartig tief hohl bis zur Basis, schiefergrau bis rußschwarz. Keinerlei giftige Doppelgänger.',
      ja: 'クロラッパタケ（死のトランペット）。根元まで完全に中空の黒いラッパ形。有毒な類似種は存在しない極めて安全な食菌。'
    },
    sporePrintColor: {
      fr: 'Blanc à crème ochracé',
      en: 'White to pale ochre',
      de: 'Weiß bis blassocker',
      ja: '白〜淡黄色'
    },
    diagnosticChecklist: [
      {
        id: 'crater-cap',
        category: 'chapeau',
        label: {
          fr: 'Chapeau / Trompette',
          en: 'Cap / Trumpet',
          de: 'Hut / Trichter',
          ja: '傘 / ラッパ部'
        },
        anatomyTarget: 'chapeau',
        description: {
          fr: 'En entonnoir ou corne profonde creuse jusqu’à la base. Marge étalée et ondulée. Noirâtre par temps humide, gris cendré par temps sec.',
          en: 'Funnel- or trumpet-shaped, deeply hollow down into the stem base. Edge flared and wavy. Dark brown-black when moist, ash-gray when dry.',
          de: 'Trompetenförmig, bis zum Stielgrund tief hohl. Rand geschwungen und wellig. Feucht rußschwarz, trocken aschgrau.',
          ja: '柄の基部まで深く中空のラッパ形・漏斗形。縁は外側に反り返り波打つ。湿時は黒褐色〜漆黒、乾くと灰白色。'
        }
      },
      {
        id: 'crater-underside',
        category: 'dessous',
        label: {
          fr: 'Hyménium / Surface externe',
          en: 'Hymenium / Outer Surface',
          de: 'Hymenium / Außenseite',
          ja: '裏面 / 子実層面'
        },
        anatomyTarget: 'dessous_du_chapeau',
        description: {
          fr: 'Face externe lisse ou légèrement ridée, gris cendré bleuté avec un poudroiement blanc à la sporulation. Ni lamelles, ni pores, ni aiguillons.',
          en: 'Outer surface is smooth or slightly wrinkled/veined, frosted ash-gray with a powdery bloom from spores. NO gills, NO pores, NO spines.',
          de: 'Außenseite glatt bis leicht runzelig-aderig, aschgrau bereift durch Sporenpulver. Keine Lamellen, keine Röhren, keine Stacheln.',
          ja: '外面はほぼ平滑またはかすかにしわがあり、成熟すると胞子の粉で白っぽく霜降り状になる。ヒダも管孔も針もない。'
        }
      },
      {
        id: 'crater-stem',
        category: 'pied',
        label: {
          fr: 'Pied / Stipe',
          en: 'Stipe / Stem',
          de: 'Stiel',
          ja: '柄'
        },
        anatomyTarget: 'pied',
        description: {
          fr: 'Prolongement direct et creux de l’entonnoir, formant un tube élastique noir grisâtre.',
          en: 'Continuous tubular hollow extension of the trumpet. Blackish-gray.',
          de: 'Direkte, röhrenförmig hohle Fortsetzung des Trichters, elastisch schwärzlich-grau.',
          ja: 'ラッパの漏斗部から連続する薄い中空の筒状。黒灰色。'
        }
      },
      {
        id: 'crater-flesh',
        category: 'chair',
        label: {
          fr: 'Chair',
          en: 'Flesh',
          de: 'Fleisch',
          ja: '肉'
        },
        description: {
          fr: 'Très mince, souple et élastique, noirâtre. Parfum boisé intense, fruité et aromatique incomparable.',
          en: 'Thin, elastic, blackish. Highly aromatic, fragrant, intense earthy and fruity perfume.',
          de: 'Sehr dünn, zäh-elastisch, schwärzlich. Herausragendes, intensiv würziges Pilzaroma.',
          ja: '非常に薄くしなやかで弾力がある。乾燥させると強烈な芳香と旨味を凝縮する。'
        }
      },
      {
        id: 'crater-spores',
        category: 'spore',
        label: {
          fr: 'Sporée',
          en: 'Spore Print',
          de: 'Sporenpulver',
          ja: '胞子紋'
        },
        description: {
          fr: 'Dépôt blanc à crème ochracé.',
          en: 'Whitish to pale salmon-buff.',
          de: 'Weißlich bis blass ockerfarben.',
          ja: '白色〜淡いサーモンクリーム色。'
        }
      }
    ],
    lookalikes: [
      {
        name: {
          fr: 'Chanterelle sinueuse',
          en: 'Sinuous Chanterelle',
          de: 'Krause Kraterelle',
          ja: 'クロッパタケ近縁種'
        },
        latinName: 'Pseudocraterellus undulatus',
        edibility: 'edible',
        dangerLevel: 'low',
        description: {
          fr: 'Cousine comestible à hyménium plus ridé et chapeau brunâtre.',
          en: 'Edible cousin with more pronounced wrinkled hymenium and brownish tones.',
          de: 'Essbare Verwandte mit deutlich faltig-runzeliger Außenseite und bräunlicher Färbung.',
          ja: '平滑ではなく明瞭なしわひだを持つ近縁の食用種。'
        },
        crucialDifferences: {
          fr: [
            'Hyménium orné de plis et rides plus prononcés.',
            'Teinte plus brune que noir suie.',
            'Comestible tout aussi recherché, aucun risque toxique.'
          ],
          en: [
            'Hymenium has more pronounced folds/veins.',
            'Color is brownish rather than jet-black.',
            'Also completely edible and safe.'
          ],
          de: [
            'Außenseite deutlicher faltig-geadert.',
            'Eher bräunlich als tiefschwarz.',
            'Gleichfalls schmackhafter Speisepilz.'
          ],
          ja: [
            '子実層面に明瞭なしわがある。',
            '黒色というより褐色〜黄褐色を帯びる。',
            '同様に完全可食。'
          ]
        }
      }
    ]
  },

  craterellus_tubaeformis: {
    speciesId: 'craterellus_tubaeformis',
    edibility: 'choice',
    edibilityLabel: {
      fr: 'Excellent comestible',
      en: 'Choice Edible',
      de: 'Hervorragender Speisepilz',
      ja: '極上食菌'
    },
    safetySummary: {
      fr: 'Chanterelle en tube. Chapeau brun perforé au centre, pied jaune d’or creux et vifs plis sous le chapeau. Pousse en tapis dans la mousse acide des conifères.',
      en: 'Trumpet chanterelle with a hollow brownish cap, distinct yellow-orange stem, and blunt, forked veins under the cap. Thrives in acidic mossy conifer woods.',
      de: 'Trompetenpfifferling mit hohlem bräunlichem Hut, leuchtend gelbem Stiel und gegabelten Leisten. Wächst massenhaft im sauren Nadelwaldmoos.',
      ja: 'キチャワンタケ / キヌメリガサ類と混同されやすいが、中空の黄色い柄と分岐するしわひだが特徴。酸性のコケに群生する。'
    },
    sporePrintColor: {
      fr: 'Blanc à crème jaunâtre',
      en: 'White to pale yellow',
      de: 'Weiß bis blassgelb',
      ja: '白色〜淡黄色'
    },
    diagnosticChecklist: [
      {
        id: 'tuba-cap',
        category: 'chapeau',
        label: {
          fr: 'Chapeau',
          en: 'Cap',
          de: 'Hut',
          ja: '傘'
        },
        anatomyTarget: 'chapeau',
        description: {
          fr: 'En entonnoir percé au centre communiquant avec le pied creux. Brun jaunâtre à bistre fuligineux, marge ondulée.',
          en: 'Funnel-shaped with a central hole piercing into the hollow stem. Brownish-gray to yellowish-umber, wavy margin.',
          de: 'Trichterförmig mit zentralem Loch zum hohlen Stiel. Bräunlich bis umbragelb, welliger Rand.',
          ja: '中央が窪み、柄の空洞へと貫通するじょうご形。暗褐色〜黄褐色で縁が波打つ。'
        }
      },
      {
        id: 'tuba-folds',
        category: 'dessous',
        label: {
          fr: 'Sous le chapeau / Plis',
          en: 'Underside / Folds',
          de: 'Hutunterseite / Leisten',
          ja: '裏面 / しわひだ'
        },
        anatomyTarget: 'dessous_du_chapeau',
        description: {
          fr: 'Plis fourchus, épais, bien espacés, jaunâtres à gris lilas, décurrents sur le pied.',
          en: 'Blunt, widely spaced, repeatedly forked ridges/veins. Gray-yellow to lilac-gray, running down the stem.',
          de: 'Gegabelte, weitstehende, dicke Adern/Leisten. Graugelb bis lila-grau, am Stiel herablaufend.',
          ja: '鈍く太く二叉分岐するしわひだ。灰黄色〜ライラック灰色で柄に垂生する。'
        }
      },
      {
        id: 'tuba-stem',
        category: 'pied',
        label: {
          fr: 'Pied / Stipe',
          en: 'Stipe / Stem',
          de: 'Stiel',
          ja: '柄'
        },
        anatomyTarget: 'pied',
        description: {
          fr: 'Fin, élancé, creux, comprimé ou sillonné, d’un beau jaune d’or à jaune orangé contrastant avec le chapeau.',
          en: 'Slender, distinctly hollow, compressed or grooved, striking golden-yellow to dull orange.',
          de: 'Schlank, hohl, oft seitlich zusammengedrückt, auffällig leuchtend goldgelb bis gelborange.',
          ja: '細長く中空、扁平で溝があり、鮮やかな黄金色〜橙黄色が暗色の傘と鮮やかに対照をなす。'
        }
      },
      {
        id: 'tuba-flesh',
        category: 'chair',
        label: {
          fr: 'Chair',
          en: 'Flesh',
          de: 'Fleisch',
          ja: '肉'
        },
        description: {
          fr: 'Mince, jaunâtre, élastique. Odeur agréable fruitée et de terre humide.',
          en: 'Thin, yellowish-gray, pleasant mild fruity-earthy odor.',
          de: 'Dünn, gelblich, mild fruchtig mit erdiger Note.',
          ja: '薄く弾力があり、穏やかな果実香と土の芳香。'
        }
      },
      {
        id: 'tuba-spores',
        category: 'spore',
        label: {
          fr: 'Sporée',
          en: 'Spore Print',
          de: 'Sporenpulver',
          ja: '胞子紋'
        },
        description: {
          fr: 'Blanc crème à jaune pâle.',
          en: 'Creamy white to pale yellow.',
          de: 'Cremeweiß bis hellgelb.',
          ja: 'クリーム白色〜淡黄色。'
        }
      }
    ],
    lookalikes: [
      {
        name: {
          fr: 'Chanterelle jaunissante',
          en: 'Yellowing Chanterelle',
          de: 'Starkriechender Trompetenpfifferling',
          ja: 'アンズタケモドキ'
        },
        latinName: 'Craterellus lutescens',
        edibility: 'choice',
        dangerLevel: 'low',
        description: {
          fr: 'Excellente espèce proche à dessous presque lisse et parfum d’abricot intense.',
          en: 'Closely related top-tier edible with almost smooth, orange-pink underside.',
          de: 'Hervorragender Speisepilz mit fast glatter, rosa-oranger Unterseite und starkem Aprikosenduft.',
          ja: '裏面がほぼ平滑で、より強いアンズの香りを持つ極上の食用菌。'
        },
        crucialDifferences: {
          fr: [
            'Face inférieure presque lisse ou très faiblement ridée, orangé saumoné.',
            'Pied jaune orangé très vif et parfum fruité encore plus intense.',
            'Également un comestible de tout premier choix.'
          ],
          en: [
            'Underside is practically veinless (smooth or slightly wrinkled).',
            'Intense apricot odor and bright orange-yellow stem.',
            'Equally safe and prized for eating.'
          ],
          de: [
            'Unterseite fast glatt ohne ausgeprägte Leisten.',
            'Stiel leuchtend gelborange mit intensivstem Aprikosenduft.',
            'Genauso sicher und köstlich.'
          ],
          ja: [
            '傘の裏面に明瞭なしわがほとんどなく平滑。',
            '柄の黄色がより鮮やかで、芳香が強い。',
            '同様に極上の食菌。'
          ]
        }
      }
    ]
  },

  imleria_badia: {
    speciesId: 'imleria_badia',
    edibility: 'choice',
    edibilityLabel: {
      fr: 'Excellent comestible',
      en: 'Choice Edible',
      de: 'Hervorragender Speisepilz',
      ja: '極上食菌'
    },
    safetySummary: {
      fr: 'Bolet bai. Chapeau brun châtain à pores jaune pâle qui BLEUISSENT instantanément au toucher ! Pied sans réseau. Doit toujours être bien cuit (contient des substances thermolabiles).',
      en: 'Bay Bolete. Chestnut-brown cap with yellow pores that instantly bruise ink-BLUE or greenish-blue when pressed. Must be cooked thoroughly (contains thermolabile compounds).',
      de: 'Maronen-Röhrling. Kastanienbrauner Hut mit gelblichen Poren, die auf Druck sofort intensiv TINTENBLAU verfärben! Kein Stielnetz. Stets gut durchgaren.',
      ja: 'ニセアシベニイグチ / アワタケ類。傘は栗褐色で、黄色の管孔は指で押すと瞬時に青黒く変色する。生食厳禁、十分加熱すること。'
    },
    sporePrintColor: {
      fr: 'Brun olive',
      en: 'Olive-brown',
      de: 'Olivbraun',
      ja: 'オリーブ褐色'
    },
    diagnosticChecklist: [
      {
        id: 'badia-cap',
        category: 'chapeau',
        label: {
          fr: 'Chapeau',
          en: 'Cap',
          de: 'Hut',
          ja: '傘'
        },
        anatomyTarget: 'chapeau',
        description: {
          fr: 'Convexe à aplati, 5–15 cm. Brun bai à châtain sombre, velouté par temps sec, gras et visqueux par temps humide.',
          en: 'Convex to flat, 5–15 cm. Chestnut bay-brown, velvety when dry, slimy/viscid when damp.',
          de: 'Gewölbt bis flach, 5–15 cm. Maronen- bis kastanienbraun, trocken samtig, feucht schmierig.',
          ja: '丸山形から平ら、5〜15cm。栗褐色〜濃褐色。乾いている時はビロード状、湿ると強い粘性がある。'
        }
      },
      {
        id: 'badia-pores',
        category: 'dessous',
        label: {
          fr: 'Pores & Tubes (Bleuissants)',
          en: 'Pores & Tubes (Staining Blue)',
          de: 'Poren & Röhren (Bläuend)',
          ja: '管孔・孔口 (青変性)'
        },
        anatomyTarget: 'pores',
        description: {
          fr: 'Jaune pâle puis verdâtre à maturité. BLEUIT instantanément au bleu d’encre ou bleu-vert sous la pression du doigt !',
          en: 'Creamy yellow at first, turning greenish-yellow. Instantly turns ink-blue/blue-green when pressed with a finger!',
          de: 'Blassgelb, im Alter olivgelb. Verfärbt auf Fingerdruck sofort intensiv blaugrün!',
          ja: '初め淡黄色で後に黄緑色。指で触れたり圧迫すると瞬時に濃いインクブルー（青緑色）に変色する！'
        }
      },
      {
        id: 'badia-stem',
        category: 'pied',
        label: {
          fr: 'Pied / Stipe (Sans réseau)',
          en: 'Stipe / Stem (No Netting)',
          de: 'Stiel (Ohne Netz)',
          ja: '柄 (網目なし)'
        },
        anatomyTarget: 'pied',
        description: {
          fr: 'Cylindrique, orné de fibrilles longitudinales brunâtres, SANS réseau en relief (différence capitale avec le Cèpe de Bordeaux).',
          en: 'Cylindrical, longitudinal brown fibers/streaks, NO raised mesh/reticulation (unlike Boletus edulis).',
          de: 'Zylindrisch, längsfaserig bräunlich gestreift, OHNE erhabenes Netzmuster (wichtigster Unterschied zum Steinpilz).',
          ja: '円柱形、褐色の縦筋があり、ヤマドリタケのような浮き出た白い網目模様は一切ない。'
        }
      },
      {
        id: 'badia-flesh',
        category: 'chair',
        label: {
          fr: 'Chair',
          en: 'Flesh',
          de: 'Fleisch',
          ja: '肉'
        },
        description: {
          fr: 'Blanchâtre à crème, bleuissant légèrement à la coupe au-dessus des tubes et au sommet du stipe. Saveur douce et agréable.',
          en: 'Whitish-yellow, staining faintly blue near tubes and stipe top when cut. Mild pleasant taste.',
          de: 'Weißlich-gelblich, bläut im Schnitt leicht über den Röhren und an der Stielspitze. Angenehm milder Geschmack.',
          ja: '肉は淡黄色〜白色で、切断すると管孔の上部や柄の先端付近がわずかに青変する。穏やかで上品な味。'
        }
      },
      {
        id: 'badia-spores',
        category: 'spore',
        label: {
          fr: 'Sporée',
          en: 'Spore Print',
          de: 'Sporenpulver',
          ja: '胞子紋'
        },
        description: {
          fr: 'Dépôt brun olive.',
          en: 'Olive-brown deposit.',
          de: 'Olivbrauner Abrieb.',
          ja: 'オリーブ褐色。'
        }
      }
    ],
    lookalikes: [
      {
        name: {
          fr: 'Bolet de fiel',
          en: 'Bitter Bolete',
          de: 'Gallenröhrling',
          ja: 'ニガイグチ'
        },
        latinName: 'Tylopilus felleus',
        edibility: 'inedible',
        dangerLevel: 'low',
        description: {
          fr: 'Sosie non toxique mais immangeable par son amertume.',
          en: 'Bitter non-toxic trap that ruins dishes.',
          de: 'Bitterer ungenießbarer Doppelgänger.',
          ja: '苦味が強烈で食べられない非毒性の類似種。'
        },
        crucialDifferences: {
          fr: [
            'Les pores de Tylopilus ne bleuissent JAMAIS au toucher.',
            'Pores virant au rose sale chez Tylopilus.',
            'Pied marqué d’un puissant réseau noir en relief.'
          ],
          en: [
            'Tylopilus pores NEVER bruise blue when pressed.',
            'Tylopilus pores turn dirty pink at maturity.',
            'Tylopilus stem has a prominent dark raised net.'
          ],
          de: [
            'Poren des Gallenröhrlings bläuen NIEMALS auf Druck.',
            'Poren verfärben sich im Alter schmutzig-rosa.',
            'Stiel mit dunklem, weitmaschigem Netz.'
          ],
          ja: [
            'ニガイグチの管孔は押しても決して青変しない。',
            '成熟すると管孔が汚れたピンク色になる。',
            '柄に明瞭な黒褐色の網目模様がある。'
          ]
        }
      }
    ]
  },

  laetiporus_sulphureus: {
    speciesId: 'laetiporus_sulphureus',
    edibility: 'caution',
    edibilityLabel: {
      fr: 'Comestible sous conditions',
      en: 'Edible with Caution',
      de: 'Bedingt essbar',
      ja: '条件付き可食'
    },
    safetySummary: {
      fr: 'Polypore soufré (Poulet des bois). Magnifiques consoles jaune soufre et orange vif poussant en étagères sur les troncs de feuillus. Ne consommer QUE jeune et tendre, et TOUJOURS bien cuit. Ne jamais récolter sur if (Taxus) !',
      en: 'Chicken of the Woods. Vibrant sulfur-yellow and orange bracket fungus growing on hardwoods. Must ONLY be harvested young and tender, and ALWAYS cooked thoroughly. Never eat from yew (Taxus) trees!',
      de: 'Schwefelporling. Leuchtend schwefelgelber bis oranger Porling an Laubbäumen. Nur jung und weich ernten und STETS gut durchgaren. Niemals von Eiben ernten!',
      ja: 'マスタケ。鮮やかな硫黄色〜橙色の扇状の傘が広葉樹の幹に段状に重なって発生する。若く柔らかい部分のみを採取し、必ず十分に加熱調理すること。有毒なイチイの木に生えたものは絶対採取禁止！'
    },
    sporePrintColor: {
      fr: 'Blanc pur',
      en: 'White',
      de: 'Weiß',
      ja: '白色'
    },
    diagnosticChecklist: [
      {
        id: 'laeti-bracket',
        category: 'chapeau',
        label: {
          fr: 'Chapeaux en consoles superposées',
          en: 'Brackets / Shelves',
          de: 'Konsolenartige Hüte',
          ja: '重なり合う傘 (棚状)'
        },
        anatomyTarget: 'chapeau',
        description: {
          fr: 'Grands éventails en consoles superposées de 10 à 40 cm. Jaune soufre éclatant à orange saumon vif avec bordure ondulée charnue jaune vif.',
          en: 'Large overlapping shelves 10–40 cm across. Bright sulfur-yellow to vivid salmon-orange with wavy, succulent yellow margins.',
          de: 'Fächerförmig dachziegelig übereinanderstehende Konsolen von 10–40 cm. Schwefelgelb bis lachs-orange mit saftigem Rand.',
          ja: '10〜40cmの扇形の傘が重なり合って棚状に生える。鮮烈な硫黄色〜サーモンオレンジ色で、肉厚な黄色の縁が波打つ。'
        }
      },
      {
        id: 'laeti-pores',
        category: 'dessous',
        label: {
          fr: 'Pores soufrés',
          en: 'Sulfur Pores',
          de: 'Schwefelgelbe Poren',
          ja: '硫黄色の管孔面'
        },
        anatomyTarget: 'pores',
        description: {
          fr: 'Minuscules pores jaune soufre sous chaque console, exsudant parfois des gouttelettes claires chez les jeunes sujets.',
          en: 'Tiny sulfur-yellow pores on the underside. Exudes clear yellow droplets when young and fresh.',
          de: 'Winzige schwefelgelbe Poren auf der Unterseite, die jung bisweilen klare Flüssigkeitstropfen ausscheiden.',
          ja: '傘の裏面には極小の硫黄色管孔が密生し、幼菌時は透明な黄色い水滴を分泌することがある。'
        }
      },
      {
        id: 'laeti-flesh',
        category: 'chair',
        label: {
          fr: 'Chair (Texture poulet)',
          en: 'Flesh (Chicken texture)',
          de: 'Fleisch (Hähnchen-Konsistenz)',
          ja: '肉 (鶏肉のような繊維質)'
        },
        description: {
          fr: 'Épaisse, juteuse et tendre chez les jeunes, s’effilochant exactement comme du blanc de poulet. Devient crayeuse et coriace en vieillissant.',
          en: 'Thick, succulent, watery when young, tearing like cooked chicken breast. Dries out to chalky, crumbly white when old.',
          de: 'Jung dick, saftig und weich, fasert wie gekochte Hühnerbrust. Im Alter kreidig-trocken und brüchig.',
          ja: '幼菌時は肉厚でジューシー、手で裂くと加熱した鶏胸肉そっくりの繊維状に裂ける。老菌はチョークのように脆く不食。'
        }
      },
      {
        id: 'laeti-habitat',
        category: 'pied',
        label: {
          fr: 'Arbre hôte / Substrat',
          en: 'Host Tree / Substrate',
          de: 'Wirtsbaum / Substrat',
          ja: '宿主樹木 / 生育環境'
        },
        description: {
          fr: 'Pousse en consoles directement sur le tronc ou les souches de feuillus (chênes, châtaigniers, fruitiers). NE JAMAIS récolter sur if (Taxus) ou robinier.',
          en: 'Strictly bracket-forming directly on tree trunks or stumps (oaks, chestnuts, fruit trees). Never harvest if growing on poisonous Yew (Taxus) or Robinia.',
          de: 'Wächst direkt an Stämmen oder Stümpfen von Laubbäumen (Eichen, Obstbäume). Niemals an giftigen Eiben (Taxus) oder Robinien sammeln.',
          ja: '広葉樹（ナラ、クリ、果樹など）の幹や切り株に直接棚状に着生する。毒性アルカロイドを吸収するため、イチイやハリエンジュの木からは絶対に採取しないこと。'
        }
      },
      {
        id: 'laeti-spores',
        category: 'spore',
        label: {
          fr: 'Sporée',
          en: 'Spore Print',
          de: 'Sporenpulver',
          ja: '胞子紋'
        },
        description: {
          fr: 'Dépôt blanc pur.',
          en: 'White spore deposit.',
          de: 'Weißer Sporenabdruck.',
          ja: '白色。'
        }
      }
    ],
    lookalikes: [
      {
        name: {
          fr: 'Climacodon du Nord',
          en: 'Northern Tooth Fungus',
          de: 'Nördlicher Schwammporling',
          ja: 'スジバシモフリタケ類'
        },
        latinName: 'Climacodon septentrionalis',
        edibility: 'inedible',
        dangerLevel: 'low',
        description: {
          fr: 'Consoles blanchâtres avec des aiguillons pendants au lieu de pores.',
          en: 'Whitish-yellow shelves on trees with spines underneath instead of pores.',
          de: 'Weißlich-gelbliche Konsolen mit hängenden Stacheln statt Poren.',
          ja: '樹幹に段状に生えるが、裏面は管孔ではなく無数の針状突起で覆われる。'
        },
        crucialDifferences: {
          fr: [
            'Face inférieure tapissée d’aiguillons pendants et non de petits pores soufrés.',
            'Couleur crème blanchâtre terne, jamais orange vif.',
            'Chair coriace et tenace.'
          ],
          en: [
            'Possesses hanging teeth/spines on underside, not tiny sulfur-yellow pores.',
            'Color is dingy cream-yellow, not brilliant flaming orange-yellow.',
            'Tough, fibrous, unpalatable.'
          ],
          de: [
            'Unterseite mit dichten Stacheln, nicht mit Poren besetzt.',
            'Färbung blass cremeweiß, niemals leuchtend orange-schwefelgelb.',
            'Zäh-faserig und ungenießbar.'
          ],
          ja: [
            '裏面が微小な管孔ではなく、垂れ下がる無数の針（棘）で覆われる。',
            '色はくすんだクリーム白色で、鮮烈な橙黄色にはならない。',
            '強靭で硬く食不適。'
          ]
        }
      }
    ]
  },

  macrolepiota_procera: {
    speciesId: 'macrolepiota_procera',
    edibility: 'choice',
    edibilityLabel: {
      fr: 'Excellent comestible',
      en: 'Choice Edible',
      de: 'Hervorragender Speisepilz',
      ja: '極上食菌'
    },
    safetySummary: {
      fr: 'Coulemelle / Lépiote élevée. GRANDE stature (>15 cm de haut, chapeau jusqu’à 30 cm). ANNEAU COULISSANT comme une bague et pied chiné en peau de serpent. NE JAMAIS cueillir de petites lépiotes (<10 cm) mortelles !',
      en: 'Large Parasol Mushroom. TALL stature (>15 cm tall, up to 30 cm cap). Must have a SLIDING double ring and a snakeskin-patterned stipe. NEVER harvest small parasols (<10 cm) which can be deadly Lepiota.',
      de: 'Parasol / Gemeiner Riesenschirmling. RIESIGE Statur (>15 cm hoch, bis 30 cm Hut). VERSCHIEBBARER Ring und genatterter Stiel. NIEMALS kleine Schirmlinge (<10 cm) sammeln, Lebensgefahr!',
      ja: 'カラカサタケ。大型（柄の高さ15cm以上、傘は最大30cm）。柄の上を指輪のように自由にスライドする「動くつば」と、蛇皮状のまだら模様の柄が決定打。小型（10cm未満）の猛毒キノコ（コレーターワライタケ・ドクキツネタケ等）は絶対に採取厳禁！'
    },
    sporePrintColor: {
      fr: 'Blanc pur à crème',
      en: 'White to creamy',
      de: 'Reinweiß bis creme',
      ja: '純白色〜淡クリーム色'
    },
    diagnosticChecklist: [
      {
        id: 'macro-cap',
        category: 'chapeau',
        label: {
          fr: 'Chapeau en ombrelle',
          en: 'Cap / Parasol',
          de: 'Schirmartiger Hut',
          ja: '傘 (パラソル状)'
        },
        anatomyTarget: 'chapeau',
        description: {
          fr: 'Immense (10–30 cm), d’abord en massue puis étalé en parasol avec un mamelon brun sombre central. Écailles concentriques brunes retroussées sur fond crème.',
          en: 'Huge (10–30 cm), umbrella-shaped with a prominent central dark brown boss (mamelon). Covered in concentric, shaggy brownish scales over a cream background.',
          de: 'Riesig (10–30 cm), erst eiförmig, dann schirmartig ausgebreitet mit dunklem Mittelbuckel. Große braune Schuppen auf cremeweißem Grund.',
          ja: '10〜30cmと巨大。最初は太鼓のバチ状で、後に傘状に平開し中央に濃褐色の突起（中高）がある。クリーム色の地に同心円状の褐色鱗片が散らばる。'
        }
      },
      {
        id: 'macro-gills',
        category: 'dessous',
        label: {
          fr: 'Lamelles libres',
          en: 'Free Gills',
          de: 'Freie Lamellen',
          ja: '離生のひだ'
        },
        anatomyTarget: 'lamelles',
        description: {
          fr: 'Libres (non attachées au pied), très serrées, blanches à crème pâle, séparées du stipe par un col cartilagineux net.',
          en: 'Free from the stem (remote), crowded, soft, pure white to cream. Separated from the stipe by a distinct cartilaginous collar.',
          de: 'Frei (nicht am Stiel angewachsen), sehr dichtstehend, weiß bis blasscreme, durch einen Knorpelkragen vom Stiel getrennt.',
          ja: '柄に付着せず離生し、非常に密。純白からクリーム色。柄との間に軟骨質の輪状の隙間がある。'
        }
      },
      {
        id: 'macro-ring',
        category: 'pied',
        label: {
          fr: 'Anneau mobile coulissant (CRITIQUE)',
          en: 'Sliding Ring (CRUCIAL)',
          de: 'Verschiebbarer Ring (LEBENSWICHTIG)',
          ja: '可動性のつば (最重要識別点)'
        },
        anatomyTarget: 'anneau',
        description: {
          fr: 'CRITÈRE ABSOLU : Anneau épais, double, floconneux, qui COULISSE LIBREMENT le long du pied sans se déchirer, comme une bague au doigt !',
          en: 'CRITICAL: Thick, double, felt-like ring that can be slid freely up and down the stem like a ring on a finger!',
          de: 'LEBENSWICHTIG: Dicker, doppelter, wattiger Ring, der sich wie ein Ring auf dem Finger FREI am Stiel auf- und abschieben lässt!',
          ja: '決定的な判定基準：厚く二重になったフェルト状のつばで、指輪のように柄の上下を破れずに自由にスライドして動かすことができる！'
        }
      },
      {
        id: 'macro-stem',
        category: 'pied',
        label: {
          fr: 'Pied chiné / Tigré',
          en: 'Stem with Snakeskin Pattern',
          de: 'Genatterter Stiel',
          ja: '蛇皮状のまだら模様の柄'
        },
        anatomyTarget: 'pied',
        description: {
          fr: 'Très haut (15–40 cm), élancé, creux, bulbeux à la base. Orné de bandes zig-zag brunâtres en peau de serpent (chiné).',
          en: 'Very tall (15–40 cm), slender, hollow, bulbous base. Beautiful zigzag snakeskin or tiger-striped brown pattern on the stem.',
          de: 'Sehr lang (15–40 cm), schlank, hohl, knollig an der Basis. Typisch braun-quergenattert wie eine Schlangenhaut.',
          ja: '15〜40cmと極めて高く、中空で基部は大きく膨らむ。柄の表面に蛇皮状または虎斑状の褐色の横縞模様（ツクシ模様）がある。'
        }
      },
      {
        id: 'macro-flesh',
        category: 'chair',
        label: {
          fr: 'Chair',
          en: 'Flesh',
          de: 'Fleisch',
          ja: '肉'
        },
        description: {
          fr: 'Blanche, tendre dans le chapeau, coriace et fibreuse dans le pied (rejeter le pied en cuisine). Ne rougit pas à la coupe. Odeur douce de noisette.',
          en: 'White, soft in cap, tough and fibrous in stem (discard stem for cooking). Does NOT turn red or orange when cut. Pleasant hazelnut scent.',
          de: 'Weiß, im Hut zart, im Stiel zäh-holzig (Stiel nicht verwerten). Rötet im Schnitt NICHT. Angenehmer Haselnussduft.',
          ja: '傘の肉は柔らかく白く、切断しても赤変しない。柄は極めて強靭で繊維質（柄は調理に使わず廃棄）。心地よいナッツ香。'
        }
      },
      {
        id: 'macro-spores',
        category: 'spore',
        label: {
          fr: 'Sporée',
          en: 'Spore Print',
          de: 'Sporenpulver',
          ja: '胞子紋'
        },
        description: {
          fr: 'Dépôt blanc pur à crème.',
          en: 'Pure white to pale cream spore deposit.',
          de: 'Reinweiß bis blass cremefarben.',
          ja: '純白色〜淡クリーム色。'
        }
      }
    ],
    lookalikes: [
      {
        name: {
          fr: 'Petites lépiotes mortelles',
          en: 'Deadly Small Dapperlings',
          de: 'Tödliche Giftschirmlinge',
          ja: 'キツネタケ類・小型猛毒キノコ'
        },
        latinName: 'Lepiota helveola / brunneoincarnata',
        edibility: 'deadly',
        dangerLevel: 'deadly',
        description: {
          fr: 'CONTIENT DES AMATOXINES. Intoxication mortelle foudroyante détruisant le foie et les reins.',
          en: 'CONTAINS AMATOXINS. Lethal poisoning destroying liver and kidneys.',
          de: 'ENTHÄLT AMATOXINE. Tödliche Vergiftung mit Leber- und Nierenzerstörung.',
          ja: 'アマニチン毒を含有。肝臓・腎臓を不可逆的に破壊する致死性の猛毒キノコ。'
        },
        crucialDifferences: {
          fr: [
            'RÈGLE ABSOLUE DE TAILLE : Les lépiotes mortelles mesurent TOUJOURS moins de 8–10 cm. Ne cueillez JAMAIS de lépiotes de moins de 10 cm de diamètre !',
            'Leur anneau est fixe, fragile et NE COULISSE PAS le long du pied.',
            'Leur pied est lisse ou floconneux, SANS dessin zébré en peau de serpent.'
          ],
          en: [
            'CRITICAL SIZE RULE: Deadly Lepiota species are SMALL (cap diameter always UNDER 8–10 cm). Never harvest parasols with caps under 10 cm!',
            'Ring is fragile, fixed, and CANNOT slide up and down the stem.',
            'Stem lacks the distinct snakeskin/tiger-striped pattern of M. procera.'
          ],
          de: [
            'LEBENSWICHTIGE GRÖSSENREGEL: Tödliche Arten sind KLEIN (Hutdurchmesser stets UNTER 8–10 cm). Niemals Schirmlinge unter 10 cm Hutbreite ernten!',
            'Der Ring ist zart, festgewachsen und lässt sich NICHT verschieben.',
            'Stiel ohne Schlangenhaut-Natterung.'
          ],
          ja: [
            '絶対的なサイズ基準：猛毒の小型種は傘の直径が必ず8〜10cm未満。10cm未満のキノコは絶対に採取しないこと！',
            'つばは薄く固定されており、柄の上下を動かすことはできない。',
            '柄に蛇皮状の縞模様はない。'
          ]
        }
      },
      {
        name: {
          fr: 'Lépiote de Morgan',
          en: 'False Parasol',
          de: 'Grünsporschirmling',
          ja: 'オオシロカラカサタケ'
        },
        latinName: 'Chlorophyllum molybdites',
        edibility: 'toxic',
        dangerLevel: 'high',
        description: {
          fr: 'Provoque de très violentes gastro-entérites. Pousse dans les pelouses et pâtures en climat chaud.',
          en: 'Causes severe violent gastrointestinal distress. Common in lawns and open grasslands.',
          de: 'Führt zu schweren Magen-Darm-Krämpfen und Erbrechen.',
          ja: '極めて激しい下痢と嘔吐を引き起こす毒菌。公園や草地に発生する。'
        },
        crucialDifferences: {
          fr: [
            'Donne une sporée VERT OLIVE très caractéristique (celle de la Coulemelle est BLANCHE).',
            'Les lamelles matures prennent une teinte gris-vert sale.',
            'Pied lisse, sans dessin tigré.'
          ],
          en: [
            'Produces a distinct DULL GREEN to olive-green spore print, whereas M. procera has a WHITE spore print.',
            'Mature gills turn pale grayish-green.',
            'Stem is smooth and lacks the distinct brown snakeskin patterning.'
          ],
          de: [
            'Besitzt einen charakteristischen GRÜNLICHEN Sporenabdruck (beim Parasol reinweiß).',
            'Alte Lamellen verfärben sich graugrün.',
            'Stiel glatt, ohne Natterung.'
          ],
          ja: [
            '最大の特徴はオリーブ緑色の胞子紋（カラカサタケは純白）。',
            '成熟するとヒダが汚れた灰緑色を帯びる。',
            '柄に蛇皮状のまだら模様がない。'
          ]
        }
      },
      {
        name: {
          fr: 'Lépiote déguenillée',
          en: 'Shaggy Parasol',
          de: 'Gemeiner Safranschirmling',
          ja: 'シロカラカサタケ / アカヒダカラカサタケ'
        },
        latinName: 'Chlorophyllum rhacodes',
        edibility: 'caution',
        dangerLevel: 'moderate',
        description: {
          fr: 'Comestible pour beaucoup mais causant des intolérances digestives chez certaines personnes. Pousse en sol riche et litière d’épicéas.',
          en: 'Edible for most, but causes digestive intolerance in some individuals. Grows in rich compost, parks, and conifer needles.',
          de: 'Guter Speisepilz für die meisten, verursacht aber bei einigen Personen Unverträglichkeiten.',
          ja: '多くの人は食べられるが、体質により消化器系の中毒症状を起こすことがある。'
        },
        crucialDifferences: {
          fr: [
            'La chair ROUGIT vivement puis vire au brun-orangé au froissement ou à la coupe.',
            'Pied blanc lisse, dépourvu de dessin en peau de serpent.',
            'Écailles plus grosses et hirsutes sur le chapeau.'
          ],
          en: [
            'Flesh turns vivid saffron orange then brownish-red instantly when cut or scratched.',
            'Stem is completely smooth white (no zigzag tiger pattern).',
            'Thicker, coarser scales on cap.'
          ],
          de: [
            'Fleisch läuft bei Verletzung oder im Schnitt sofort lebhaft safranorange bis blutrot an.',
            'Stiel glatt weißlich, ohne Natterung.',
            'Schuppen auf dem Hut viel gröber und abstehend.'
          ],
          ja: [
            '傷つけたり切断すると、肉が瞬時にサフラン橙色〜血赤色に変色する。',
            '柄は平滑な白色で、蛇皮模様はない。',
            '傘の鱗片が粗くささくれ立つ。'
          ]
        }
      }
    ]
  },

  suillus_luteus: {
    speciesId: 'suillus_luteus',
    edibility: 'edible',
    edibilityLabel: {
      fr: 'Comestible (Éplucher la cuticule)',
      en: 'Edible (Peel Cuticle)',
      de: 'Essbar (Huthaut abziehen)',
      ja: '可食 (粘性表皮を剥離)'
    },
    safetySummary: {
      fr: 'Nonnette voilée / Bolet jaune. Pousse exclusivement sous les PINS. Chapeau très visqueux à cuticule gélatineuse facile à peler, pores jaunes et anneau membraneux sur le pied. Éplucher impérativement la cuticule avant cuisson.',
      en: 'Slippery Jack. Exclusively mycorrhizal with 2-needle PINES. Identified by very slimy/viscid brown cap, yellow pores, and a prominent membranous ring on the stem. MUST peel off the slimy cap cuticle before cooking.',
      de: 'Butterpilz. Streng an KIEFERN gebunden. Brauner, sehr schleimiger Hut, gelbe Poren und deutlicher weiß-violetter Ring am Stiel. Schleimige Huthaut vor der Zubereitung unbedingt abziehen!',
      ja: 'ヌメリイグチ。マツ属樹木と厳密に共生する。傘の表皮は非常に強いゼラチン質の粘性があり、柄の上部に薄膜状のつばがある。消化不良を防ぐため、調理前に必ず傘の粘膜表皮を剥ぎ取ること。'
    },
    sporePrintColor: {
      fr: 'Ocre à brun argileux',
      en: 'Clay-yellow to ochre-brown',
      de: 'Ocker- bis tonbraun',
      ja: '黄褐色〜粘土褐色'
    },
    diagnosticChecklist: [
      {
        id: 'suillus-cap',
        category: 'chapeau',
        label: {
          fr: 'Chapeau & Cuticule visqueuse',
          en: 'Cap & Slime Cuticle',
          de: 'Hut & Schleimhaut',
          ja: '傘と粘性表皮'
        },
        anatomyTarget: 'chapeau',
        description: {
          fr: '5–12 cm, brun chocolat à noisette foncé. Recouvert d’une cuticule très gélatineuse par temps humide, qui s’épluche facilement d’un coup d’ongle.',
          en: '5–12 cm, chocolate to chestnut brown. Covered in a thick, very gelatinous, slimy cuticle that peels off cleanly like a sticker.',
          de: '5–12 cm, schokoladen- bis kastanienbraun. Dicke, stark schleimige Haut, die sich komplett wie eine Folie abziehen lässt.',
          ja: '5〜12cm、チョコレート色〜濃褐色。湿ると非常に厚い粘液層に覆われ、指やナイフでシールのように綺麗に剥がすことができる。'
        }
      },
      {
        id: 'suillus-pores',
        category: 'dessous',
        label: {
          fr: 'Pores & Tubes jaunes',
          en: 'Pores & Tubes',
          de: 'Gelbe Poren & Röhren',
          ja: '黄色の管孔面'
        },
        anatomyTarget: 'tubes',
        description: {
          fr: 'Petits, ronds, jaune beurre pâle devenant jaune olive. Recouverts chez les jeunes d’un voile partiel blanchâtre tendu depuis le pied.',
          en: 'Small, round, pale lemon-yellow turning darker olive-yellow. Covered in a whitish veil when young.',
          de: 'Klein, rundlich, butter- bis zitronengelb. In der Jugend von einem weißlichen Schleier überdeckt.',
          ja: '細孔、淡いレモン黄色からオリーブ黄色。幼菌時は柄から続く白色の内被膜に覆われる。'
        }
      },
      {
        id: 'suillus-ring',
        category: 'pied',
        label: {
          fr: 'Anneau membraneux',
          en: 'Membranous Ring',
          de: 'Häutiger Ring',
          ja: '薄膜状のつば'
        },
        anatomyTarget: 'anneau',
        description: {
          fr: 'Anneau membraneux bien visible, blanc violacé sur le haut du pied (reste du voile partiel). Ponctué de fins granules au-dessus.',
          en: 'Prominent, membranous, purplish-white ring on upper stem (remnant of partial veil). Above the ring, stem is dotted with tiny granules.',
          de: 'Deutlicher, weißlich-violetter häutiger Ring am oberen Stiel. Oberhalb des Rings ist der Stiel fein punktiert.',
          ja: '柄の上部に紫白色を帯びた明瞭な膜質のつばがある（内被膜の残骸）。つばの上部は細かい粒点で覆われる。'
        }
      },
      {
        id: 'suillus-stem',
        category: 'pied',
        label: {
          fr: 'Pied / Stipe',
          en: 'Stipe / Stem',
          de: 'Stiel',
          ja: '柄'
        },
        anatomyTarget: 'pied',
        description: {
          fr: 'Cylindrique, jaune pâle au-dessus de l’anneau, brunâtre au-dessous, sans aucun réseau de mailles.',
          en: 'Cylindrical, pale yellow above ring, brownish below, without reticulation net.',
          de: 'Zylindrisch, über dem Ring hellgelb, darunter bräunlich, ohne Netz.',
          ja: '円柱形、つばの上部は淡黄色、下部は汚褐色。網目模様はない。'
        }
      },
      {
        id: 'suillus-flesh',
        category: 'chair',
        label: {
          fr: 'Chair',
          en: 'Flesh',
          de: 'Fleisch',
          ja: '肉'
        },
        description: {
          fr: 'Molle, jaune pâle, immuable à la coupe. Saveur douce agréable. (Éplucher impérativement la cuticule visqueuse avant cuisson car elle est laxative).',
          en: 'Soft, pale yellow, unchanging when cut. Pleasant mild mushroom taste. (MUST peel cuticle before cooking as it can be laxative).',
          de: 'Weich, blassgelb, unveränderlich im Schnitt. Mild. (Huthaut vor Zubereitung abziehen, da abführend wirkend).',
          ja: '軟らかく淡黄色で変色しない。穏やかな風味。（表皮には下剤様作用があるため、調理前に必ず剥ぎ取ること）。'
        }
      },
      {
        id: 'suillus-spores',
        category: 'spore',
        label: {
          fr: 'Sporée',
          en: 'Spore Print',
          de: 'Sporenpulver',
          ja: '胞子紋'
        },
        description: {
          fr: 'Dépôt ocre à brun argileux.',
          en: 'Ochre-buff to clay-brown.',
          de: 'Ocker- bis lehmbraun.',
          ja: '黄褐色〜粘土褐色。'
        }
      }
    ],
    lookalikes: [
      {
        name: {
          fr: 'Bolet des bouviers',
          en: 'Bovine Bolete',
          de: 'Kuh-Röhrling',
          ja: 'アミタケ'
        },
        latinName: 'Suillus bovinus',
        edibility: 'edible',
        dangerLevel: 'low',
        description: {
          fr: 'Également comestible; associé aux pins mais dépourvu de tout anneau sur le stipe.',
          en: 'Also edible; associated with pines, but completely lacks any ring on the stem.',
          de: 'Ebenfalls essbar, unter Kiefern wachsend, jedoch völlig ohne Ring.',
          ja: '同じくマツ林に生える可食菌だが、柄につばが全くない。'
        },
        crucialDifferences: {
          fr: [
            'Ne possède AUCUN anneau sur le pied.',
            'Pores plus larges, anguleux et composés.',
            'Chapeau fauve ochracé, moins sombre que le bolet jaune.'
          ],
          en: [
            'Has NO ring on the stem whatsoever.',
            'Pores are wider, compound, olive-yellow.',
            'Cap is buff-yellowish, not rich chocolate brown.'
          ],
          de: [
            'Besitzt keinerlei Ring am Stiel.',
            'Poren deutlich weitmaschiger und eckig-zusammengesetzt.',
            'Hut blasser ledergelb.'
          ],
          ja: [
            '柄につばが一切ない。',
            '管孔はより粗く角ばった複合孔。',
            '傘は黄褐色〜粘土色で、ヌメリイグチほど濃いチョコレート色にならない。'
          ]
        }
      }
    ]
  }
};
