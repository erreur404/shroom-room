import { createApp } from 'vue';
import App from './App.vue';
import './styles/main.css';
import { EnvironmentalInputs, ForagingWaypoint, ScoringResult, SpeciesId } from './types';
import { ScoringEngine } from './scoring/pipelines';
import { WeatherService } from './services/weatherService';
import { HabitatDataService, SPECIES_DETAILS } from './services/habitatDataService';
import { getTileId } from '../server/tileConfig';
import { MapHarness } from './components/MapHarness';
import { WaypointPlanner } from './components/WaypointPlanner';
import { HeaderBar } from './components/HeaderBar';
import {
  currentLocale,
  i18n,
  getSpeciesDisplayName,
  getSpeciesCommonName
} from './i18n';
import { FieldGuideService } from './services/fieldGuideService';

export class ShroomRoomApp {
  private scoringEngine = new ScoringEngine();
  private weatherService = new WeatherService();
  private habitatService = new HabitatDataService();

  private mapHarness!: MapHarness;
  private waypointPlanner!: WaypointPlanner;
  private headerBar!: HeaderBar;

  private currentSpecies: SpeciesId = 'boletus';
  private currentDateStr: string = new Date().toISOString().split('T')[0];
  private navigateCallback?: (page: 'map' | 'anatomy' | 'mushroom', speciesId?: SpeciesId) => void;

  public setNavigateCallback(cb: (page: 'map' | 'anatomy' | 'mushroom', speciesId?: SpeciesId) => void) {
    this.navigateCallback = cb;
  }

  public getCurrentSpecies(): SpeciesId {
    return this.currentSpecies;
  }

  public invalidateMapSize() {
    this.mapHarness?.invalidateSize();
  }

  public refreshTranslations() {
    this.headerBar?.refreshTranslations();
  }

  // Active HUD Telemetry State
  private lastClickedEnv?: EnvironmentalInputs;

  init() {
    this.initHUD();
    this.initLegendAndLayers();
    this.initSafetyModal();
    this.initMap();
    this.initWaypointPlanner();
    this.initHeader();
    this.initLocateMe();
    this.initMobileUI();
    this.initResizeListener();
  }

  private initHeader() {
    this.headerBar = new HeaderBar({
      onSpeciesChange: (speciesId) => {
        this.currentSpecies = speciesId;
        this.mapHarness.setSpecies(speciesId);
        if (this.lastClickedEnv) {
          const score = this.scoringEngine.evaluate(this.currentSpecies, this.lastClickedEnv);
          this.updateHUD(this.lastClickedEnv, score);
        }
      },
      onBasemapChange: (basemapId) => {
        this.mapHarness.setBasemap(basemapId);
      },
      onDateChange: (dateStr) => {
        this.currentDateStr = dateStr;
        this.mapHarness.setDate(dateStr);
      },
      onRefreshWeather: () => {
        this.mapHarness.updateViewportDataAndRender();
      },
      onToggleWaypointMode: (active) => {
        this.mapHarness.setWaypointMode(active);
      }
    });
    // Prevent TS unused field warning
    if (!this.headerBar) {
      console.error('HeaderBar init error');
    }
  }

  private initMap() {
    let initialCenter: [number, number] = [51.78, 10.45];
    let initialZoom = 12;

    try {
      const savedPos = localStorage.getItem('shroom_room_map_pos');
      if (savedPos) {
        const parsed = JSON.parse(savedPos);
        if (parsed && Array.isArray(parsed.center) && typeof parsed.zoom === 'number') {
          initialCenter = parsed.center as [number, number];
          initialZoom = parsed.zoom;
        }
      }
    } catch (e) {
      // fallback to default
    }

    this.mapHarness = new MapHarness(
      this.scoringEngine,
      this.weatherService,
      this.habitatService,
      {
        onCoordinateClick: (env, score) => {
          this.lastClickedEnv = env;
          this.updateHUD(env, score);
        },
        onWaypointAdd: (lat, lon) => {
          this.addWaypointAt(lat, lon);
        },
        onWeatherAvailabilityChange: (available) => {
          this.setWeatherAvailability(available);
        }
      }
    );

    this.mapHarness.init('map', initialCenter, initialZoom);
  }

  private setWeatherAvailability(available: boolean) {
    const toggleProb = document.getElementById('toggle-probability') as HTMLInputElement;
    const toggleSuit = document.getElementById('toggle-suitability') as HTMLInputElement;
    const sliderProb = document.getElementById('slider-prob-opacity') as HTMLInputElement;
    const weatherRow = toggleProb?.closest('.layer-toggle-row');
    const badge = document.getElementById('weather-status-badge');

    if (toggleProb) {
      if (!available) {
        toggleProb.checked = false;
        toggleProb.disabled = true;
        if (sliderProb) sliderProb.disabled = true;
        weatherRow?.classList.add('disabled');
        if (badge) {
          badge.textContent = 'Unavailable';
          badge.classList.remove('hidden');
        }
        if (this.mapHarness) {
          this.mapHarness.setLayerVisibility(toggleSuit?.checked ?? true, false);
        }
      } else {
        toggleProb.disabled = false;
        if (sliderProb) sliderProb.disabled = false;
        weatherRow?.classList.remove('disabled');
        if (badge) {
          badge.classList.add('hidden');
        }
      }
    }
  }

  private initWaypointPlanner() {
    const waypointsContainer = document.getElementById('waypoints-list') as HTMLElement;
    const distanceEl = document.getElementById('route-distance') as HTMLElement;
    const avgSuitEl = document.getElementById('route-avg-suit') as HTMLElement;
    const avgProbEl = document.getElementById('route-avg-prob') as HTMLElement;
    const countBadgeEl = document.getElementById('waypoint-count-badge') as HTMLElement;

    this.waypointPlanner = new WaypointPlanner(
      waypointsContainer,
      distanceEl,
      avgSuitEl,
      avgProbEl,
      countBadgeEl,
      {
        onWaypointSelect: (wpt) => {
          this.mapHarness.flyToCoordinate(wpt.lat, wpt.lon);
        },
        onWaypointsChanged: (waypoints) => {
          if (this.mapHarness) {
            this.mapHarness.renderWaypoints(waypoints);
          }
          const miniBadge = document.getElementById('mobile-waypoint-badge');
          if (miniBadge) {
            miniBadge.textContent = `${waypoints.length}`;
            miniBadge.classList.toggle('hidden', waypoints.length === 0);
          }
        }
      }
    );

    // Export GPX Button
    const exportBtn = document.getElementById('btn-export-gpx') as HTMLButtonElement;
    exportBtn.addEventListener('click', () => {
      this.waypointPlanner.exportGPX(this.currentSpecies);
    });

    // Clear All Button
    const clearBtn = document.getElementById('btn-clear-waypoints') as HTMLButtonElement;
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all saved waypoints along this foraging route?')) {
        this.waypointPlanner.clearAll();
      }
    });

    // Render persisted waypoints from localStorage on initial load
    this.waypointPlanner.initRender();
  }

  private async addWaypointAt(lat: number, lon: number, isFoundSpot = false) {
    let env = this.habitatService.getEnvironmentalInputs(
      lat,
      lon,
      this.currentDateStr,
      [],
      this.weatherService
    );

    if (!env) {
      await this.habitatService.fetchTile(getTileId(lat, lon));
      env = this.habitatService.getEnvironmentalInputs(
        lat,
        lon,
        this.currentDateStr,
        [],
        this.weatherService
      );
    }

    const count = this.waypointPlanner.getWaypoints().length + 1;
    const speciesName = getSpeciesCommonName(this.currentSpecies, currentLocale.value);
    const name = isFoundSpot
      ? `🍄 ${speciesName} Spot #${count}`
      : `📍 Target #${count} (${speciesName})`;

    const score = env
      ? this.scoringEngine.evaluate(this.currentSpecies, env)
      : {
          suitabilityScore: 0.5,
          weatherScore: 0.5,
          overallProbability: 0.5,
          isSeasonActive: true,
          factors: { pHScore: 0.5, hostTreeScore: 0.5, rainScore: 0.5, tempScore: 0.5, tempDrop: 0 }
        };

    const newWpt: ForagingWaypoint = {
      id: `wpt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      lat,
      lon,
      elevationMeters: env?.elevationMeters,
      soilPH: env?.soilPH ?? 5.5,
      dominantTree: env ? this.habitatService.getHostTreeName(env.hostTreeGenus) : 'Forest',
      rain14DaysMm: env?.rain14DaysMm ?? 0,
      currentSoilTempC: env?.currentSoilTempC ?? 15,
      speciesId: this.currentSpecies,
      suitabilityScore: Math.round(score.suitabilityScore * 100),
      weatherScore: Math.round(score.weatherScore * 100),
      probabilityScore: Math.round(score.overallProbability * 100),
      createdAt: new Date().toISOString()
    };

    this.waypointPlanner.addWaypoint(newWpt);
    if (env) {
      this.updateHUD(env, score);
    }
  }

  private initHUD() {
    const hudEl = document.getElementById('telemetry-hud') as HTMLElement;
    const closeBtn = document.getElementById('btn-close-hud') as HTMLButtonElement;
    const addWptBtn = document.getElementById('btn-hud-add-waypoint') as HTMLButtonElement;

    closeBtn.addEventListener('click', () => {
      hudEl.classList.add('hidden');
    });

    addWptBtn.addEventListener('click', () => {
      if (this.lastClickedEnv) {
        this.addWaypointAt(this.lastClickedEnv.lat, this.lastClickedEnv.lon);
      }
    });
  }

  private updateHUD(env: EnvironmentalInputs, score: ScoringResult) {
    const hudEl = document.getElementById('telemetry-hud') as HTMLElement;
    hudEl.classList.remove('hidden');

    const coordsEl = document.getElementById('hud-coords') as HTMLElement;
    coordsEl.textContent = `Lat: ${env.lat.toFixed(4)}, Lon: ${env.lon.toFixed(4)} (${env.elevationMeters}m alt)`;

    const suitEl = document.getElementById('hud-suitability') as HTMLElement;
    suitEl.textContent = `${Math.round(score.suitabilityScore * 100)}%`;

    const weatherEl = document.getElementById('hud-weather') as HTMLElement;
    weatherEl.textContent = `${Math.round(score.weatherScore * 100)}%`;

    const overallEl = document.getElementById('hud-overall') as HTMLElement;
    overallEl.textContent = `${Math.round(score.overallProbability * 100)}%`;

    const pHEl = document.getElementById('hud-ph') as HTMLElement;
    pHEl.textContent = `pH ${env.soilPH.toFixed(1)} (${env.clayPct}% clay, ${env.sandPct}% sand)`;

    const treesEl = document.getElementById('hud-trees') as HTMLElement;
    treesEl.textContent = `${this.habitatService.getHostTreeName(env.hostTreeGenus)} (~${env.distToHostMeters}m)`;

    const rainEl = document.getElementById('hud-rain') as HTMLElement;
    rainEl.textContent = `${env.rain14DaysMm} mm`;

    const soilTempEl = document.getElementById('hud-soil-temp') as HTMLElement;
    soilTempEl.textContent = `${env.currentSoilTempC} °C`;

    const tempDropEl = document.getElementById('hud-temp-drop') as HTMLElement;
    const drop = Math.max(0, env.pastWeekSoilTempC - env.currentSoilTempC);
    tempDropEl.textContent = `-${drop.toFixed(1)} °C past 7d`;
  }

  private initLegendAndLayers() {
    const toggleSuit = document.getElementById('toggle-suitability') as HTMLInputElement;
    const toggleProb = document.getElementById('toggle-probability') as HTMLInputElement;
    const sliderSuit = document.getElementById('slider-suit-opacity') as HTMLInputElement;
    const sliderProb = document.getElementById('slider-prob-opacity') as HTMLInputElement;
    const valSuit = document.getElementById('val-suit-opacity') as HTMLElement;
    const valProb = document.getElementById('val-prob-opacity') as HTMLElement;

    const onLayerChange = () => {
      const isProbActive = toggleProb.checked && !toggleProb.disabled;
      this.mapHarness.setLayerVisibility(toggleSuit.checked, isProbActive);
      this.mapHarness.setLayerOpacity(Number(sliderSuit.value) / 100, Number(sliderProb.value) / 100);
      valSuit.textContent = `${sliderSuit.value}%`;
      valProb.textContent = `${sliderProb.value}%`;
    };

    toggleSuit.addEventListener('change', onLayerChange);
    toggleProb.addEventListener('change', onLayerChange);
    sliderSuit.addEventListener('input', onLayerChange);
    sliderProb.addEventListener('input', onLayerChange);

    const toggleLegendBtn = document.getElementById('btn-toggle-legend') as HTMLButtonElement;
    const legendContent = document.getElementById('legend-content') as HTMLElement;
    toggleLegendBtn.addEventListener('click', () => {
      legendContent.classList.toggle('hidden');
      toggleLegendBtn.textContent = legendContent.classList.contains('hidden') ? '▸' : '▾';
    });
  }

  private initSafetyModal() {
    const modalBackdrop = document.getElementById('safety-modal') as HTMLElement;
    const closeModalBtn = document.getElementById('btn-close-modal') as HTMLButtonElement;
    const modalTitle = document.getElementById('modal-species-title') as HTMLElement;
    const modalContent = document.getElementById('modal-safety-content') as HTMLElement;
    const openGuideBtn = document.getElementById('btn-show-safety') as HTMLButtonElement;

    const renderModalContent = () => {
      const formattedTitle = getSpeciesDisplayName(this.currentSpecies, currentLocale.value);
      modalTitle.textContent = `${i18n.value.ui.fieldGuide}: ${formattedTitle}`;

      modalContent.innerHTML = FieldGuideService.generateFieldGuideHtml(this.currentSpecies, currentLocale.value, {
        includeTopActions: true
      });

      modalContent.querySelector('#btn-guide-anatomy')?.addEventListener('click', () => {
        modalBackdrop.classList.add('hidden');
        this.navigateCallback?.('anatomy');
      });

      modalContent.querySelector('#btn-guide-dedicated')?.addEventListener('click', () => {
        modalBackdrop.classList.add('hidden');
        this.navigateCallback?.('mushroom', this.currentSpecies);
      });
    };

    openGuideBtn?.addEventListener('click', () => {
      renderModalContent();
      modalBackdrop.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
      modalBackdrop.classList.add('hidden');
    });

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        modalBackdrop.classList.add('hidden');
      }
    });
  }

  private initLocateMe() {
    const locateBtn = document.getElementById('btn-locate-me') as HTMLButtonElement;
    if (!locateBtn) return;

    locateBtn.addEventListener('click', () => {
      locateBtn.classList.add('locating');
      this.showToast('🎯 Locating your GPS position...', 4000);

      this.mapHarness.locateUser(
        (coords) => {
          locateBtn.classList.remove('locating');
          locateBtn.classList.add('located');
          this.showToast(`📍 Found your location (±${Math.round(coords.accuracy)}m)`, 3500);
        },
        (errMsg) => {
          locateBtn.classList.remove('locating');
          this.showToast(`⚠️ ${errMsg}`, 5000);
        }
      );
    });
  }

  private initMobileUI() {
    const mobileLayersBtn = document.getElementById('btn-mobile-layers') as HTMLButtonElement;
    const legendOverlay = document.getElementById('map-overlay-legend') as HTMLElement;
    const mobileDrawerBtn = document.getElementById('btn-mobile-drawer') as HTMLButtonElement;
    const waypointDrawer = document.getElementById('waypoint-drawer') as HTMLElement;
    const closeDrawerBtn = document.getElementById('btn-close-drawer') as HTMLButtonElement;

    // Toggle Layers / Legend on Mobile
    mobileLayersBtn?.addEventListener('click', () => {
      legendOverlay?.classList.toggle('mobile-open');
      mobileLayersBtn.classList.toggle('active', legendOverlay?.classList.contains('mobile-open'));
    });

    // Toggle Waypoints Drawer on Mobile
    mobileDrawerBtn?.addEventListener('click', () => {
      waypointDrawer?.classList.toggle('open');
      mobileDrawerBtn.classList.toggle('active', waypointDrawer?.classList.contains('open'));
      setTimeout(() => this.mapHarness.invalidateSize(), 300);
    });

    // Close Waypoint Drawer
    closeDrawerBtn?.addEventListener('click', () => {
      waypointDrawer?.classList.remove('open');
      mobileDrawerBtn?.classList.remove('active');
      setTimeout(() => this.mapHarness.invalidateSize(), 300);
    });

    // 1-Tap Pin Current GPS Location Find
    const pinGpsBtn = document.getElementById('btn-pin-gps') as HTMLButtonElement;
    pinGpsBtn?.addEventListener('click', () => {
      this.showToast('🎯 Getting GPS to pin your find...', 3000);
      this.mapHarness.locateUser(
        (coords) => {
          this.addWaypointAt(coords.lat, coords.lon, true);
          this.showToast(`🍄 Pinned spot at GPS (${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)})! Saved to device.`, 4000);
        },
        (err) => {
          this.showToast(`⚠️ ${err}`, 5000);
        }
      );
    });
  }

  private initResizeListener() {
    window.addEventListener('resize', () => {
      this.mapHarness.invalidateSize();
    });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.mapHarness.invalidateSize(), 200);
    });
  }

  private toastTimeout?: any;
  showToast(message: string, durationMs: number = 3500) {
    const toast = document.getElementById('app-toast') as HTMLElement;
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('visible');

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, durationMs);
  }
}

// Mount Vue Application
createApp(App).mount('#app');

