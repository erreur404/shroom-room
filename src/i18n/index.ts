import { ref, computed } from 'vue';
import { SupportedLocale, TranslationSchema } from './types';
import { TRANSLATIONS, SPECIES_I18N } from './translations';
import { SpeciesId } from '../types';

const STORAGE_KEY = 'shroom_room_lang';

/**
 * Detects browser language, with strict fallback to 'fr' (French).
 */
function detectBrowserLocale(): SupportedLocale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'fr' || saved === 'en' || saved === 'de' || saved === 'ja') {
      return saved;
    }

    const browserLanguages = navigator.languages || [navigator.language || ''];
    for (const rawLang of browserLanguages) {
      const code = rawLang.toLowerCase().slice(0, 2);
      if (code === 'fr') return 'fr';
      if (code === 'en') return 'en';
      if (code === 'de') return 'de';
      if (code === 'ja') return 'ja';
    }
  } catch (e) {
    // ignore
  }
  // Fallback to french as specified by user
  return 'fr';
}

export const currentLocale = ref<SupportedLocale>(detectBrowserLocale());

export function setLocale(locale: SupportedLocale) {
  currentLocale.value = locale;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  } catch (e) {
    // ignore
  }
}

export const i18n = computed<TranslationSchema>(() => {
  return TRANSLATIONS[currentLocale.value] || TRANSLATIONS.fr;
});

/**
 * Returns formatted mushroom name using ONLY the chosen language common name and Latin unique identifier.
 * Example in FR: "Cèpe de Bordeaux (Boletus edulis)"
 * Example in EN: "King Bolete (Boletus edulis)"
 * Example in DE: "Steinpilz (Boletus edulis)"
 */
export function getSpeciesDisplayName(speciesId: SpeciesId, locale: SupportedLocale = currentLocale.value): string {
  const entry = SPECIES_I18N[speciesId];
  if (!entry) return speciesId;
  const common = entry.common[locale] || entry.common.fr;
  return `${common} (${entry.latin})`;
}

/**
 * Returns short navigation label for species using ONLY the chosen language.
 */
export function getSpeciesShortName(speciesId: SpeciesId, locale: SupportedLocale = currentLocale.value): string {
  const entry = SPECIES_I18N[speciesId];
  if (!entry) return speciesId;
  return entry.short[locale] || entry.short.fr;
}

/**
 * Returns common name only in the chosen language.
 */
export function getSpeciesCommonName(speciesId: SpeciesId, locale: SupportedLocale = currentLocale.value): string {
  const entry = SPECIES_I18N[speciesId];
  if (!entry) return speciesId;
  return entry.common[locale] || entry.common.fr;
}

/**
 * Returns Latin identifier.
 */
export function getSpeciesLatinName(speciesId: SpeciesId): string {
  const entry = SPECIES_I18N[speciesId];
  return entry ? entry.latin : speciesId;
}
