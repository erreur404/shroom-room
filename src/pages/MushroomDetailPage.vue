<template>
  <div class="mushroom-page-container">
    <header class="page-header glass-panel">
      <div class="header-left">
        <button class="btn btn-secondary back-btn" @click="$emit('navigate', 'map')" :title="i18n.ui.backToMap">
          <span class="icon">←</span>
          <span class="btn-text-label">{{ i18n.ui.backToMap }}</span>
        </button>
        <button class="btn btn-secondary" @click="$emit('navigate', 'anatomy')" :title="i18n.ui.anatomyBtn">
          <span class="icon">🔬</span>
          <span class="btn-text-label">{{ i18n.ui.anatomyBtn }}</span>
        </button>
      </div>

      <div class="header-right">
        <!-- Language Selector -->
        <div class="lang-selector-group">
          <label class="lang-label">🌐</label>
          <select class="custom-select lang-select" :value="currentLocale" @change="onLocaleChange">
            <option value="fr">🇫🇷 Français</option>
            <option value="en">🇬🇧 English</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="ja">🇯🇵 日本語</option>
          </select>
        </div>
      </div>
    </header>

    <main class="page-content">
      <div class="mushroom-card glass-panel">
        <!-- Species Header & Edibility -->
        <div class="species-header">
          <span class="species-badge" :style="{ backgroundColor: speciesDetails?.badgeColor || '#10b981' }"></span>
          <div class="species-title-group">
            <div class="species-title-row">
              <h1 class="species-common-title">{{ speciesCommonName }}</h1>
              <span class="edibility-badge" :class="'edibility-' + (idData?.edibility || 'choice')">
                {{ idData?.edibilityLabel || 'Edible' }}
              </span>
            </div>
            <h2 class="species-latin-subtitle"><em>{{ speciesLatinName }}</em></h2>
          </div>
        </div>

        <!-- PERMANENT SAFETY ALERT BOX (Universal Top Warning) -->
        <div class="safety-alert-box">
          <div class="safety-icon-wrap">
            <span class="safety-alert-icon">⚠️</span>
          </div>
          <div class="safety-text-wrap">
            <h3 class="safety-alert-title">{{ i18n.ui.safetyAlertHeader }}</h3>
            <p class="safety-alert-desc">{{ i18n.ui.safetyAlertText }}</p>
          </div>
        </div>

        <!-- SECTION 1: Field Diagnostic Checklist -->
        <section class="id-section" v-if="idData?.diagnosticChecklist?.length">
          <div class="section-title-wrap">
            <div class="section-title-icon">🔍</div>
            <div>
              <h3 class="section-title">{{ i18n.ui.diagnosticChecklistTitle }}</h3>
              <p class="section-subtitle">{{ i18n.ui.diagnosticChecklistHint }}</p>
            </div>
          </div>

          <div class="checklist-container">
            <div
              v-for="item in idData.diagnosticChecklist"
              :key="item.id"
              class="checklist-card"
            >
              <label class="checklist-label">
                <input type="checkbox" class="checklist-checkbox" />
                <div class="checklist-content">
                  <div class="checklist-header">
                    <span class="checklist-part-badge">{{ item.label }}</span>
                    <button
                      v-if="item.anatomyTarget"
                      class="anatomy-link-btn"
                      @click="$emit('navigate', 'anatomy')"
                      :title="i18n.ui.learnAnatomyLink"
                    >
                      <span>🔬 {{ i18n.ui.learnAnatomyLink }}</span>
                    </button>
                  </div>
                  <p class="checklist-desc">{{ item.description }}</p>
                </div>
              </label>
            </div>

            <!-- Spore Print Spec Note -->
            <div class="spore-spec-card">
              <span class="spore-icon">🎨</span>
              <div>
                <strong>{{ i18n.ui.sporePrintLabel }}:</strong>
                <span> {{ idData.sporePrintColor }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- SECTION 2: Dangerous Lookalikes & Toxic Traps -->
        <section class="id-section lookalikes-section" v-if="idData?.lookalikes?.length">
          <div class="section-title-wrap">
            <div class="section-title-icon">☠️</div>
            <div>
              <h3 class="section-title">{{ i18n.ui.lookalikesTitle }}</h3>
              <p class="section-subtitle">{{ i18n.ui.lookalikesSubtitle }}</p>
            </div>
          </div>

          <div class="lookalikes-grid">
            <div
              v-for="(lookalike, idx) in idData.lookalikes"
              :key="idx"
              class="lookalike-card"
              :class="'danger-' + lookalike.dangerLevel"
            >
              <div class="lookalike-card-header">
                <div class="lookalike-title-group">
                  <h4 class="lookalike-name">{{ lookalike.name }}</h4>
                  <span class="lookalike-latin"><em>{{ lookalike.latinName }}</em></span>
                </div>
                <span class="danger-badge" :class="'danger-badge-' + lookalike.dangerLevel">
                  {{ formatDangerLevel(lookalike.dangerLevel, lookalike.edibility) }}
                </span>
              </div>

              <p class="lookalike-desc">{{ lookalike.description }}</p>

              <div class="differences-wrap">
                <span class="differences-title">{{ i18n.ui.crucialDifferences }}</span>
                <ul class="differences-list">
                  <li v-for="(diff, dIdx) in lookalike.crucialDifferences" :key="dIdx">
                    {{ diff }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- SECTION 3: Ecological Habitat Profile -->
        <section class="id-section" v-if="speciesDetails">
          <div class="section-title-wrap">
            <div class="section-title-icon">🌲</div>
            <div>
              <h3 class="section-title">Ecology & Growth Season</h3>
              <p class="section-subtitle">Optimal habitat conditions for field prospecting</p>
            </div>
          </div>

          <div class="species-specs-grid">
            <div class="spec-item">
              <span class="spec-label">🌱 Guild / Type</span>
              <span class="spec-val">{{ speciesDetails.guild }}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">🌲 Host Symbionts</span>
              <span class="spec-val">{{ speciesDetails.symbionts.join(', ') }}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">🧪 Optimal Soil pH</span>
              <span class="spec-val">{{ speciesDetails.optimalPH }}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">📅 Growth Season</span>
              <span class="spec-val">{{ speciesDetails.seasonWindow }}</span>
            </div>
          </div>
        </section>

        <!-- Navigation Actions -->
        <div class="page-actions">
          <button class="btn btn-primary" @click="$emit('navigate', 'map')">
            🗺️ {{ i18n.ui.backToMap }}
          </button>
          <button class="btn btn-secondary" @click="$emit('navigate', 'anatomy')">
            🔬 {{ i18n.ui.anatomyBtn }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { currentLocale, setLocale, i18n, getSpeciesCommonName, getSpeciesLatinName } from '../i18n';
import { SupportedLocale } from '../i18n/types';
import { SpeciesId } from '../types';
import { SPECIES_DETAILS } from '../services/habitatDataService';
import { SPECIES_IDENTIFICATION_DATA, EdibilityRating } from '../services/speciesIdentificationData';

const props = defineProps<{
  speciesId: SpeciesId;
}>();

defineEmits<{
  (e: 'navigate', page: 'map' | 'anatomy' | 'mushroom', speciesId?: SpeciesId): void;
}>();

const speciesCommonName = computed(() => getSpeciesCommonName(props.speciesId));
const speciesLatinName = computed(() => getSpeciesLatinName(props.speciesId));
const speciesDetails = computed(() => SPECIES_DETAILS[props.speciesId]);
const idData = computed(() => SPECIES_IDENTIFICATION_DATA[props.speciesId]);

function onLocaleChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  setLocale(target.value as SupportedLocale);
}

function formatDangerLevel(level: string, edibility: EdibilityRating): string {
  if (level === 'deadly' || edibility === 'deadly') return '☠️ DEADLY / MORTEL';
  if (level === 'high' || edibility === 'toxic') return '⚠️ TOXIC / TOXIQUE';
  if (edibility === 'inedible') return '❌ INEDIBLE / NON-COMESTIBLE';
  if (edibility === 'caution') return '⚠️ CAUTION / AVEC PRÉCAUTION';
  return '🍴 EDIBLE / COMESTIBLE';
}
</script>

<style scoped>
.mushroom-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background: radial-gradient(circle at 50% 10%, #172033 0%, #0b0f19 80%);
  color: #f1f5f9;
  padding: 1rem 1.5rem;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  border-radius: 14px;
  margin-bottom: 1.25rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.lang-selector-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(15, 23, 42, 0.6);
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.lang-select {
  background: transparent;
  color: #f8fafc;
  border: none;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
}

.lang-select option {
  background: #0f172a;
  color: #f8fafc;
}

.page-content {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex: 1;
}

.mushroom-card {
  width: 100%;
  max-width: 900px;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.species-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.species-badge {
  width: 12px;
  height: 56px;
  border-radius: 6px;
  flex-shrink: 0;
}

.species-title-group {
  flex: 1;
}

.species-title-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.species-common-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  color: #f8fafc;
}

.species-latin-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 1.15rem;
  font-weight: 400;
  color: #38bdf8;
}

.edibility-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.8rem;
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.edibility-choice {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.4);
}

.edibility-edible {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.edibility-caution {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

/* Permanent Safety Warning Banner */
.safety-alert-box {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: rgba(239, 68, 68, 0.12);
  border: 1.5px solid rgba(239, 68, 68, 0.4);
  padding: 1.15rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.15);
}

.safety-icon-wrap {
  font-size: 1.75rem;
  line-height: 1;
}

.safety-text-wrap {
  flex: 1;
}

.safety-alert-title {
  margin: 0 0 0.35rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: #f87171;
  letter-spacing: 0.02em;
}

.safety-alert-desc {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: #fca5a5;
}

/* Sections */
.id-section {
  margin-bottom: 2.25rem;
}

.section-title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.15rem;
}

.section-title-icon {
  font-size: 1.5rem;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #f1f5f9;
}

.section-subtitle {
  margin: 0.2rem 0 0 0;
  font-size: 0.85rem;
  color: #94a3b8;
}

/* Diagnostic Checklist */
.checklist-container {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.checklist-card {
  background: rgba(30, 41, 59, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 1rem 1.15rem;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.checklist-card:hover {
  background: rgba(30, 41, 59, 0.75);
  border-color: rgba(255, 255, 255, 0.16);
}

.checklist-label {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  cursor: pointer;
  user-select: none;
}

.checklist-checkbox {
  width: 22px;
  height: 22px;
  margin-top: 0.2rem;
  accent-color: #10b981;
  cursor: pointer;
  flex-shrink: 0;
}

.checklist-content {
  flex: 1;
}

.checklist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
  flex-wrap: wrap;
}

.checklist-part-badge {
  font-size: 0.82rem;
  font-weight: 700;
  color: #38bdf8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.anatomy-link-btn {
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #7dd3fc;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.anatomy-link-btn:hover {
  background: rgba(56, 189, 248, 0.25);
  color: #bae6fd;
}

.checklist-desc {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.5;
  color: #e2e8f0;
}

.spore-spec-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 0.85rem 1rem;
  font-size: 0.9rem;
  color: #cbd5e1;
}

.spore-icon {
  font-size: 1.25rem;
}

/* Lookalikes Grid */
.lookalikes-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.lookalike-card {
  background: rgba(30, 41, 59, 0.6);
  border-radius: 12px;
  padding: 1.25rem;
  border-left: 5px solid;
}

.lookalike-card.danger-deadly {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}

.lookalike-card.danger-high {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.08);
}

.lookalike-card.danger-moderate {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
}

.lookalike-card.danger-low {
  border-color: #94a3b8;
  background: rgba(148, 163, 184, 0.08);
}

.lookalike-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.lookalike-name {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #f8fafc;
}

.lookalike-latin {
  font-size: 0.9rem;
  color: #94a3b8;
  display: block;
  margin-top: 0.15rem;
}

.danger-badge {
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.danger-badge-deadly {
  background: #ef4444;
  color: #ffffff;
}

.danger-badge-high {
  background: #f97316;
  color: #ffffff;
}

.danger-badge-moderate {
  background: #f59e0b;
  color: #ffffff;
}

.danger-badge-low {
  background: rgba(148, 163, 184, 0.3);
  color: #cbd5e1;
}

.lookalike-desc {
  margin: 0 0 1rem 0;
  font-size: 0.88rem;
  color: #cbd5e1;
  line-height: 1.45;
}

.differences-wrap {
  background: rgba(15, 23, 42, 0.65);
  border-radius: 8px;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.differences-title {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #fbbf24;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.5rem;
}

.differences-list {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.differences-list li {
  font-size: 0.88rem;
  color: #e2e8f0;
  line-height: 1.45;
}

/* Ecology Specs */
.species-specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.spec-item {
  background: rgba(30, 41, 59, 0.5);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.spec-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.spec-val {
  font-size: 0.95rem;
  font-weight: 600;
  color: #f1f5f9;
}

.page-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .mushroom-page-container {
    padding: 0.65rem;
  }
  .mushroom-card {
    padding: 1.25rem;
  }
  .species-common-title {
    font-size: 1.5rem;
  }
  .page-header {
    padding: 0.65rem 0.85rem;
  }
}
</style>
