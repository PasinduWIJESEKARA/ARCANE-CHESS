import { ArchetypeSpec, PieceArchetype } from '../types/arcane';

export const ARCHETYPE_SPECS: Record<PieceArchetype, ArchetypeSpec> = {
  king: {
    id: 'king',
    title: 'King',
    monumentName: 'Sovereign Warlord',
    heightMeters: '3.50 m',
    silhouetteNote:
      'Towering full-body armored king planted in a wide combat stance, gripping a massive two-handed greatsword plunged into the plinth.',
    sculptDetails:
      'Articulated plated greaves, tassets over carved mail skirt, broad shoulder mantle, bearded sculpted face with winged war-helm, six-point jagged crown, and two-handed greatsword.',
    subPartsCount: 28,
  },
  queen: {
    id: 'queen',
    title: 'Queen',
    monumentName: 'Enthroned Sorceress-Queen',
    heightMeters: '3.45 m',
    silhouetteNote:
      'Monumental warrior-queen seated upon a high-spired Gothic stone war-throne ready for future combat choreography.',
    sculptDetails:
      'Twin-spired Gothic stone throne with armrests, armored greaves and draped war-skirt, contoured cuirass with high standing collar, crescent-horned diadem, and upright war-mace scepter.',
    subPartsCount: 33,
  },
  bishop: {
    id: 'bishop',
    title: 'Bishop',
    monumentName: 'High Inquisitor-Prelate',
    heightMeters: '3.05 m',
    silhouetteNote:
      'Menacing warrior-priest in split ceremonial battle-robes, towering Gothic mitre, and crooked fantasy battle-crozier.',
    sculptDetails:
      'Armored greaves beneath split ceremonial vestments and stole, ribbed cuirass, tiered shoulder amice, bearded stone visage, tall split-peak mitre, iron-bound tome, and battle-crozier.',
    subPartsCount: 25,
  },
  knight: {
    id: 'knight',
    title: 'Knight',
    monumentName: 'Armored Warhorse & Lancer',
    heightMeters: '2.95 m',
    silhouetteNote:
      'Showstopper equestrian statue featuring a rearing armored warhorse and mounted great-helmed knight with shield and lance.',
    sculptDetails:
      'Barded warhorse with peytral chest armor, four articulated legs (front-right raised in charge), spiked chamfron headplate, mounted warrior in crested great-helm, heater shield, and couched war-lance.',
    subPartsCount: 36,
  },
  rook: {
    id: 'rook',
    title: 'Rook',
    monumentName: 'Siege-Breaker Juggernaut',
    heightMeters: '2.70 m',
    silhouetteNote:
      'Intimidating heavy-armored frontline siege guardian wielding a full-body tower shield and flanged war-maul.',
    sculptDetails:
      'Heavy wide-stanced plated legs, bolted waist tassets, massive slab-pauldrons and iron gorget, recessed closed frog-mouth siege-helm, planted tower pavise shield, and flanged siege war-maul.',
    subPartsCount: 26,
  },
  pawn: {
    id: 'pawn',
    title: 'Pawn',
    monumentName: 'Phalanx Stone Legionnaire',
    heightMeters: '2.25 m',
    silhouetteNote:
      'Compact full-body armored foot soldier of the same magical warrior civilization, hunched behind shield and broadsword.',
    sculptDetails:
      'Compact articulated greaves and plated cuirass, flanged pauldrons, pointed sallet war-helm with nose-guard over carved jaw, heavy angled heater shield, and upright notched arming sword.',
    subPartsCount: 24,
  },
};

export const ARCHETYPE_ORDER: PieceArchetype[] = [
  'king',
  'queen',
  'bishop',
  'knight',
  'rook',
  'pawn',
];
