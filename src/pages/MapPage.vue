<template>
  <div class="map-page-wrapper">
    <!-- Header Controls -->
    <header class="app-header">
      <div class="header-top-row">
        <div class="brand">
          <div class="brand-icon">🍄</div>
          <div class="brand-info">
            <h1>{{ i18n.ui.appName }}</h1>
            <span class="brand-tagline">{{ i18n.ui.tagline }}</span>
          </div>
        </div>

        <div class="header-actions">
          <!-- Quick Species Picker Button -->
          <button id="btn-select-species" class="btn btn-secondary btn-species-picker" :title="i18n.ui.selectSpeciesTitle">
            <span class="icon">🍄</span> <span class="btn-text-label" id="current-species-nav-label">Porcini</span>
          </button>

          <!-- Field Guide / Species ID Button -->
          <button id="btn-show-safety" class="btn btn-secondary btn-field-guide" :title="i18n.ui.fieldGuide" @click="openFieldGuide">
            <span class="icon">📖</span> <span class="btn-text-label">{{ i18n.ui.fieldGuide }}</span>
          </button>

          <!-- Weather Button -->
          <button id="btn-refresh-weather" class="btn btn-secondary" :title="i18n.ui.weather">
            <span class="icon">🔄</span> <span class="btn-text-label">{{ i18n.ui.weather }}</span>
          </button>

          <!-- Waypoint Mode Toggle -->
          <button id="btn-mode-waypoint" class="btn btn-waypoint-toggle" :title="i18n.ui.waypoints">
            <span class="icon">📍</span> <span class="btn-text-label">{{ i18n.ui.waypoints }}</span>
          </button>

          <!-- Language Selector -->
          <div class="lang-selector-group">
            <label class="lang-label">🌐</label>
            <select class="custom-select lang-select" :value="currentLocale" @change="onLocaleChange">
              <option value="fr">🇫🇷 FR</option>
              <option value="en">🇬🇧 EN</option>
              <option value="de">🇩🇪 DE</option>
              <option value="ja">🇯🇵 JA</option>
            </select>
          </div>
        </div>
      </div>

      <div class="controls-bar">
        <div class="control-group">
          <label for="species-select">{{ i18n.ui.species }}</label>
          <div class="custom-select-wrapper">
            <select id="species-select" class="custom-select">
              <!-- Populated dynamically with localized name + Latin identifier -->
            </select>
          </div>
        </div>

        <div class="control-group control-group-date">
          <label for="simulation-date">{{ i18n.ui.simulationDate }}</label>
          <input type="date" id="simulation-date" class="date-input" />
        </div>
      </div>
    </header>

    <!-- Main Workspace -->
    <main class="app-body">
      <!-- Interactive Map Area -->
      <div class="map-container">
        <!-- Persistent Offline Connection Banner -->
        <div v-if="isOffline" class="offline-banner">
          <span class="offline-icon">📡</span>
          <span>{{ i18n.ui.offlineBanner }}</span>
        </div>

        <div id="map"></div>

        <!-- Floating Map Action Buttons (FABs) -->
        <div class="map-floating-controls">
          <button id="btn-locate-me" class="btn-fab btn-locate" :title="i18n.ui.locate">
            <span class="fab-icon">🎯</span>
            <span class="fab-label">{{ i18n.ui.locate }}</span>
          </button>
          <button id="btn-mobile-layers" class="btn-fab btn-layers mobile-only" :title="i18n.ui.layers">
            <span class="fab-icon">🥞</span>
            <span class="fab-label">{{ i18n.ui.layers }}</span>
          </button>
          <button id="btn-mobile-drawer" class="btn-fab btn-trail mobile-only" :title="i18n.ui.trail">
            <span class="fab-icon">📍</span>
            <span class="fab-label">{{ i18n.ui.trail }}</span>
            <span id="mobile-waypoint-badge" class="mini-count-badge hidden">0</span>
          </button>
        </div>

        <!-- Floating Legend & Layer Controller -->
        <div class="map-overlay-legend glass-panel" id="map-overlay-legend">
          <div class="legend-header">
            <h3>{{ i18n.ui.visualSynthesis }}</h3>
            <button id="btn-toggle-legend" class="btn-icon">▾</button>
          </div>
          <div class="legend-body" id="legend-content">
            <!-- Mobile Basemap Selector (Accessible when drawer is opened) -->
            <div class="legend-section mobile-basemap-section">
              <label class="mobile-basemap-label">{{ i18n.ui.mobileBasemapsTitle }}</label>
              <div class="custom-select-wrapper">
                <select id="mobile-basemap-select" class="custom-select">
                  <option value="opentopomap" selected>OpenTopoMap (Contours & Forest)</option>
                  <option value="cyclosm">CyclOSM (Hiking Paths & Trails)</option>
                  <option value="osm">OpenStreetMap Standard</option>
                </select>
              </div>
            </div>

            <div class="layer-toggle-row">
              <label class="layer-checkbox-label">
                <input type="checkbox" id="toggle-suitability" checked />
                <span class="color-badge badge-red"></span>
                <span class="layer-title">{{ i18n.ui.suitabilityMap }}</span>
              </label>
              <span class="layer-desc">{{ i18n.ui.suitabilityDesc }}</span>
            </div>

            <div class="layer-toggle-row">
              <label class="layer-checkbox-label" id="label-weather-layer">
                <input type="checkbox" id="toggle-probability" checked />
                <span class="color-badge badge-blue"></span>
                <span class="layer-title">{{ i18n.ui.weatherTrigger }}</span>
                <span id="weather-status-badge" class="badge-status-pill hidden">Unavailable</span>
              </label>
              <span class="layer-desc">{{ i18n.ui.weatherDesc }}</span>
            </div>

            <div class="layer-sliders">
              <div class="slider-group">
                <label>{{ i18n.ui.suitabilityOpacity }}: <span id="val-suit-opacity">50%</span></label>
                <input type="range" id="slider-suit-opacity" min="10" max="90" value="50" />
              </div>
              <div class="slider-group">
                <label>{{ i18n.ui.weatherOpacity }}: <span id="val-prob-opacity">50%</span></label>
                <input type="range" id="slider-prob-opacity" min="10" max="90" value="50" />
              </div>
            </div>
          </div>
        </div>

        <!-- Active Inspection HUD / Popover -->
        <div id="telemetry-hud" class="telemetry-hud glass-panel hidden">
          <div class="hud-header">
            <div class="hud-title-wrap">
              <span class="hud-icon">🔍</span>
              <div>
                <h4 id="hud-location-name">Target Coordinate Analysis</h4>
                <span id="hud-coords" class="hud-sub">Lat: --, Lon: --</span>
              </div>
            </div>
            <button id="btn-close-hud" class="btn-icon">×</button>
          </div>

          <div class="hud-scores-grid">
            <div class="score-card score-red">
              <span class="score-label">Suitability</span>
              <span id="hud-suitability" class="score-value">--%</span>
              <span class="score-sub">Soil & Trees</span>
            </div>
            <div class="score-card score-blue">
              <span class="score-label">Weather Trigger</span>
              <span id="hud-weather" class="score-value">--%</span>
              <span class="score-sub">Rain & Temp</span>
            </div>
            <div class="score-card score-purple">
              <span class="score-label">Overall Match</span>
              <span id="hud-overall" class="score-value">--%</span>
              <span class="score-sub">Foraging Index</span>
            </div>
          </div>

          <div class="hud-details-list">
            <div class="hud-detail-item">
              <span class="detail-name">🌱 Topsoil pH</span>
              <span id="hud-ph" class="detail-value">--</span>
            </div>
            <div class="hud-detail-item">
              <span class="detail-name">🌲 Host Trees</span>
              <span id="hud-trees" class="detail-value">--</span>
            </div>
            <div class="hud-detail-item">
              <span class="detail-name">🌧️ 14d Rainfall Sum</span>
              <span id="hud-rain" class="detail-value">-- mm</span>
            </div>
            <div class="hud-detail-item">
              <span class="detail-name">🌡️ Soil Temperature</span>
              <span id="hud-soil-temp" class="detail-value">-- °C</span>
            </div>
            <div class="hud-detail-item">
              <span class="detail-name">📉 7d Temp Drop</span>
              <span id="hud-temp-drop" class="detail-value">-- °C</span>
            </div>
          </div>

          <div class="hud-actions">
            <button id="btn-hud-add-waypoint" class="btn btn-primary btn-sm">
              📍 Add as Route Waypoint
            </button>
          </div>
        </div>

        <!-- App Toast Notification -->
        <div id="app-toast" class="app-toast glass-panel hidden"></div>
      </div>

      <!-- Waypoint & Route Planning Drawer -->
      <aside class="sidebar-drawer glass-panel" id="waypoint-drawer">
        <div class="drawer-header">
          <div class="drawer-title">
            <h3>{{ i18n.ui.routePlannerTitle }}</h3>
            <span id="waypoint-count-badge" class="count-badge">0 points</span>
          </div>
          <div class="drawer-header-actions">
            <button id="btn-clear-waypoints" class="btn-text" :title="i18n.ui.clear">{{ i18n.ui.clear }}</button>
            <button id="btn-close-drawer" class="btn-icon" title="Close Drawer">×</button>
          </div>
        </div>

        <div class="route-summary" id="route-summary">
          <div class="summary-metric">
            <span class="metric-label">{{ i18n.ui.estimatedRoute }}</span>
            <span id="route-distance" class="metric-val">0.0 km</span>
          </div>
          <div class="summary-metric">
            <span class="metric-label">{{ i18n.ui.avgSuitability }}</span>
            <span id="route-avg-suit" class="metric-val">--%</span>
          </div>
          <div class="summary-metric">
            <span class="metric-label">{{ i18n.ui.avgFruitingProb }}</span>
            <span id="route-avg-prob" class="metric-val">--%</span>
          </div>
        </div>

        <div class="waypoints-list" id="waypoints-list">
          <div class="empty-state">
            <p>{{ i18n.ui.noWaypoints }}</p>
            <span>{{ i18n.ui.noWaypointsHint }}</span>
          </div>
        </div>

        <div class="drawer-footer">
          <div class="safety-notice">
            <span>{{ i18n.ui.safetyNotice }}</span>
          </div>
          <button id="btn-export-gpx" class="btn btn-accent btn-block">
            {{ i18n.ui.exportGpx }}
          </button>
        </div>
      </aside>
    </main>

    <!-- Field Identification & Safety Modal -->
    <div id="safety-modal" class="modal-backdrop hidden">
      <div class="modal-card glass-panel">
        <div class="modal-header">
          <h3 id="modal-species-title">Species Identification & Safety Guide</h3>
          <button id="btn-close-modal" class="btn-icon">×</button>
        </div>
        <div class="modal-body" id="modal-safety-content">
          <!-- Dynamic safety content inserted here -->
        </div>
      </div>
    </div>

    <!-- Species Selector Modal (Mobile & Quick-Select) -->
    <div id="species-modal" class="modal-backdrop hidden">
      <div class="modal-card glass-panel species-modal-card">
        <div class="modal-header">
          <div class="species-modal-title-wrap">
            <span class="species-modal-icon">🍄</span>
            <div>
              <h3 id="modal-species-selector-title">{{ i18n.ui.selectSpeciesTitle }}</h3>
              <p class="species-modal-subtitle">{{ i18n.ui.selectSpeciesSubtitle }}</p>
            </div>
          </div>
          <button id="btn-close-species-modal" class="btn-icon" aria-label="Close">×</button>
        </div>
        <div class="modal-body species-modal-body" id="modal-species-list">
          <!-- Dynamically populated with rich interactive species cards -->
        </div>
      </div>
    </div>

    <!-- First-Launch Foraging Safety Disclaimer Modal -->
    <div id="first-launch-modal" class="modal-backdrop" v-if="showFirstLaunchModal">
      <div class="modal-card glass-panel safety-disclaimer-modal-card">
        <div class="disclaimer-modal-header">
          <span class="disclaimer-alert-icon">⚠️</span>
          <h2>{{ i18n.ui.firstLaunchTitle }}</h2>
        </div>
        <div class="disclaimer-modal-body">
          <p class="disclaimer-lead">{{ i18n.ui.firstLaunchBody1 }}</p>
          <div class="disclaimer-warning-box">
            <strong>☠️ {{ i18n.ui.firstLaunchBody2 }}</strong>
          </div>
          <p class="disclaimer-advice">🏥 {{ i18n.ui.firstLaunchBody3 }}</p>
        </div>
        <div class="disclaimer-modal-footer">
          <button class="btn btn-primary btn-block btn-lg" @click="dismissFirstLaunchModal">
            {{ i18n.ui.firstLaunchAcknowledge }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { ShroomRoomApp } from '../main';
import { currentLocale, setLocale, i18n } from '../i18n';
import { SupportedLocale } from '../i18n/types';
import { SpeciesId } from '../types';

const emit = defineEmits<{
  (e: 'navigate', page: 'map' | 'anatomy' | 'mushroom', speciesId?: SpeciesId): void;
}>();

let appInstance: ShroomRoomApp | null = null;
const isOffline = ref(!navigator.onLine);
const showFirstLaunchModal = ref(false);

function updateOnlineStatus() {
  isOffline.value = !navigator.onLine;
}

function dismissFirstLaunchModal() {
  try {
    localStorage.setItem('shroom_room_safety_ack', 'true');
  } catch {
    // Ignore localStorage errors
  }
  showFirstLaunchModal.value = false;
}

onMounted(() => {
  try {
    showFirstLaunchModal.value = !localStorage.getItem('shroom_room_safety_ack');
  } catch {
    showFirstLaunchModal.value = false;
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  appInstance = new ShroomRoomApp();
  appInstance.setNavigateCallback((page, speciesId) => {
    emit('navigate', page, speciesId);
  });
  appInstance.init();
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});

watch(currentLocale, () => {
  appInstance?.refreshTranslations();
});

function onLocaleChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  setLocale(target.value as SupportedLocale);
}

function goToAnatomy() {
  emit('navigate', 'anatomy');
}

function openFieldGuide() {
  appInstance?.openSafetyModal();
}

function goToDedicatedPage(speciesId?: SpeciesId) {
  const species = speciesId || appInstance?.getCurrentSpecies() || 'boletus';
  emit('navigate', 'mushroom', species);
}

defineExpose({
  invalidateMapSize: () => {
    appInstance?.invalidateMapSize();
  },
  refreshTranslations: () => {
    appInstance?.refreshTranslations();
  },
  getCurrentSpecies: () => {
    return appInstance?.getCurrentSpecies() || 'boletus';
  },
  openFieldGuide: () => {
    appInstance?.openSafetyModal();
  }
});
</script>

<style scoped>
.map-page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.lang-selector-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(15, 23, 42, 0.65);
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.lang-label {
  font-size: 0.85rem;
}

.lang-select {
  background: transparent;
  color: #f8fafc;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  outline: none;
}

.lang-select option {
  background: #0f172a;
  color: #f8fafc;
}
</style>
