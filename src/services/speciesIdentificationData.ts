import { SpeciesId } from '../types';

export type EdibilityRating = 'choice' | 'edible' | 'caution' | 'inedible' | 'toxic' | 'deadly';

export interface Lookalike {
  name: string;
  latinName: string;
  edibility: EdibilityRating;
  dangerLevel: 'low' | 'moderate' | 'high' | 'deadly';
  crucialDifferences: string[];
  description: string;
}

export interface DiagnosticCriterion {
  id: string;
  category: 'chapeau' | 'dessous' | 'pied' | 'chair' | 'spore';
  label: string;
  anatomyTarget?: string; // Links to anatomy term (e.g. 'pores', 'lamelles', 'anneau')
  description: string;
}

export interface SpeciesIdentificationGuide {
  speciesId: SpeciesId;
  edibility: EdibilityRating;
  edibilityLabel: string;
  safetySummary: string;
  sporePrintColor: string;
  diagnosticChecklist: DiagnosticCriterion[];
  lookalikes: Lookalike[];
}

export const SPECIES_IDENTIFICATION_DATA: Record<SpeciesId, SpeciesIdentificationGuide> = {
  boletus: {
    speciesId: 'boletus',
    edibility: 'choice',
    edibilityLabel: 'Choice Edible / Excellent Comestible',
    safetySummary: 'Easily identifiable pore-bearing mushroom. Check underside for tubes/pores (never gills) and inspect stipe for fine white net (reticulation). Beware of bitter Tylopilus and red-pored Rubroboletus.',
    sporePrintColor: 'Olive-brown / Brun olive',
    diagnosticChecklist: [
      {
        id: 'boletus-cap',
        category: 'chapeau',
        label: 'Cap / Chapeau',
        anatomyTarget: 'chapeau',
        description: 'Hemispherical to convex, 8–25 cm. Hazel to chestnut brown, slightly greasy in wet weather, with a narrow whitish edge when young.'
      },
      {
        id: 'boletus-pores',
        category: 'dessous',
        label: 'Hymenium / Pores & Tubes',
        anatomyTarget: 'pores',
        description: 'Underneath made of detachable tubes with fine round pores. White when young, becoming yellowish then greenish-olive with age. NEVER bruised blue when touched.'
      },
      {
        id: 'boletus-stem',
        category: 'pied',
        label: 'Stipe / Pied',
        anatomyTarget: 'pied',
        description: 'Robust, bulbous or club-shaped (bulbe), whitish to light brownish. Covered with a delicate, fine WHITE raised mesh (reticulation / réseau) especially near the top.'
      },
      {
        id: 'boletus-flesh',
        category: 'chair',
        label: 'Flesh / Chair',
        description: 'Firm, solid white, does NOT change color or turn blue when cut. Pleasant nutty smell, mild sweet taste.'
      },
      {
        id: 'boletus-spores',
        category: 'spore',
        label: 'Spore Print',
        description: 'Olive-brown spore deposit.'
      }
    ],
    lookalikes: [
      {
        name: 'Bitter Bolete / Bolet de fiel',
        latinName: 'Tylopilus felleus',
        edibility: 'inedible',
        dangerLevel: 'low',
        description: 'Extremely bitter taste that ruins any meal. Non-toxic but completely unpalatable.',
        crucialDifferences: [
          'Stem has a coarse, prominent DARK brown or black net (reticulation), whereas B. edulis has a fine WHITE net.',
          'Pores turn dirty pinkish-flesh colored at maturity, whereas B. edulis pores turn greenish-olive.',
          'Intense bitter taste (nibble a tiny piece and spit out).'
        ]
      },
      {
        name: "Devil's Bolete / Bolet de Satan",
        latinName: 'Rubroboletus satanas',
        edibility: 'toxic',
        dangerLevel: 'high',
        description: 'Causes severe gastrointestinal poisoning. Prefers warm calcareous broadleaf woods.',
        crucialDifferences: [
          'Cap is chalky whitish-gray to pale silvery, never rich chestnut brown.',
          'Pores and tubes are vivid blood RED to orange-red, bruising blue immediately.',
          'Flesh turns pale blue upon cutting and has a foul, nauseating smell at maturity.'
        ]
      }
    ]
  },

  cantharellus: {
    speciesId: 'cantharellus',
    edibility: 'choice',
    edibilityLabel: 'Choice Edible / Excellent Comestible',
    safetySummary: 'Unmistakable golden-yellow color with decurrent RIDGES/FOLDS (plis), NOT true blade-like gills. Apricot fruity aroma. Never grows in dense clumps directly on wood.',
    sporePrintColor: 'Pale yellow to creamy white / Jaune pâle',
    diagnosticChecklist: [
      {
        id: 'canth-cap',
        category: 'chapeau',
        label: 'Cap / Chapeau',
        anatomyTarget: 'chapeau',
        description: 'Convex becoming funnel-shaped with wavy, lobed margins. Uniform egg-yellow to golden apricot color.'
      },
      {
        id: 'canth-folds',
        category: 'dessous',
        label: 'Underside / Plis (NOT Gills)',
        anatomyTarget: 'dessous_du_chapeau',
        description: 'Thick, blunt, vein-like ridges or folds (plis) that fork repeatedly and run far down the stem (decurrent). They cannot be separated cleanly from the flesh like true lamelles.'
      },
      {
        id: 'canth-stem',
        category: 'pied',
        label: 'Stipe / Pied',
        anatomyTarget: 'pied',
        description: 'Solid, continuous with the cap, tapering downward, same golden yellow color. No ring, no volva.'
      },
      {
        id: 'canth-flesh',
        category: 'chair',
        label: 'Flesh / Chair',
        description: 'Dense, fibrous, whitish inside with yellowish tint under skin. Distinctive sweet, fruity fragrance reminiscent of dried apricots or mirabelles.'
      },
      {
        id: 'canth-spores',
        category: 'spore',
        label: 'Spore Print',
        description: 'Pale creamy-yellowish deposit.'
      }
    ],
    lookalikes: [
      {
        name: "Jack-o'-Lantern / Pleurote de l'olivier",
        latinName: 'Omphalotus olearius / illudens',
        edibility: 'toxic',
        dangerLevel: 'high',
        description: 'Severely poisonous, causing intense vomiting and cramps. Bioluminescent in darkness.',
        crucialDifferences: [
          'Has thin, sharp, crowded TRUE BLADE-LIKE GILLS (lamelles), unlike the blunt, forked folds of Cantharellus.',
          'Grows in dense clusters directly on or at the base of hardwood trees or stumps, whereas Cantharellus grows on the forest floor soil.',
          'Flesh is dark orange throughout, lacks fruity apricot odor.'
        ]
      },
      {
        name: 'False Chanterelle / Fausse girolle',
        latinName: 'Hygrophoropsis aurantiaca',
        edibility: 'inedible',
        dangerLevel: 'low',
        description: 'Can cause mild digestive upset in sensitive people. Poor taste and soft texture.',
        crucialDifferences: [
          'Possesses true crowded, thin gills that branch dichotomously, colored vibrant orange.',
          'Cap is darker orange with brownish center and soft, cottony texture.',
          'Stem is often thin, dark brownish-orange at the base; flesh is soft, flimsy, and odorless.'
        ]
      }
    ]
  },

  hydnum: {
    speciesId: 'hydnum',
    edibility: 'choice',
    edibilityLabel: 'Choice Edible / Excellent Comestible',
    safetySummary: 'One of the safest mushrooms in the world! The underside has fragile, brittle downward-pointing TEETH or SPINES (aiguillons) instead of gills or pores. No toxic lookalikes with spines on soil.',
    sporePrintColor: 'White to pale cream / Blanc',
    diagnosticChecklist: [
      {
        id: 'hydnum-cap',
        category: 'chapeau',
        label: 'Cap / Chapeau',
        anatomyTarget: 'chapeau',
        description: 'Irregular, lobed, cream-beige to pale biscuit-buff color. Dry, matt, often fused with neighboring specimens in fairy rings.'
      },
      {
        id: 'hydnum-spines',
        category: 'dessous',
        label: 'Underside / Aiguillons (Spines)',
        anatomyTarget: 'aiguillons',
        description: 'Covered with crowded, brittle, downward-pointing teeth/spines (aiguillons) 2–6 mm long, pale buff colored. Spines easily rub off with your thumb.'
      },
      {
        id: 'hydnum-stem',
        category: 'pied',
        label: 'Stipe / Pied',
        anatomyTarget: 'pied',
        description: 'Stout, off-center, solid, same pale cream color as cap, staining faintly orange-yellow when handled.'
      },
      {
        id: 'hydnum-flesh',
        category: 'chair',
        label: 'Flesh / Chair',
        description: 'Firm, brittle, chalk-white. Mild mushroomy taste (slightly peppery/bitter in old specimens; scrape off old spines to remove bitterness).'
      },
      {
        id: 'hydnum-spores',
        category: 'spore',
        label: 'Spore Print',
        description: 'Pure white to pale cream.'
      }
    ],
    lookalikes: [
      {
        name: 'Terracotta Hedgehog / Pied-de-mouton roussissant',
        latinName: 'Hydnum rufescens',
        edibility: 'edible',
        dangerLevel: 'low',
        description: 'Also fully edible and delicious; slightly smaller and more intensely orange-reddish.',
        crucialDifferences: [
          'Cap is distinctly terracotta-orange and thinner.',
          'Spines do not run as far down the stem.',
          'Shares the same safety profile: edible with no toxic spine-bearing ground lookalikes.'
        ]
      }
    ]
  },

  craterellus_cornucopioides: {
    speciesId: 'craterellus_cornucopioides',
    edibility: 'choice',
    edibilityLabel: 'Choice Edible / Excellent Comestible',
    safetySummary: 'Horn of Plenty / Black Trumpet. Distinctive deep horn or trumpet shape, hollow to the base, slate-gray to soot-black. Safe choice with zero toxic lookalikes.',
    sporePrintColor: 'White to pale ochre / Blanc à crème',
    diagnosticChecklist: [
      {
        id: 'crater-cap',
        category: 'chapeau',
        label: 'Cap / Chapeau',
        anatomyTarget: 'chapeau',
        description: 'Funnel- or trumpet-shaped, deeply hollow down into the stem base. Edge flared and wavy. Dark brown-black when moist, ash-gray when dry.'
      },
      {
        id: 'crater-underside',
        category: 'dessous',
        label: 'Hymenium / Surface externe',
        anatomyTarget: 'dessous_du_chapeau',
        description: 'Outer surface is smooth or slightly wrinkled/veined, frosted ash-gray with a powdery bloom from spores. NO gills, NO pores, NO spines.'
      },
      {
        id: 'crater-stem',
        category: 'pied',
        label: 'Stipe / Pied',
        anatomyTarget: 'pied',
        description: 'Continuous tubular hollow extension of the trumpet. Blackish-gray.'
      },
      {
        id: 'crater-flesh',
        category: 'chair',
        label: 'Flesh / Chair',
        description: 'Thin, elastic, blackish. Highly aromatic, fragrant, intense earthy and fruity perfume.'
      },
      {
        id: 'crater-spores',
        category: 'spore',
        label: 'Spore Print',
        description: 'Whitish to pale salmon-buff.'
      }
    ],
    lookalikes: [
      {
        name: 'Sinuous Chanterelle / Chanterelle sinueuse',
        latinName: 'Pseudocraterellus undulatus',
        edibility: 'edible',
        dangerLevel: 'low',
        description: 'Edible cousin with more pronounced yellowish-brown stem and wrinkled hymenium.',
        crucialDifferences: [
          'Hymenium has more pronounced folds/veins.',
          'Color is brownish rather than jet-black.',
          'Also completely edible and safe.'
        ]
      }
    ]
  },

  craterellus_tubaeformis: {
    speciesId: 'craterellus_tubaeformis',
    edibility: 'choice',
    edibilityLabel: 'Choice Edible / Excellent Comestible',
    safetySummary: 'Trumpet chanterelle with a hollow brownish cap, distinct yellow-orange stem, and blunt, forked veins under the cap. Thrives in acidic mossy conifer woods.',
    sporePrintColor: 'White to pale yellow / Blanc crème',
    diagnosticChecklist: [
      {
        id: 'tuba-cap',
        category: 'chapeau',
        label: 'Cap / Chapeau',
        anatomyTarget: 'chapeau',
        description: 'Funnel-shaped with a central hole piercing into the hollow stem. Brownish-gray to yellowish-umber, wavy margin.'
      },
      {
        id: 'tuba-folds',
        category: 'dessous',
        label: 'Underside / Plis (Vein-like Folds)',
        anatomyTarget: 'dessous_du_chapeau',
        description: 'Blunt, widely spaced, repeatedly forked ridges/veins. Gray-yellow to lilac-gray, running down the stem.'
      },
      {
        id: 'tuba-stem',
        category: 'pied',
        label: 'Stipe / Pied',
        anatomyTarget: 'pied',
        description: 'Slender, distinctly hollow, compressed or grooved, striking golden-yellow to dull orange.'
      },
      {
        id: 'tuba-flesh',
        category: 'chair',
        label: 'Flesh / Chair',
        description: 'Thin, yellowish-gray, pleasant mild fruity-earthy odor.'
      },
      {
        id: 'tuba-spores',
        category: 'spore',
        label: 'Spore Print',
        description: 'Creamy white to pale yellow.'
      }
    ],
    lookalikes: [
      {
        name: 'Yellowing Chanterelle / Chanterelle jaunissante',
        latinName: 'Craterellus lutescens',
        edibility: 'choice',
        dangerLevel: 'low',
        description: 'Closely related top-tier edible with almost smooth, orange-pink underside.',
        crucialDifferences: [
          'Underside is practically veinless (smooth or slightly wrinkled).',
          'Intense apricot odor and bright orange-yellow stem.',
          'Equally safe and prized for eating.'
        ]
      }
    ]
  },

  imleria_badia: {
    speciesId: 'imleria_badia',
    edibility: 'choice',
    edibilityLabel: 'Choice Edible / Excellent Comestible',
    safetySummary: 'Bay Bolete. Chestnut-brown cap with yellow pores that instantly bruise ink-BLUE or greenish-blue when pressed. Must be cooked thoroughly (contains thermolabile compounds).',
    sporePrintColor: 'Olive-brown / Brun olive',
    diagnosticChecklist: [
      {
        id: 'badia-cap',
        category: 'chapeau',
        label: 'Cap / Chapeau',
        anatomyTarget: 'chapeau',
        description: 'Convex to flat, 5–15 cm. Chestnut bay-brown, velvety when dry, slimy/viscid when damp.'
      },
      {
        id: 'badia-pores',
        category: 'dessous',
        label: 'Pores & Tubes',
        anatomyTarget: 'pores',
        description: 'Creamy yellow at first, turning greenish-yellow. Instantly turns blue-green when pressed with a finger!'
      },
      {
        id: 'badia-stem',
        category: 'pied',
        label: 'Stipe / Pied',
        anatomyTarget: 'pied',
        description: 'Cylindrical, longitudinal brown fibers/streaks, NO raised mesh/reticulation (unlike Boletus edulis).'
      },
      {
        id: 'badia-flesh',
        category: 'chair',
        label: 'Flesh / Chair',
        description: 'Whitish-yellow, staining faintly blue near tubes and stipe top when cut. Mild pleasant taste.'
      },
      {
        id: 'badia-spores',
        category: 'spore',
        label: 'Spore Print',
        description: 'Olive-brown deposit.'
      }
    ],
    lookalikes: [
      {
        name: 'Bitter Bolete / Bolet de fiel',
        latinName: 'Tylopilus felleus',
        edibility: 'inedible',
        dangerLevel: 'low',
        description: 'Bitter non-toxic trap.',
        crucialDifferences: [
          'Tylopilus pores NEVER bruise blue when pressed.',
          'Tylopilus pores turn dirty pink at maturity.',
          'Tylopilus stem has a prominent dark raised net.'
        ]
      }
    ]
  },

  laetiporus_sulphureus: {
    speciesId: 'laetiporus_sulphureus',
    edibility: 'caution',
    edibilityLabel: 'Edible with Caution / Comestible sous conditions',
    safetySummary: 'Chicken of the Woods. Vibrant sulfur-yellow and orange bracket fungus growing on living or dead hardwoods (oak, cherry, willow). Must ONLY be harvested young and tender, and ALWAYS cooked thoroughly. Never eat from yew (Taxus) trees!',
    sporePrintColor: 'White / Blanc',
    diagnosticChecklist: [
      {
        id: 'laeti-bracket',
        category: 'chapeau',
        label: 'Brackets / Chapeaux étagés',
        anatomyTarget: 'chapeau',
        description: 'Large overlapping shelves 10–40 cm across. Bright sulfur-yellow to vivid salmon-orange with wavy, succulent yellow margins.'
      },
      {
        id: 'laeti-pores',
        category: 'dessous',
        label: 'Pores',
        anatomyTarget: 'pores',
        description: 'Tiny sulfur-yellow pores on the underside. Exudes clear yellow droplets when young and fresh.'
      },
      {
        id: 'laeti-flesh',
        category: 'chair',
        label: 'Flesh / Chair',
        description: 'Thick, succulent, watery when young, tearing like cooked chicken breast. Dries out to chalky, crumbly white when old (inedible when old).'
      },
      {
        id: 'laeti-habitat',
        category: 'pied',
        label: 'Substrate & Tree Host',
        description: 'Strictly bracket-forming directly on tree trunks or stumps (oaks, chestnuts, fruit trees). Never harvest if growing on poisonous Yew (Taxus) or Robinia.'
      },
      {
        id: 'laeti-spores',
        category: 'spore',
        label: 'Spore Print',
        description: 'White spore deposit.'
      }
    ],
    lookalikes: [
      {
        name: 'Northern Tooth Fungus / Climacodon',
        latinName: 'Climacodon septentrionalis',
        edibility: 'inedible',
        dangerLevel: 'low',
        description: 'Whitish-yellow shelves on trees with spines underneath instead of pores.',
        crucialDifferences: [
          'Possesses hanging teeth/spines on underside, not tiny sulfur-yellow pores.',
          'Color is dingy cream-yellow, not brilliant flaming orange-yellow.',
          'Tough, fibrous, unpalatable.'
        ]
      }
    ]
  },

  macrolepiota_procera: {
    speciesId: 'macrolepiota_procera',
    edibility: 'choice',
    edibilityLabel: 'Choice Edible / Excellent Comestible',
    safetySummary: 'Large Parasol Mushroom. TALL stature (>15 cm tall, up to 30 cm cap). Must have a SLIDING double ring (anneau mobile) and a snakeskin-patterned stipe. NEVER harvest small parasols (<10 cm) which can be deadly Lepiota.',
    sporePrintColor: 'White to creamy / Blanc',
    diagnosticChecklist: [
      {
        id: 'macro-cap',
        category: 'chapeau',
        label: 'Cap / Chapeau',
        anatomyTarget: 'chapeau',
        description: 'Huge (10–30 cm), umbrella-shaped with a prominent central dark brown boss (mamelon). Covered in concentric, shaggy brownish scales (écailles) over a cream background.'
      },
      {
        id: 'macro-gills',
        category: 'dessous',
        label: 'Gills / Lamelles',
        anatomyTarget: 'lamelles',
        description: 'Free from the stem (remote), crowded, soft, pure white to cream. Separated from the stipe by a distinct cartilaginous collar.'
      },
      {
        id: 'macro-ring',
        category: 'pied',
        label: 'Sliding Ring / Anneau coulissant',
        anatomyTarget: 'anneau',
        description: 'CRITICAL: Thick, double, felt-like ring that can be slid freely up and down the stem like a ring on a finger!'
      },
      {
        id: 'macro-stem',
        category: 'pied',
        label: 'Stem & Pattern / Pied tigré',
        anatomyTarget: 'pied',
        description: 'Very tall (15–40 cm), slender, hollow, bulbous base (bulbe). Beautiful zigzag snakeskin or tiger-striped brown pattern (chiné) on the stem.'
      },
      {
        id: 'macro-flesh',
        category: 'chair',
        label: 'Flesh / Chair',
        description: 'White, soft in cap, tough and fibrous in stem (discard stem for cooking). Does NOT turn red or orange when cut. Pleasant hazelnut scent.'
      },
      {
        id: 'macro-spores',
        category: 'spore',
        label: 'Spore Print',
        description: 'Pure white to pale cream spore deposit.'
      }
    ],
    lookalikes: [
      {
        name: 'Deadly Small Dapperlings / Lépiotes mortelles',
        latinName: 'Lepiota helveola / brunneoincarnata',
        edibility: 'deadly',
        dangerLevel: 'deadly',
        description: 'CONTAINS AMATOXINS. Lethal poisoning destroying liver and kidneys.',
        crucialDifferences: [
          'CRITICAL SIZE RULE: Deadly Lepiota species are SMALL (cap diameter always UNDER 8–10 cm). Never harvest parasols with caps under 10 cm!',
          'Ring is fragile, fixed, and CANNOT slide up and down the stem.',
          'Stem lacks the distinct snakeskin/tiger-striped pattern of M. procera.'
        ]
      },
      {
        name: 'False Parasol / Lépiote de Morgan',
        latinName: 'Chlorophyllum molybdites',
        edibility: 'toxic',
        dangerLevel: 'high',
        description: 'Causes severe violent gastrointestinal distress. Common in lawns and open grasslands.',
        crucialDifferences: [
          'Produces a distinct DULL GREEN to olive-green spore print, whereas M. procera has a WHITE spore print.',
          'Mature gills turn pale grayish-green.',
          'Stem is smooth and lacks the distinct brown snakeskin patterning.'
        ]
      },
      {
        name: 'Shaggy Parasol / Lépiote déguenillée',
        latinName: 'Chlorophyllum rhacodes',
        edibility: 'caution',
        dangerLevel: 'moderate',
        description: 'Edible for most, but causes digestive intolerance in some individuals. Grows in rich compost, parks, and conifer needles.',
        crucialDifferences: [
          'Flesh turns vivid saffron orange then brownish-red instantly when cut or scratched.',
          'Stem is completely smooth white (no zigzag tiger pattern).',
          'Thicker, coarser scales on cap.'
        ]
      }
    ]
  },

  suillus_luteus: {
    speciesId: 'suillus_luteus',
    edibility: 'edible',
    edibilityLabel: 'Edible / Comestible (Peel Cuticle)',
    safetySummary: 'Slippery Jack. Exclusively mycorrhizal with 2-needle PINES (Pinus sylvestris). Identified by very slimy/viscid brown cap, yellow pores, and a prominent membranous ring on the stem. MUST peel off the slimy cap cuticle before cooking to prevent digestive upset.',
    sporePrintColor: 'Clay-yellow to ochre-brown / Ocre',
    diagnosticChecklist: [
      {
        id: 'suillus-cap',
        category: 'chapeau',
        label: 'Cap & Slime Cuticle',
        anatomyTarget: 'chapeau',
        description: '5–12 cm, chocolate to chestnut brown. Covered in a thick, very gelatinous, slimy cuticle that peels off cleanly like a sticker.'
      },
      {
        id: 'suillus-pores',
        category: 'dessous',
        label: 'Pores & Tubes',
        anatomyTarget: 'tubes',
        description: 'Small, round, pale lemon-yellow turning darker olive-yellow. Covered in a whitish veil when young.'
      },
      {
        id: 'suillus-ring',
        category: 'pied',
        label: 'Membranous Ring / Anneau',
        anatomyTarget: 'anneau',
        description: 'Prominent, membranous, purplish-white ring on upper stem (remnant of partial veil). Above the ring, stem is dotted with tiny granules.'
      },
      {
        id: 'suillus-stem',
        category: 'pied',
        label: 'Stipe / Pied',
        anatomyTarget: 'pied',
        description: 'Cylindrical, pale yellow above ring, brownish below, without reticulation net.'
      },
      {
        id: 'suillus-flesh',
        category: 'chair',
        label: 'Flesh / Chair',
        description: 'Soft, pale yellow, unchanging when cut. Pleasant mild mushroom taste.'
      },
      {
        id: 'suillus-spores',
        category: 'spore',
        label: 'Spore Print',
        description: 'Ochre-buff to clay-brown.'
      }
    ],
    lookalikes: [
      {
        name: 'Bovine Bolete / Bolet des bouviers',
        latinName: 'Suillus bovinus',
        edibility: 'edible',
        dangerLevel: 'low',
        description: 'Also edible; associated with pines, but completely lacks any ring on the stem.',
        crucialDifferences: [
          'Has NO ring (anneau) on the stem whatsoever.',
          'Pores are wider, compound, olive-yellow.',
          'Cap is buff-yellowish, not rich chocolate brown.'
        ]
      }
    ]
  }
};
