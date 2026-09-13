import { SpeciesId, ForagingWaypoint } from '../types';
import { SupportedLocale } from '../i18n/types';
import { SPECIES_DETAILS } from './habitatDataService';
import { getSpeciesDisplayName, getSpeciesCommonName, getSpeciesLatinName, currentLocale, i18n } from '../i18n';

export interface SpeciesFieldGuideContent {
  idKeys: Record<SupportedLocale, string[]>;
  lookalikes: Record<SupportedLocale, string[]>;
  ruleOfThumb: Record<SupportedLocale, string>;
}

export const FIELD_GUIDE_DATA: Record<SpeciesId, SpeciesFieldGuideContent> = {
  boletus: {
    idKeys: {
      fr: [
        'Chapeau : Brun noisette à châtain, cuticule lisse et grasse par temps humide, fine bordure blanche typique sur la marge.',
        'Tubes/Pores : Mousse sous le chapeau (AUCUNE LAMELLE). Blancs chez les jeunes, devenant jaune-verdâtre à vert olive. NE BLEUIT PAS.',
        'Pied : Robuste, renflé ou ventru en massue, orné d’un fin réseau de nervures blanches en relief (réticulation) sur la partie supérieure.',
        'Chair : Blanche, ferme et immuable à la coupe (ne change pas de couleur). Odeur agréable de noisette fraîche.'
      ],
      en: [
        'Cap: Hazel to chestnut brown, smooth and tacky when damp, with a distinct fine white margin line along the edge.',
        'Pores/Tubes: Spongy tubes under cap (NO GILLS). White in youth, turning yellow to olive-green. Does NOT turn blue.',
        'Stem: Solid bulbous/club-shaped stem with fine raised white netting (reticulation) on upper half.',
        'Flesh: Thick, firm, unchanging white when sliced. Pleasant nutty hazelnut aroma.'
      ],
      de: [
        'Hut: Haselnuss- bis kastanienbraun, feucht leicht klebrig, mit charakteristischem feinen weißen Hutsäumen.',
        'Röhren: Schwammige Röhrenschicht (KEINE LAMELLEN). Jung weiß, später gelb-grünlich bis oliv. BLÄUT NICHT.',
        'Stiel: Bauchig-keulig, fest, im oberen Bereich mit feinem, erhabenem weißem Netzmuster überzogen.',
        'Fleisch: Fest, weiß, unveränderlich beim Anschneiden. Angenehmer nussiger Geruch.'
      ],
      ja: [
        '傘：ヘーゼル褐色〜栗褐色、湿るとやや粘性があり、傘の縁に繊細な白い縁取り線がある。',
        '管孔（裏面）：スポンジ状の管孔（ヒダは無い）。幼菌時は白色で、成長すると黄色〜オリーブ緑色になる。青変しない。',
        '柄：太い徳利状〜棍棒状で、柄の上部に繊細な浮き出た白い網目模様がある。',
        '肉：緻密で白く、切断しても変色しない。上品で豊かなナッツの芳香がある。'
      ]
    },
    lookalikes: {
      fr: [
        '❌ Rubroboletus satanas (Bolet satan) - TOXIQUE : Chapeau blanchâtre/gris pâle, pores ROUGE CARMIN, bleuit fortement au froissement. Odeur écœurante avec l’âge.',
        '❌ Tylopilus felleus (Bolet de fiel) - NON COMESTIBLE : Pores rosâtres à maturité, gros réseau noir/brunâtre en relief sur le pied. Extrêmement amer.'
      ],
      en: [
        '❌ Rubroboletus satanas (Devil\'s Bolete) - POISONOUS: Chalky pale gray cap, blood-red/carmine pores, bruises dark blue. Repulsive odor in age.',
        '❌ Tylopilus felleus (Bitter Bolete) - INEDIBLE: Pores turn pinkish with age, coarse dark brown/black raised stem netting. Overpoweringly bitter.'
      ],
      de: [
        '❌ Rubroboletus satanas (Satansröhrling) - GIFTIG: Blassgrauer Hut, blutrote Röhrenmündungen, bläut bei Druck. Im Alter aasartiger Geruch.',
        '❌ Tylopilus felleus (Gallenröhrling) - UNGENIESSBAR: Im Alter rosa Röhren, grobes dunkles Stielnetz. Extrem bitter.'
      ],
      ja: [
        '❌ ドクササコ・サタンイグチ (Rubroboletus satanas) - 毒：淡灰色の傘、鮮紅色〜暗赤色の管孔、触れると暗青色に変色。成熟すると悪臭。',
        '❌ ニガイグチ (Tylopilus felleus) - 不適：成熟すると管孔が淡紅色を帯び、柄に粗い黒褐色の網目がある。極めて苦い。'
      ]
    },
    ruleOfThumb: {
      fr: 'RÈGLE D’OR : Ne ramassez jamais de bolets à pores rouges/orangés ou dont la chair bleuit intensément à la coupe.',
      en: 'RULE OF THUMB: Never harvest boletes with red/orange pores or intensely blue-staining flesh.',
      de: 'FAUSTREGEL: Sammeln Sie niemals Röhrlinge mit roten/orangefarbenen Röhren oder stark blauendem Fleisch.',
      ja: '安全の鉄則：管孔が赤色〜橙色のものや、肉が激しく青変するイグチ類は絶対に採取しないでください。'
    }
  },

  cantharellus: {
    idKeys: {
      fr: [
        'Couleur : Entièrement jaune d’or à jaune bouton d’or ou abricot pâle.',
        'Sous le chapeau : PLIS ÉPAIS décurrents (fausses lamelles), fourchus et espacés, prolongeant le pied. Ne peuvent pas se détacher.',
        'Chapeau : Chair souple, forme d’entonnoir ou de trompette à bords ondulés à maturité.',
        'Chair : Blanche à crème à l’intérieur, odeur fruitée caractéristique de mirabelle ou d’abricot, saveur crue légèrement poivrée.'
      ],
      en: [
        'Color: Uniform egg-yolk golden yellow to pale apricot throughout.',
        'Underside: FALSE GILLS (thick, blunt ridges/folds) running down the stem. Cannot be separated from the cap flesh.',
        'Cap: Irregular wavy margin, funnel-shaped when mature.',
        'Flesh: Solid white/creamy interior with a distinct sweet apricot scent and mildly peppery raw taste.'
      ],
      de: [
        'Farbe: Durchgehend dottergelb bis aprikosenfarben.',
        'Hutunterseite: LEISTEN (dicke, stumpfe Falten/Adern), die weit am Stiel herablaufen. Nicht vom Hutfleisch abziehbar.',
        'Hut: Unregelmäßig gelappt und gewellt, im Alter trichterförmig vertieft.',
        'Fleisch: Im Inneren weiß bis cremefarben, fruchtiger Duft nach getrockneten Aprikosen, leicht pfeffriger Geschmack.'
      ],
      ja: [
        '色：全体が鮮やかな卵黄色〜杏色（アプリコット色）。',
        '傘の裏面：太く鈍い「しわひだ（偽ひだ）」が柄に長く垂生し、傘の肉から分離できない。',
        '傘：縁が波打ち、成熟するとじょうご形（漏斗状）に窪む。',
        '肉：内部は白色〜淡黄色で、乾燥アンズのような甘い芳香と、わずかにスパイシーな風味がある。'
      ]
    },
    lookalikes: {
      fr: [
        '❌ Omphalotus olearius (Pleurote de l’olivier) - TRÈS TOXIQUE : Pousse en touffes DIRECTEMENT SUR LE BOIS/SOUCHES, vraies lamelles fines et coupantes, odeur d’huile.',
        '❌ Hygrophoropsis aurantiaca (Fausse girolle) - SANS VALEUR : Chapeau orangé feutré mince, vraies lamelles serrées minces et fourchues, pied creux noir à la base.'
      ],
      en: [
        '❌ Omphalotus olearius (Jack-o\'-Lantern) - TOXIC: Grows in dense clusters directly on wood/stumps, sharp blade-like true gills.',
        '❌ Hygrophoropsis aurantiaca (False Chanterelle) - INEDIBLE: Flimsy orange cap, thin knife-sharp crowded true gills, hollow dark base stem.'
      ],
      de: [
        '❌ Omphalotus olearius (Ölbaumpilz) - GIFTIG: Wächst büschelig direkt an Holz/Wurzeln, echte scharfe Lamellen.',
        '❌ Hygrophoropsis aurantiaca (Falscher Pfifferling) - UNGENIESSBAR: Dünnfleischiger oranger Hut, engstehende blättrige echte Lamellen, hohler dunkler Stiel.'
      ],
      ja: [
        '❌ ツキヨタケ近縁種 (Omphalotus) - 毒：枯れ木や切り株に群生し、薄く鋭い「真正ひだ」を持つ。強い胃腸毒。',
        '❌ ヒロハアンズタケ / ニセアンズタケ (Hygrophoropsis) - 食不適：肉が薄く、密な刃状の薄いひだがあり、柄の基部が黒ずむ。'
      ]
    },
    ruleOfThumb: {
      fr: 'RÈGLE D’OR : Les girolles ont des plis mousses arrondis (pas de lamelles coupantes) et poussent au sol, jamais en touffe sur du bois vivant.',
      en: 'RULE OF THUMB: Chanterelles possess blunt folds (not paper-thin gills) and grow strictly from soil, never clustered on wood.',
      de: 'FAUSTREGEL: Pfifferlinge haben stumpfe Leisten (keine schneidenden Lamellen) und wachsen am Waldboden, niemals büschelig auf Holz.',
      ja: '安全の鉄則：アンズタケは刃のような薄いひだではなく丸みのある「しわ」であり、木からではなく必ず地面の土から単生・群生します。'
    }
  },

  hydnum: {
    idKeys: {
      fr: [
        'Sous le chapeau : Couvert de NOMBREUX PETITS AIGUILLONS (dents molles) verticaux. AUCUNE LAMELLE, AUCUN TUBE.',
        'Chapeau : Chamois crème, beige ocré à saumoné pâle, sec, bosselé à marge sinueuse.',
        'Pied : Trapu, solide, souvent excentré, cassant comme de la craie, blanc à crème.',
        'Chair : Ferme et cassante, odeur agréable de sous-bois avec une finale légèrement poivrée en vieillissant.'
      ],
      en: [
        'Underside: Covered in soft downward-pointing SPINES (TEETH). NO GILLS, NO PORES. Detach easily when rubbed.',
        'Cap: Creamy-buff, pale ochre to salmon-beige, dry, irregular wavy margin.',
        'Stem: Stout, off-center, solid, whitish to pale cream.',
        'Flesh: Firm, brittle, white to cream. Pleasant woodland aroma with a mildly peppery finish.'
      ],
      de: [
        'Hutunterseite: Dicht mit zarten herabhängenden STACHELN besetzt. KEINE LAMELLEN, KEINE RÖHREN. Stacheln lassen sich leicht abstreifen.',
        'Hut: Cremegelb bis semmelfarben/ocker, matt-trocken, unregelmäßig verbogen.',
        'Stiel: Kräftig, dicklich, oft asymmetrisch, bricht kreidig.',
        'Fleisch: Fest, brüchig, weißlich. Angenehmer Pilzgeruch mit pikanter Pfeffernote im Alter.'
      ],
      ja: [
        '傘の裏面：柔らかい「針状の突起（針/棘）」が密集して垂れ下がる。ヒダも管孔も無い。指でなぞるとポロポロ取れる。',
        '傘：クリーム淡黄色〜サーモンベージュ色、乾いており、縁は不規則に波打つ。',
        '柄：頑丈で太く、中心から偏ることが多く、チョークのように折れやすい。',
        '肉：緻密で硬く脆い。心地よいキノコ臭と、加熱するとまろやかなコクが出る。'
      ]
    },
    lookalikes: {
      fr: [
        '✅ ZÉRO CONFUSION TOXIQUE : Il n’existe AUCUN champignon à aiguillons toxique en Europe.',
        '⚠️ Hydnum rufescens (Pied-de-mouton roussissant) - COMESTIBLE : Plus petit, chapeau roux orangé, tout aussi délicieux.',
        '⚠️ Sarcodon / Hydnellum - AMERS : Aiguillons foncés gris/brun, chair dure ou liégeuse immangeable.'
      ],
      en: [
        '✅ ZERO TOXIC LOOKALIKES: There are NO poisonous toothed/spined fungi in Europe.',
        '⚠️ Hydnum rufescens (Terracotta Hedgehog) - EDIBLE: Smaller, reddish-orange cap, equally choice edible.',
        '⚠️ Sarcodon / Hydnellum (Tooth fungi) - INEDIBLE: Dark grey/brown teeth, tough or leathery unpalatable flesh.'
      ],
      de: [
        '✅ NULL VERGIFTUNGSGEFAHR: In Europa gibt es KEINE giftigen Stachelpilze.',
        '⚠️ Hydnum rufescens (Rotgelber Stoppelpilz) - ESSBAR: Zarter, orangerot gefärbt, vorzüglicher Speisepilz.',
        '⚠️ Sarcodon / Hydnellum (Korkstachelinge) - UNGENIESSBAR: Dunkle Stacheln, zähes, bitteres Fleisch.'
      ],
      ja: [
        '✅ 毒キノコの混同ゼロ：ヨーロッパおよび日本において、針（トゲ）状の裏面を持つ毒キノコは存在しません。',
        '⚠️ カノシタ近縁種 (Hydnum rufescens) - 可食：やや小型で赤みが強く、同様に美味。',
        '⚠️ コウタケ・シシタケ類 (Sarcodon) - 食不適/硬質：針が灰黒褐色で肉が硬質または苦いもの。'
      ]
    },
    ruleOfThumb: {
      fr: 'RÈGLE D’OR : Si un champignon terrestre beige a des aiguillons mous sous le chapeau qui tombent au toucher, c’est un pied-de-mouton sûr à 100 % !',
      en: 'RULE OF THUMB: If a cream/beige ground mushroom has soft spines that detach easily under the cap, it is a 100% safe hedgehog mushroom.',
      de: 'FAUSTREGEL: Hat ein semmelfarbener Bodenpilz zarte abstreifbare Stacheln unter dem Hut, ist er zu 100 % ein sicherer Semmel-Stoppelpilz.',
      ja: '安全の鉄則：地面から生える淡黄色〜ベージュのキノコで、傘裏がポロポロ落ちる柔らかな針状であれば、100%安全なカノシタです。'
    }
  },

  craterellus_cornucopioides: {
    idKeys: {
      fr: [
        'Forme : Corolle en entonnoir évasé ou trompette, ENTIÈREMENT CREUSE du sommet jusqu’à la base.',
        'Couleur : Noir de suie à gris anthracite par temps humide, séchant en gris cendré.',
        'Surface fertile : La face externe est presque lisse ou finement ridée (PAS DE LAMELLES, PAS DE TUBES).',
        'Chair : Très mince, élastique, noire. Arôme parfumé puissant évoquant la truffe noire.'
      ],
      en: [
        'Shape: Deep fluted horn/trumpet, COMPLETELY HOLLOW from the rim all the way to the stem base.',
        'Color: Soot-black when damp, drying to ash-gray or charcoal brown.',
        'Fertile Surface: Outer surface is nearly smooth or faintly wrinkled (NO GILLS, NO PORES).',
        'Flesh: Thin, elastic, dark gray/black. Intense rich perfume reminiscent of black truffles.'
      ],
      de: [
        'Form: Tief trompeten- oder trichterförmig, DURCHGEHEND HOHL vom Hutrand bis zur Stielbasis.',
        'Farbe: Feucht tief rußschwarz, trocken aschgrau bis braunschwarz.',
        'Fruchtschicht: Außenseite fast glatt bis leicht geadert/runzelig (KEINE LAMELLEN, KEINE RÖHREN).',
        'Fleisch: Dünn, zäh-elastisch, schwarzgrau. Würziger aromatischer Trüffelduft.'
      ],
      ja: [
        '形状：深い漏斗状〜トランペット型で、傘の先端から柄の根元まで完全に筒状に中空。',
        '色：湿時はすす黒色（漆黒）、乾燥時は灰黒色〜チャコールグレー。',
        '実生面：外面はほぼ平滑か、わずかにしわがある程度（ヒダも管孔も無い）。',
        '肉：薄く弾力があり、乾燥させると黒トリュフのような濃厚な芳香を放つ。'
      ]
    },
    lookalikes: {
      fr: [
        '✅ AUCUN SOSIE DANGEREUX : Impossible à confondre avec une espèce toxique en Europe.',
        '⚠️ Craterellus cinereus (Chanterelle cendrée) - COMESTIBLE : Forme similaire mais face externe ornée de vrais plis grisâtres bien formés.'
      ],
      en: [
        '✅ ZERO DANGEROUS LOOKALIKES: Impossible to confuse with any toxic European species.',
        '⚠️ Craterellus cinereus (Ashen Chanterelle) - EDIBLE: Similar shape but outer surface has distinct grayish folds.'
      ],
      de: [
        '✅ KEINE GEFÄHRLICHEN VERWECHSLUNGEN: Mit keinem Giftpilz in Europa zu verwechseln.',
        '⚠️ Craterellus cinereus (Graue Kraterelle) - ESSBAR: Ähnlich, hat aber deutliche graue Leisten an der Außenseite.'
      ],
      ja: [
        '✅ 毒キノコとの誤認の危険なし：ヨーロッパおよび日本に類似する毒キノコは存在しません。',
        '⚠️ クロアンズタケ類 (Craterellus cinereus) - 可食：外側に明瞭なしわひだを持つ類似種。'
      ]
    },
    ruleOfThumb: {
      fr: 'RÈGLE D’OR : Une corne noire élastique et complètement creuse sans lamelles est une trompette de la mort délicieuse et sans risque.',
      en: 'RULE OF THUMB: An elastic, completely hollow black trumpet without gills is an unmistakable gourmet Black Trumpet.',
      de: 'FAUSTREGEL: Eine zähe, durchgehend hohle schwarze Trompete ohne Lamellen ist immer eine vorzügliche Totentrompete.',
      ja: '安全の鉄則：ヒダがなく、根元まで中空の黒いトランペット型のキノコは、安全で極上の風味を持つクロラッパタケです。'
    }
  },

  craterellus_tubaeformis: {
    idKeys: {
      fr: [
        'Sous le chapeau : Plis épais (fausses lamelles) ramifiés, gris-jaunâtre, décurrents sur le pied.',
        'Pied : Fin, élancé, JAUNE D’OR À ORANGÉ VIF, entièrement creux comme une paille.',
        'Chapeau : Brunâtre à gris-brun, percé en son centre d’un trou débouchant dans le pied creux.',
        'Saison : Pousse en grand nombre à la fin de l’automne et résiste aux premières gelées d’hiver.'
      ],
      en: [
        'Underside: Blunt, branching decurrent FALSE GILLS (ribs/veins), yellowish-gray to brownish.',
        'Stem: Slender, bright GOLDEN-YELLOW to orange-ochre, completely HOLLOW like a straw.',
        'Cap: Funnel-shaped brownish cap with a hole piercing straight through into the hollow stem.',
        'Season: Prolific in late autumn through frosty winter (October to January).'
      ],
      de: [
        'Hutunterseite: Dickliche, gegabelte herablaufende LEISTEN, graugelblich bis ockerbraun.',
        'Stiel: Schlank, leuchtend GOLDGELB bis dottergelb, strohhalmartig vollkommen HOHL.',
        'Hut: Trichterförmig braungrau mit charakteristischem Loch in der Mitte, das in den Stiel führt.',
        'Saison: Spätherbst bis in frostige Wintertage (Oktober bis Januar).'
      ],
      ja: [
        '傘の裏面：太く分岐して柄に長く垂生する「しわひだ」。灰黄色〜淡褐色。',
        '柄：細長く、鮮やかな黄金色〜橙黄色で、ストローのように完全な中空。',
        '傘：暗褐色〜灰褐色の漏斗状で、中心に柄の中空へと続く明瞭な穴が開く。',
        '時期：晩秋から初冬（10月〜1月）の霜が降りる時期まで大群生する。'
      ]
    },
    lookalikes: {
      fr: [
        '✅ Pas de sosie toxique : Les fausses girolles ont des lamelles coupantes fines et un pied sombre plein.',
        '⚠️ Cantharellus lutescens (Chanterelle jaunissante) - EXCELLENT COMESTIBLE : Face fertile presque lisse, parfum fruité intense.'
      ],
      en: [
        '✅ No toxic lookalikes: False chanterelles have thin knife-sharp blade gills and solid dark stems.',
        '⚠️ Craterellus lutescens (Yellow Foot Chanterelle) - CHOICE EDIBLE: Nearly smooth fertile folds, intense apricot scent.'
      ],
      de: [
        '✅ Keine Giftpilze: Falsche Pfifferlinge haben echte messerscharfe Lamellen und volle dunkle Stiele.',
        '⚠️ Craterellus lutescens (Starkriechender Trompetenpfifferling) - HERVORRAGEND: Glättere Unterseite, intensiver Fruchtduft.'
      ],
      ja: [
        '✅ 危険な毒キノコなし：ニセアンズタケは薄く鋭いひだを持ち、柄の内部が充実して黒ずむ。',
        '⚠️ アンズタケモドキ (Craterellus lutescens) - 極上食菌：傘裏のしわがより平滑で強い芳香。'
      ]
    },
    ruleOfThumb: {
      fr: 'RÈGLE D’OR : Petit champignon d’hiver à pied jaune vif creux et plis fourchus = chanterelle en tube sans danger.',
      en: 'RULE OF THUMB: A hollow bright-yellow stem with blunt folds found in chilly late autumn is a safe Yellowfoot.',
      de: 'FAUSTREGEL: Ein Spätherbstpilz mit hohlem gelbem Stiel und gegabelten Leisten ist ein sicherer Trompetenpfifferling.',
      ja: '安全の鉄則：晩秋〜初冬に見られる、鮮やかな黄色い中空の柄と二股に分かれたしわひだを持つキノコはキアシアンズタケです。'
    }
  },

  imleria_badia: {
    idKeys: {
      fr: [
        'Pores/Tubes : Tubes fins crème puis jaune-verdâtre, BLEUISSANT IMMÉDIATEMENT à la pression du doigt.',
        'Chapeau : Brun baie à châtain foncé, velouté par temps sec, devenant viscidule par temps pluvieux.',
        'Pied : Cylindrique, brun clair à ochracé fibrilleux, SANS RÉSEAU en relief (aucun maillage blanc ni noir).',
        'Chair : Blanche à jaunâtre, se teintant doucement de bleu pâle juste au-dessus des tubes.'
      ],
      en: [
        'Pores: Pale yellow to olive-yellow tubes, bruising INSTANT DARK BLUE/CYAN when touched.',
        'Cap: Rich bay to chestnut brown, velvety dry becoming slightly tacky in wet weather.',
        'Stem: Solid cylindrical, fibrillose brown WITHOUT raised netting (no white mesh, no dark mesh).',
        'Flesh: White to yellowish, slowly turning pale blue directly above the tube layer.'
      ],
      de: [
        'Röhren: Feinporig, blassgelb bis olivgrünlich, BLÄUEN BEI DRUCK SOFORT intensiv blaugrün.',
        'Hut: Kastanien- bis maronenbraun, trocken samtig, feucht fettig-schmierig.',
        'Stiel: Braungelb längsfaserig, OHNE Netzmuster (weder weißes noch schwarzes Netz).',
        'Fleisch: Fest, weißlich-gelb, bläut im Schnitt vor allem über den Röhren.'
      ],
      ja: [
        '管孔（裏面）：淡黄色〜オリーブ黄色で、指で触れると瞬時に濃い青緑色に変色（青変）する。',
        '傘：豊かな栗褐色〜暗褐色。乾燥時はビロード状、雨天時はややぬめりが出る。',
        '柄：繊維状の褐色で、網目模様は一切ない（白や黒の網目が無い）。',
        '肉：緻密で白〜淡黄色、管孔のすぐ上の肉が穏やかに青変する。'
      ]
    },
    lookalikes: {
      fr: [
        '❌ Tylopilus felleus (Bolet de fiel) - AMER IMMANGEABLE : Pores rosâtres ne bleuisssant pas, gros réseau sombre bien visible sur le pied.',
        '❌ Rubroboletus satanas (Bolet satan) - TOXIQUE : Pores rouge sang, chapeau grisâtre, ne pousse pas sous les conifères acides.'
      ],
      en: [
        '❌ Tylopilus felleus (Bitter Bolete) - INEDIBLE: Pores turn pinkish and do not bruise blue, coarse dark netting on stem.',
        '❌ Rubroboletus satanas (Devil\'s Bolete) - POISONOUS: Blood-red pores, pale chalky cap, calciphilous.'
      ],
      de: [
        '❌ Tylopilus felleus (Gallenröhrling) - EXTREM BITTER: Röhren rosa, bläuen nicht, grobes dunkles Netz.',
        '❌ Rubroboletus satanas (Satansröhrling) - GIFTIG: Blutrote Röhren, heller kalkweißer Hut.'
      ],
      ja: [
        '❌ ニガイグチ (Tylopilus felleus) - 苦痛な苦味：管孔はピンク色で青変せず、柄に明瞭な黒褐色の網目がある。',
        '❌ サタンイグチ (Rubroboletus satanas) - 毒：管孔が血のような赤色で、傘はチョーク白。'
      ]
    },
    ruleOfThumb: {
      fr: 'RÈGLE D’OR : Chapeau brun, pores jaunes qui bleuissent au toucher et pied sans réseau = délicieux bolet bai.',
      en: 'RULE OF THUMB: Brown cap, yellow pores that turn instantly blue when touched, and stem without netting = delicious Bay Bolete.',
      de: 'FAUSTREGEL: Brauner Hut, auf Druck bläuende gelbe Röhren und stielnetzlos = echte Marone.',
      ja: '安全の鉄則：茶色の傘、触ると青く変色する黄色い管孔、そして柄に網目が無いイグチは安全で美味なニセイロガワリです。'
    }
  },

  laetiporus_sulphureus: {
    idKeys: {
      fr: [
        'Aspect : Consoles imbriquées étagées, d’un JAUNE SOUFRE ET ORANGE ÉCLATANT très voyant.',
        'Support : Pousse directement sur les troncs d’arbres vivants ou morts (surtout vieux chênes).',
        'Pores : Face inférieure d’un jaune soufre vif avec de minuscules pores fins.',
        'Chair : Tendre et juteuse chez les jeunes spécimens, goût et texture rappelant la chair de poulet.'
      ],
      en: [
        'Appearance: Bracket shelves in tiered rosettes, vivid NEON SULFUR-YELLOW and bright peach-orange.',
        'Substrate: Grows directly on living hardwood tree trunks or dead standing logs (primarily Oak).',
        'Pores: Vivid sulfur-yellow underside composed of tiny minute pores.',
        'Flesh: Soft and succulent when young, cooked flavor and fibrous texture remarkably similar to chicken breast.'
      ],
      de: [
        'Aussehen: Dachziegelartig übereinanderstehende Konsolen, leuchtend SCHWEFELGELB bis orangerot.',
        'Substrat: Wächst direkt an Laubbäumen und Baumstämmen (bevorzugt alte Eichen).',
        'Poren: Unterseite leuchtend schwefelgelb mit winzigen Poren.',
        'Fleisch: Jung saftig-weich, gegart in Textur und Geschmack erstaunlich hähnchenfleischartig.'
      ],
      ja: [
        '外見：鮮やかな硫黄のような黄色（サルファーイエロー）と鮮明な橙色の重なり合う棚状（扇状）。',
        '発生場所：生きた広葉樹（特にコナラ・ミズナラ・ブナ）の幹や枯れ木から直接張り出す。',
        '裏面：鮮黄色で微細な管孔が密集する。',
        '肉：幼菌時は柔らかくジューシーで、加熱調理すると鶏肉のささみそっくりの繊維感と食感がある。'
      ]
    },
    lookalikes: {
      fr: [
        '✅ ZÉRO SOSIE TOXIQUE : Sa couleur jaune soufre fluorescent sur chêne le rend unique au monde.',
        '⚠️ Précautions : Ne consommez que les bords tendres des jeunes spécimens. Bien cuire. Éviter sur les résineux toxiques (If).'
      ],
      en: [
        '✅ ZERO TOXIC LOOKALIKES: The fluorescent sulfur-yellow brackets on deciduous trees are unmistakable.',
        '⚠️ Precautions: Harvest only the tender outer edges of young specimens. Cook thoroughly. Avoid harvesting from Yew trees.'
      ],
      de: [
        '✅ KEINE GIFTIGEN VERWECHSLUNGEN: Die leuchtende schwefelgelbe Färbung an Eichen ist unverkennbar.',
        '⚠️ Vorsicht: Nur junge weiche Randbereiche verwerten. Gut durchgaren. Nicht an giftigen Eiben ernten.'
      ],
      ja: [
        '✅ 毒キノコとの誤認なし：広葉樹の幹に生える蛍光がかった鮮黄色の棚状キノコは唯一無二。',
        '⚠️ 注意：若く柔らかい縁の部分のみを採取し、必ず十分に加熱調理してください。有毒なイチイの木に生えたものは避けてください。'
      ]
    },
    ruleOfThumb: {
      fr: 'RÈGLE D’OR : De grandes étagères jaune soufre vif sur un tronc de chêne = poulet des bois sans danger.',
      en: 'RULE OF THUMB: Bright sulfur-yellow tiered brackets on an oak trunk = safe Chicken of the Woods.',
      de: 'FAUSTREGEL: Leuchtend schwefelgelbe Konsolen an Eichen = sicherer Schwefelporling.',
      ja: '安全の鉄則：ナラやブナの樹幹から生える鮮烈な硫黄色の棚状キノコは、安全で美味しいマスタケです。'
    }
  },

  macrolepiota_procera: {
    idKeys: {
      fr: [
        'Taille : GÉANT (chapeau dépassant 15 à 35 cm de diamètre une fois étalé).',
        'Pied : Long, orné de zébrures brunâtres en peau de serpent (tigré).',
        'Anneau : DOUBLE ANNEAU ÉPAIS COULISSANT LIBREMENT le long du pied comme une bague.',
        'Chapeau : Mamelonné au centre, recouvert d’écailles concentriques brunes sur fond crème.'
      ],
      en: [
        'Size: GIANT (cap expands to 15–35 cm in diameter when fully open).',
        'Stem: Tall and slender with a distinct snakeskin zigzag brown pattern (tigré).',
        'Ring: Thick double ring that SLIDES FREELY up and down the stem like a finger ring.',
        'Cap: Central dark umbo with concentric shaggy brown scales on a whitish background.'
      ],
      de: [
        'Größe: RIESIG (Hutdurchmesser 15–35 cm bei ausgewachsenen Exemplaren).',
        'Stiel: Schlank, markant genattert (wie eine Schlangenhaut braun gezont).',
        'Ring: Dicker, doppelter Ring, der sich FREI AUF DEM STIEL VERSCHIEBEN lässt.',
        'Hut: Dunkler Mittelbuckel, zur Peripherie hin mit groben braunen Schuppen auf hellem Grund.'
      ],
      ja: [
        '大きさ：巨大（傘を開くと直径15〜35cmに達する大型キノコ）。',
        '柄：非常に長く、表面に蛇皮のような褐色の段だら（ヘビ皮模様）がある。',
        'つば：厚い二重の「つば」があり、柄の周りを指輪のように上下に自由に動かせる（可動性）。',
        '傘：中央に暗色の突起があり、周囲に粗い褐色の鱗片が同心円状に広がる。'
      ]
    },
    lookalikes: {
      fr: [
        '❌ Petites lépiotes (Lepiota spp.) - MORTELLES : Diamètre inférieur à 10 cm, pied non tigré, anneau fixe. Ne jamais ramasser de petites lépiotes !',
        '❌ Chlorophyllum venenatum (Lépiote de Morgan) - TOXIQUE : Sporée verdâtre, chair devenant saumon au grattage.'
      ],
      en: [
        '❌ Small Dapperlings (Lepiota spp.) - DEADLY: Cap diameter under 10 cm, no snakeskin pattern, fixed ring. NEVER harvest small parasols!',
        '❌ Chlorophyllum molybdites (False Parasol) - TOXIC: Greenish spore print, flesh bruises saffron.'
      ],
      de: [
        '❌ Kleine Schirmlinge (Lepiota spp.) - TÖDLICH GIFTIG: Hutdurchmesser unter 10 cm, ungenatterter Stiel, fester Ring. Niemals kleine Schirmlinge sammeln!',
        '❌ Chlorophyllum venenatum (Gift-Riesenschirmling) - GIFTIG: Grüner Sporenstaub, Fleisch rötet rasch.'
      ],
      ja: [
        '❌ 小型キツネノカラカサ類 (Lepiota) - 猛毒（死亡例あり）：傘の直径が10cm未満、柄にヘビ皮模様がなく、つばが動かない。小型種は絶対に採らない！',
        '❌ オオシロカラカサタケ (Chlorophyllum) - 毒：成熟するとひだが緑灰色になり、肉が赤変する。'
      ]
    },
    ruleOfThumb: {
      fr: 'RÈGLE D’OR : Seuls les très grands spécimens (>15 cm) à pied tigré et anneau coulissant librement sont comestibles.',
      en: 'RULE OF THUMB: Only huge specimens (>15 cm) with snakeskin stem and freely sliding ring are safe to forage.',
      de: 'FAUSTREGEL: Nur Riesenschirmlinge (>15 cm) mit genattertem Stiel und verschiebbarem Ring sind sicher essbar.',
      ja: '安全の鉄則：傘が15cm以上の大型で、柄にヘビ皮模様があり、つばが自由にスライドするものだけを採取してください。'
    }
  },

  suillus_luteus: {
    idKeys: {
      fr: [
        'Chapeau : Brun chocolat à ochracé, très visqueux et collant par temps humide.',
        'Pores/Tubes : Jaune vif au début, anguleux, ne bleuissant pas.',
        'Pied & Anneau : Présence d’un anneau membraneux violacé/blanchâtre laissant des résidus sur le haut du pied.',
        'Arbre hôte : Pousse EXCLUSIVEMENT sous les pins (Pinus) à deux aiguilles.'
      ],
      en: [
        'Cap: Chocolate brown to yellowish-brown, covered in a slimy gelatinous peel when damp.',
        'Pores: Bright yellow young angular tubes, not bruising blue.',
        'Ring: Membrane ring with purplish-white veil remnants on the upper stem.',
        'Host Tree: Strictly mycorrhizal under two-needle Pine trees (Pinus).'
      ],
      de: [
        'Hut: Schokoladen- bis gelbbraun, bei Feuchtigkeit stark schleimig-klebrig.',
        'Röhren: Leuchtend gelb, eckig, nicht bläuend.',
        'Ring: Weiß-violetter häutiger Schleierring am oberen Stielbereich.',
        'Begleitbaum: Streng an Kiefern (Pinus) gebunden.'
      ],
      ja: [
        '傘：チョコレート褐色〜黄褐色で、湿ると厚い粘液層（ぬめり）に覆われる。',
        '管孔（裏面）：鮮黄色で角型、傷ついても青変しない。',
        'つば：柄の上部に膜質の明瞭なつば（白〜淡紫色）がある。',
        '共生樹：二葉マツ（アカマツ・クロマツ・ヨーロッパアカマツ）の樹下に限定して発生する。'
      ]
    },
    lookalikes: {
      fr: [
        '✅ ZÉRO SOSIE DANGEREUX : Aucun Suillus n’est toxique en Europe.',
        '⚠️ Suillus granulatus (Bolet granulé) - COMESTIBLE : Similaire mais dépourvu d’anneau.',
        '⚠️ Recommandation culinaire : Retirer impérativement la cuticule visqueuse avant cuisson pour éviter les désagréments digestifs.'
      ],
      en: [
        '✅ ZERO DANGEROUS LOOKALIKES: No Suillus species in Europe is poisonous.',
        '⚠️ Suillus granulatus (Weeping Bolete) - EDIBLE: Similar but lacks a membranous ring.',
        '⚠️ Culinary Note: Always peel off the slimy cap cuticle before cooking to prevent laxative effects.'
      ],
      de: [
        '✅ KEINE GEFÄHRLICHEN GIFTIGEN ARTEN: Keine Schmierröhrlinge in Europa sind giftig.',
        '⚠️ Suillus granulatus (Körnchen-Röhrling) - ESSBAR: Ähnlich, hat aber keinen Ring.',
        '⚠️ Küchenhinweis: Die schleimige Huthaut vor der Zubereitung stets abziehen.'
      ],
      ja: [
        '✅ 毒キノコとの危険な混同なし：ヌメリイグチ属に猛毒菌はありません。',
        '⚠️ チチアワタケ (Suillus granulatus) - 可食：つばが無い類似種。',
        '⚠️ 調理上の注意：消化不良を防ぐため、傘のぬめり（表皮）を剥いてから加熱調理してください。'
      ]
    },
    ruleOfThumb: {
      fr: 'RÈGLE D’OR : Champignon gluant sous les pins avec un anneau et des tubes jaunes = nonnette voilée comestible (peler le chapeau).',
      en: 'RULE OF THUMB: Slimy bolete under pines with a ring and yellow tubes = safe Slippery Jack (peel the cap skin).',
      de: 'FAUSTREGEL: Schleimiger Röhrenpilz unter Kiefern mit Stielring = essbarer Butterpilz (Huthaut abziehen).',
      ja: '安全の鉄則：マツの木の下に生える、つばと黄色い管孔を持つぬめり気のあるイグチは安全なヌメリイグチです（表皮を剥いて調理）。'
    }
  }
};

const SECTION_HEADERS: Record<SupportedLocale, {
  habitat: string;
  soil: string;
  season: string;
  idKeys: string;
  lookalikes: string;
  hotlines: string;
  telemetry: string;
  suitability: string;
  weatherTrigger: string;
  probability: string;
  soilPH: string;
  hostTrees: string;
  rainSum: string;
  soilTemp: string;
}> = {
  fr: {
    habitat: 'Habitat & Essences hôtes',
    soil: 'Préférence de sol',
    season: 'Fenêtre de pousse',
    idKeys: '🔍 Critères positifs d’identification sur le terrain',
    lookalikes: '⚠️ Confusions possibles & sosies toxiques',
    hotlines: '🚑 Numéros d’urgence des centres anti-poison',
    telemetry: '📍 TÉLÉMÉTRIE DU POINT DE CUEILLETTE',
    suitability: 'Indice d’habitabilité (Sol & Arbres)',
    weatherTrigger: 'Déclencheur météo (Pluie 14j & Température)',
    probability: 'Probabilité globale de fructification',
    soilPH: 'pH du sol',
    hostTrees: 'Arbres dominants',
    rainSum: 'Cumul de pluie 14j',
    soilTemp: 'Température du sol'
  },
  en: {
    habitat: 'Habitat & Host Trees',
    soil: 'Soil Preference',
    season: 'Growth Season Window',
    idKeys: '🔍 Positive Field Identification Keys',
    lookalikes: '⚠️ Toxic & Inedible Lookalikes (Safety Guide)',
    hotlines: '🚑 Regional Poison Control Hotlines',
    telemetry: '📍 FORAGING SITE TELEMETRY',
    suitability: 'Habitat Suitability (Soil & Trees)',
    weatherTrigger: 'Weather Trigger Index (14d Rain & Soil Temp)',
    probability: 'Overall Fruiting Probability',
    soilPH: 'Soil pH',
    hostTrees: 'Dominant Trees',
    rainSum: '14-Day Rain Sum',
    soilTemp: 'Soil Temp'
  },
  de: {
    habitat: 'Habitat & Begleitbäume',
    soil: 'Bodenpräferenz',
    season: 'Wachstumszeitraum',
    idKeys: '🔍 Positive Feld-Bestimmungsmerkmale',
    lookalikes: '⚠️ Giftige & ungenießbare Verwechslungen (Sicherheitshinweis)',
    hotlines: '🚑 Giftnotruf-Zentralen & Notrufnummern',
    telemetry: '📍 STANDORT-TELEMETRIE',
    suitability: 'Habitat-Eignung (Boden & Bäume)',
    weatherTrigger: 'Wetter-Trigger-Index (14-Tage-Regen & Bodentemp.)',
    probability: 'Gesamte Fruchtungswahrscheinlichkeit',
    soilPH: 'Boden-pH',
    hostTrees: 'Dominante Baumarten',
    rainSum: '14-Tage-Regensumme',
    soilTemp: 'Bodentemperatur'
  },
  ja: {
    habitat: '生息環境・共生樹種',
    soil: '土壌特性',
    season: '発生時期',
    idKeys: '🔍 野外における確実な同定ポイント',
    lookalikes: '⚠️ 類似する毒キノコ・混同注意（安全ガイド）',
    hotlines: '🚑 中毒事故・緊急連絡窓口',
    telemetry: '📍 採取ポイントの環境テレメトリ',
    suitability: '環境適合度 (土壌・樹種)',
    weatherTrigger: '気象発生トリガー (14日積算降雨・地温)',
    probability: '総合発生確率',
    soilPH: '土壌pH',
    hostTrees: '周囲の樹種',
    rainSum: '14日間積算降水量',
    soilTemp: '地温'
  }
};

const HOTLINES_DATA: Record<SupportedLocale, string[]> = {
  fr: [
    '<strong>France (CAPTV Grand Ouest Rennes/Angers) :</strong> +33 2 41 48 21 21 | SAMU : 15',
    '<strong>Allemagne (GIZ-Nord / Göttingen) :</strong> +49 551 19240 | Berlin : +49 30 19240',
    '<strong>Numéro d’urgence européen :</strong> 112'
  ],
  en: [
    '<strong>Germany (GIZ-Nord / Göttingen):</strong> +49 551 19240 | Berlin: +49 30 19240',
    '<strong>France (CAPTV Grand Ouest Rennes/Angers):</strong> +33 2 41 48 21 21 | SAMU: 15',
    '<strong>European Emergency:</strong> 112',
    '<strong>International:</strong> Contact your local emergency services or national poison control immediately.'
  ],
  de: [
    '<strong>Deutschland (GIZ-Nord / Göttingen):</strong> +49 551 19240 | Berlin: +49 30 19240',
    '<strong>Frankreich (CAPTV Grand Ouest):</strong> +33 2 41 48 21 21 | SAMU: 15',
    '<strong>Europäischer Notruf:</strong> 112'
  ],
  ja: [
    '<strong>日本中毒情報センター (中毒110番):</strong> 072-727-2499 (大阪) / 029-852-9999 (つくば)',
    '<strong>救急通報 (日本国内):</strong> 119',
    '<strong>欧州滞在時の緊急ダイヤル:</strong> 112 (EU共通) | ドイツ中毒相談: +49 551 19240 | フランス中毒相談: +33 2 41 48 21 21'
  ]
};

export class FieldGuideService {
  /**
   * Generates clean semantic HTML for the Field Guide modal or display view.
   */
  static generateFieldGuideHtml(
    speciesId: SpeciesId,
    locale: SupportedLocale = currentLocale.value,
    options?: {
      includeTopActions?: boolean;
      telemetry?: ForagingWaypoint;
    }
  ): string {
    const loc = SECTION_HEADERS[locale] ? locale : 'fr';
    const headers = SECTION_HEADERS[loc];
    const details = SPECIES_DETAILS[speciesId];
    const guide = FIELD_GUIDE_DATA[speciesId];
    const formattedTitle = getSpeciesDisplayName(speciesId, loc);

    const idKeysList = guide?.idKeys[loc] || guide?.idKeys.fr || [];
    const lookalikesList = guide?.lookalikes[loc] || guide?.lookalikes.fr || [];
    const rule = guide?.ruleOfThumb[loc] || guide?.ruleOfThumb.fr || '';
    const hotlines = HOTLINES_DATA[loc] || HOTLINES_DATA.fr;

    let telemetryHtml = '';
    if (options?.telemetry) {
      const wpt = options.telemetry;
      telemetryHtml = `
        <div class="field-guide-telemetry" style="background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.3); border-radius:8px; padding:1rem; margin-bottom:1rem;">
          <h4 style="color:#60a5fa; margin-bottom:0.4rem;">${headers.telemetry}</h4>
          <p><strong>${headers.suitability}:</strong> ${wpt.suitabilityScore}%</p>
          <p><strong>${headers.weatherTrigger}:</strong> ${wpt.weatherScore}%</p>
          <p><strong>${headers.probability}:</strong> ${wpt.probabilityScore}%</p>
          <p><strong>${headers.soilPH}:</strong> ${wpt.soilPH.toFixed(1)} | <strong>${headers.hostTrees}:</strong> ${wpt.dominantTree}</p>
          <p><strong>${headers.rainSum}:</strong> ${wpt.rain14DaysMm}mm | <strong>${headers.soilTemp}:</strong> ${wpt.currentSoilTempC}°C</p>
        </div>
      `;
    }

    const topActionsHtml = options?.includeTopActions ? `
      <div class="field-guide-top-actions" style="display:flex; gap:0.75rem; margin-bottom:0.25rem; flex-wrap:wrap;">
        <button id="btn-guide-anatomy" class="btn btn-secondary" style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.5rem 0.9rem; font-size:0.875rem; cursor:pointer;">
          <span>🔬</span>
          <span>${i18n.value.ui.anatomyBtn}</span>
        </button>
        <button id="btn-guide-dedicated" class="btn btn-secondary" style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.5rem 0.9rem; font-size:0.875rem; cursor:pointer;">
          <span>📖</span>
          <span>${i18n.value.ui.dedicatedPageBtn}</span>
        </button>
      </div>
    ` : '';

    return `
      <div class="field-guide-wrapper" style="display:flex; flex-direction:column; gap:1.25rem;">
        ${topActionsHtml}
        ${telemetryHtml}

        <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:1rem;">
          <h4 style="color:#d8b4fe; margin-bottom:0.4rem;">🍄 ${formattedTitle}</h4>
          <p><strong>${headers.habitat}:</strong> ${details?.symbionts?.join(', ') || ''}</p>
          <p><strong>${headers.soil}:</strong> ${details?.optimalPH || ''}</p>
          <p><strong>${headers.season}:</strong> ${details?.seasonWindow || ''}</p>
        </div>

        <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:1rem;">
          <h4 style="color:#34d399; margin-bottom:0.4rem;">${headers.idKeys}</h4>
          <ul style="padding-left:1.2rem; display:flex; flex-direction:column; gap:0.35rem; margin:0;">
            ${idKeysList.map(item => `<li>${item}</li>`).join('\n')}
          </ul>
        </div>

        <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:1rem;">
          <h4 style="color:#f87171; margin-bottom:0.4rem;">${headers.lookalikes}</h4>
          <ul style="padding-left:1.2rem; display:flex; flex-direction:column; gap:0.35rem; margin:0 0 0.75rem 0;">
            ${lookalikesList.map(item => `<li>${item}</li>`).join('\n')}
          </ul>
          ${rule ? `<div style="background:rgba(239,68,68,0.2); padding:0.5rem 0.75rem; border-radius:6px; font-weight:600; color:#fecaca;">${rule}</div>` : ''}
        </div>

        <div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:1rem;">
          <h4 style="color:#fbbf24; margin-bottom:0.4rem;">${headers.hotlines}</h4>
          ${hotlines.map(h => `<p style="margin:0.25rem 0;">${h}</p>`).join('\n')}
        </div>
      </div>
    `;
  }

  /**
   * Converts the common generated HTML into clean, formatted plain text for GPX <desc> tags.
   * Replaces HTML tags to ensure 100% compatibility with standard GPS receivers and OsmAnd / Garmin apps.
   */
  static convertHtmlToGpxText(html: string): string {
    let text = html;

    // 1. Remove Top Action Buttons if present
    text = text.replace(/<div class="field-guide-top-actions"[\s\S]*?<\/div>/gi, '');

    // 2. Convert headers into distinctive text sections
    text = text.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n==================================================\n$1\n==================================================\n');

    // 3. Convert list items into bullet points
    text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n');

    // 4. Convert paragraphs & breaks to newlines
    text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n');
    text = text.replace(/<br\s*\/?>/gi, '\n');

    // 5. Convert strong / em formatting tags to simple text
    text = text.replace(/<(?:strong|b)[^>]*>(.*?)<\/(?:strong|b)>/gi, '$1');
    text = text.replace(/<(?:em|i)[^>]*>(.*?)<\/(?:em|i)>/gi, '$1');

    // 6. Strip all remaining HTML tags
    text = text.replace(/<[^>]+>/g, '');

    // 7. Decode basic HTML entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // 8. Normalize whitespace and clean up double/triple blank lines
    text = text
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return text;
  }

  /**
   * Directly generates the localized GPX description text for a waypoint.
   */
  static generateGpxDescription(wpt: ForagingWaypoint, locale: SupportedLocale = currentLocale.value): string {
    const rawHtml = this.generateFieldGuideHtml(wpt.speciesId, locale, {
      includeTopActions: false,
      telemetry: wpt
    });
    return this.convertHtmlToGpxText(rawHtml);
  }
}
