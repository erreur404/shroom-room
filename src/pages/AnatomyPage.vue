<template>
  <div class="anatomy-page-container">
    <header class="anatomy-header glass-panel">
      <div class="header-left">
        <button class="btn btn-secondary back-btn" @click="$emit('navigate', 'map')" :title="i18n.ui.backToMap">
          <span class="icon">←</span>
          <span class="btn-text-label">{{ i18n.ui.backToMap }}</span>
        </button>
        <div class="anatomy-title-wrap">
          <h2>{{ i18n.ui.anatomyTitle }}</h2>
          <p class="anatomy-subtitle">{{ i18n.ui.anatomySubtitle }}</p>
        </div>
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

    <main class="anatomy-content">
      <div class="diagram-card glass-panel">
        <div class="diagram-viewport">
          <div class="diagram-canvas">
            <!-- Cleaned Base Image (no baked-in text) -->
            <img
              src="/images/mushroom-anatomy-base.png"
              alt="Mushroom Anatomy Diagram"
              class="diagram-image"
              width="738"
              height="601"
            />

            <!-- Category Titles (Left margin) -->
            <span class="anatomy-label category-label label-chapeau">
              {{ i18n.anatomy.chapeau }}
            </span>

            <span class="anatomy-label category-label label-dessous">
              {{ i18n.anatomy.dessous_du_chapeau }}
            </span>

            <span class="anatomy-label category-label label-anneau">
              {{ i18n.anatomy.anneau }}
            </span>

            <span class="anatomy-label category-label label-pied">
              {{ i18n.anatomy.pied }}
            </span>

            <span class="anatomy-label category-label label-mycelium">
              {{ i18n.anatomy.filaments_de_mycelium }}
            </span>

            <!-- Anatomical Feature Labels with Leader Lines -->
            <!-- Left-side Pointers (anchored right towards the lines) -->
            <span class="anatomy-label pointer-label label-ecailles">
              {{ i18n.anatomy.ecailles }}
            </span>

            <span class="anatomy-label pointer-label label-verrues">
              {{ i18n.anatomy.verrues }}
            </span>

            <span class="anatomy-label pointer-label label-aiguillons">
              {{ i18n.anatomy.aiguillons }}
            </span>

            <span class="anatomy-label pointer-label label-lamelles">
              {{ i18n.anatomy.lamelles }}
            </span>

            <span class="anatomy-label pointer-label label-anneau-desc">
              {{ i18n.anatomy.anneau_descendant }}
            </span>

            <span class="anatomy-label pointer-label label-bulbe">
              {{ i18n.anatomy.bulbe }}
            </span>

            <!-- Right-side Pointers (anchored left starting at line endpoints) -->
            <span class="anatomy-label pointer-label label-tubes">
              {{ i18n.anatomy.tubes }}
            </span>

            <span class="anatomy-label pointer-label label-pores">
              {{ i18n.anatomy.pores }}
            </span>

            <span class="anatomy-label pointer-label label-anneau-asc">
              {{ i18n.anatomy.anneau_ascendant }}
            </span>

            <span class="anatomy-label pointer-label label-volve">
              {{ i18n.anatomy.volve }}
            </span>
          </div>
        </div>

        <div class="diagram-footer">
          <p class="diagram-hint">
            💡 {{ i18n.ui.anatomyNotice }}
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { currentLocale, setLocale, i18n } from '../i18n';
import { SupportedLocale } from '../i18n/types';

defineEmits<{
  (e: 'navigate', page: 'map' | 'anatomy' | 'mushroom', speciesId?: string): void;
}>();

function onLocaleChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  setLocale(target.value as SupportedLocale);
}
</script>

<style scoped>
.anatomy-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background: radial-gradient(circle at 50% 10%, #172033 0%, #0b0f19 80%);
  color: #f1f5f9;
  padding: 1rem 1.5rem;
  box-sizing: border-box;
}

.anatomy-header {
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
  gap: 1.25rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  padding: 0.5rem 0.9rem;
}

.anatomy-title-wrap h2 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #f8fafc;
}

.anatomy-subtitle {
  margin: 0.15rem 0 0 0;
  font-size: 0.85rem;
  color: #94a3b8;
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

.anatomy-content {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex: 1;
}

.diagram-card {
  width: 100%;
  max-width: 900px;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.diagram-viewport {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Responsive aspect-ratio canvas based on 738x601 */
.diagram-canvas {
  position: relative;
  width: 100%;
  max-width: 738px;
  aspect-ratio: 738 / 601;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.diagram-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  user-select: none;
  pointer-events: none;
}

/* General anatomy label styling */
.anatomy-label {
  position: absolute;
  color: #111827;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.15;
  user-select: none;
  pointer-events: auto;
  white-space: nowrap;
}

/* Category header labels on the left margin */
.category-label {
  font-weight: 800;
  font-size: clamp(12px, 1.95cqw, 18px);
  color: #0f172a;
  letter-spacing: -0.01em;
}

/* Normal pointer labels */
.pointer-label {
  font-weight: 500;
  font-size: clamp(10px, 1.7cqw, 15px);
  color: #1e293b;
}

/* Category positions (percentages based on 738x601 image) */
.label-chapeau {
  left: 0.8%;
  top: 1.0%;
}

.label-dessous {
  left: 0.5%;
  top: 17.5%;
  max-width: 18%;
  white-space: normal;
}

.label-anneau {
  left: 0.8%;
  top: 42.0%;
}

.label-pied {
  left: 1.2%;
  top: 63.5%;
}

.label-mycelium {
  left: 0.8%;
  top: 88.5%;
}

/* Left-anchored Pointers (Right-aligned to line starts) */
.label-ecailles {
  right: calc(100% - 24.3%);
  top: 6.8%;
  text-align: right;
}

.label-verrues {
  right: calc(100% - 25.8%);
  top: 13.0%;
  text-align: right;
}

.label-aiguillons {
  right: calc(100% - 29.3%);
  top: 26.0%;
  text-align: right;
}

.label-lamelles {
  right: calc(100% - 27.8%);
  top: 32.8%;
  text-align: right;
}

.label-anneau-desc {
  right: calc(100% - 34.5%);
  top: 44.0%;
  text-align: right;
  max-width: 20%;
  white-space: normal;
}

.label-bulbe {
  right: calc(100% - 34.0%);
  top: 73.8%;
  text-align: right;
}

/* Right-anchored Pointers (Left-aligned to line starts) */
.label-tubes {
  left: 77.3%;
  top: 12.3%;
  text-align: left;
}

.label-pores {
  left: 77.2%;
  top: 21.8%;
  text-align: left;
}

.label-anneau-asc {
  left: 71.8%;
  top: 39.8%;
  text-align: left;
  max-width: 26%;
  white-space: normal;
}

.label-volve {
  left: 73.6%;
  top: 73.2%;
  text-align: left;
}

.diagram-footer {
  margin-top: 1rem;
  width: 100%;
  text-align: center;
}

.diagram-hint {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0;
}

@media (max-width: 640px) {
  .anatomy-page-container {
    padding: 0.5rem;
  }
  .anatomy-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  .header-right {
    width: 100%;
    justify-content: flex-end;
  }
  .diagram-card {
    padding: 0.75rem;
  }
}
</style>
