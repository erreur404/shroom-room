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
        <div class="species-header">
          <span class="species-badge" :style="{ backgroundColor: speciesDetails?.badgeColor || '#10b981' }"></span>
          <div class="species-title-group">
            <!-- Only chosen language common name and Latin unique identifier -->
            <h1 class="species-common-title">{{ speciesCommonName }}</h1>
            <h2 class="species-latin-subtitle"><em>{{ speciesLatinName }}</em></h2>
          </div>
        </div>

        <div class="notice-box">
          <span class="notice-icon">ℹ️</span>
          <div>
            <strong>{{ i18n.ui.dedicatedPageTitle }}</strong>
            <p>{{ i18n.ui.dedicatedPageNotice }}</p>
          </div>
        </div>

        <div class="species-specs-grid" v-if="speciesDetails">
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

        <div class="page-actions">
          <button class="btn btn-primary" @click="$emit('navigate', 'map')">
            🗺️ {{ i18n.ui.backToMap }}
          </button>
          <button class="btn btn-secondary" @click="$emit('navigate', 'anatomy')">
            {{ i18n.ui.anatomyBtn }}
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

const props = defineProps<{
  speciesId: SpeciesId;
}>();

defineEmits<{
  (e: 'navigate', page: 'map' | 'anatomy' | 'mushroom', speciesId?: SpeciesId): void;
}>();

const speciesCommonName = computed(() => getSpeciesCommonName(props.speciesId));
const speciesLatinName = computed(() => getSpeciesLatinName(props.speciesId));
const speciesDetails = computed(() => SPECIES_DETAILS[props.speciesId]);

function onLocaleChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  setLocale(target.value as SupportedLocale);
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
  max-width: 800px;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.species-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.species-badge {
  width: 14px;
  height: 48px;
  border-radius: 6px;
  flex-shrink: 0;
}

.species-common-title {
  margin: 0;
  font-size: 1.85rem;
  font-weight: 800;
  color: #f8fafc;
}

.species-latin-subtitle {
  margin: 0.2rem 0 0 0;
  font-size: 1.15rem;
  font-weight: 400;
  color: #38bdf8;
}

.notice-box {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 1rem 1.25rem;
  border-radius: 10px;
  margin-bottom: 1.75rem;
}

.notice-icon {
  font-size: 1.5rem;
}

.notice-box strong {
  color: #7dd3fc;
}

.notice-box p {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  color: #cbd5e1;
}

.species-specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
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
  margin-top: 1rem;
}
</style>
