import { BasemapId, SpeciesId } from '../types';
import { getDaysToSeasonMidpoint } from '../scoring/season';
import { ScoringEngine } from '../scoring/pipelines';
import { SPECIES_DETAILS } from '../services/habitatDataService';
import {
  currentLocale,
  i18n,
  getSpeciesDisplayName,
  getSpeciesShortName,
  getSpeciesCommonName,
  getSpeciesLatinName
} from '../i18n';
import { SPECIES_I18N } from '../i18n/translations';

export interface HeaderBarCallbacks {
  onSpeciesChange: (speciesId: SpeciesId) => void;
  onBasemapChange: (basemapId: BasemapId) => void;
  onDateChange: (dateStr: string) => void;
  onRefreshWeather: () => void;
  onToggleWaypointMode: (active: boolean) => void;
}

export class HeaderBar {
  private speciesSelect: HTMLSelectElement;
  private basemapSelect: HTMLSelectElement;
  private dateInput: HTMLInputElement;
  private refreshWeatherBtn: HTMLButtonElement;
  private waypointModeBtn: HTMLButtonElement;

  private selectSpeciesBtn: HTMLButtonElement | null = null;
  private speciesModal: HTMLElement | null = null;
  private closeSpeciesModalBtn: HTMLButtonElement | null = null;
  private speciesModalList: HTMLElement | null = null;
  private speciesNavLabel: HTMLElement | null = null;

  private scoringEngine = new ScoringEngine();
  private isWaypointMode = false;

  constructor(private callbacks: HeaderBarCallbacks) {
    this.speciesSelect = document.getElementById('species-select') as HTMLSelectElement;
    this.basemapSelect = document.getElementById('basemap-select') as HTMLSelectElement;
    this.dateInput = document.getElementById('simulation-date') as HTMLInputElement;
    this.refreshWeatherBtn = document.getElementById('btn-refresh-weather') as HTMLButtonElement;
    this.waypointModeBtn = document.getElementById('btn-mode-waypoint') as HTMLButtonElement;

    this.selectSpeciesBtn = document.getElementById('btn-select-species') as HTMLButtonElement | null;
    this.speciesModal = document.getElementById('species-modal') as HTMLElement | null;
    this.closeSpeciesModalBtn = document.getElementById('btn-close-species-modal') as HTMLButtonElement | null;
    this.speciesModalList = document.getElementById('modal-species-list') as HTMLElement | null;
    this.speciesNavLabel = document.getElementById('current-species-nav-label') as HTMLElement | null;

    this.initEvents();
  }

  private initEvents() {
    // Default to today's date
    const today = new Date().toISOString().split('T')[0];
    this.dateInput.value = today;
    this.sortSpeciesDropdown(today);
    this.updateNavLabel((this.speciesSelect.value as SpeciesId) || 'boletus');

    // On mobile (< 768px), enforce today's date
    if (window.innerWidth <= 768) {
      this.dateInput.value = today;
    }

    // Quick-select Mushroom Species button (Header Action & Mobile Icon)
    this.selectSpeciesBtn?.addEventListener('click', () => {
      this.openSpeciesModal();
    });

    this.closeSpeciesModalBtn?.addEventListener('click', () => {
      this.closeSpeciesModal();
    });

    this.speciesModal?.addEventListener('click', (e) => {
      if (e.target === this.speciesModal) {
        this.closeSpeciesModal();
      }
    });

    this.speciesSelect.addEventListener('change', () => {
      const species = this.speciesSelect.value as SpeciesId;
      this.updateNavLabel(species);
      this.callbacks.onSpeciesChange(species);
    });

    this.basemapSelect.addEventListener('change', () => {
      const basemapId = this.basemapSelect.value as BasemapId;
      const mobileBasemapSelect = document.getElementById('mobile-basemap-select') as HTMLSelectElement | null;
      if (mobileBasemapSelect) mobileBasemapSelect.value = basemapId;
      this.callbacks.onBasemapChange(basemapId);
    });

    // Mobile Basemap Picker inside the mobile Layer drawer
    const mobileBasemapSelect = document.getElementById('mobile-basemap-select') as HTMLSelectElement | null;
    if (mobileBasemapSelect) {
      mobileBasemapSelect.value = this.basemapSelect.value;
      mobileBasemapSelect.addEventListener('change', () => {
        const basemapId = mobileBasemapSelect.value as BasemapId;
        this.basemapSelect.value = basemapId;
        this.callbacks.onBasemapChange(basemapId);
      });
    }

    this.dateInput.addEventListener('change', () => {
      this.sortSpeciesDropdown(this.dateInput.value);
      this.callbacks.onDateChange(this.dateInput.value);
    });

    this.refreshWeatherBtn.addEventListener('click', () => {
      this.callbacks.onRefreshWeather();
    });

    this.waypointModeBtn.addEventListener('click', () => {
      this.isWaypointMode = !this.isWaypointMode;
      this.waypointModeBtn.classList.toggle('active', this.isWaypointMode);
      this.callbacks.onToggleWaypointMode(this.isWaypointMode);
    });
  }

  /**
   * Opens the interactive Mushroom Species selection modal/sheet.
   * Species are listed in order of descending proximity to seasonal peak.
   */
  public openSpeciesModal() {
    if (!this.speciesModal || !this.speciesModalList) return;

    const currentSelected = (this.speciesSelect.value as SpeciesId) || 'boletus';
    const dateStr = this.dateInput.value || new Date().toISOString().split('T')[0];
    const allSpecies = Object.keys(SPECIES_I18N) as SpeciesId[];

    const sorted = allSpecies.map(sp => {
      const diffDays = getDaysToSeasonMidpoint(sp, dateStr);
      const isActive = this.scoringEngine.isSeasonActive(sp, dateStr);
      return { sp, diffDays, isActive };
    }).sort((a, b) => a.diffDays - b.diffDays);

    this.speciesModalList.innerHTML = '';

    for (const item of sorted) {
      const details = SPECIES_DETAILS[item.sp];
      const isSelected = item.sp === currentSelected;

      let pillClass = 'off';
      let pillText = i18n.value.ui.offSeason;
      if (item.isActive) {
        if (item.diffDays <= 20) {
          pillClass = 'peak';
          pillText = `${i18n.value.ui.peakSeason} (±${Math.round(item.diffDays)}d)`;
        } else {
          pillClass = 'active';
          pillText = i18n.value.ui.inSeason;
        }
      }

      const latinName = getSpeciesLatinName(item.sp);
      const commonName = getSpeciesCommonName(item.sp, currentLocale.value);

      const card = document.createElement('div');
      card.className = `species-card-item ${isSelected ? 'active' : ''}`;
      card.setAttribute('data-species', item.sp);
      card.innerHTML = `
        <div class="species-card-left">
          <span class="species-badge-indicator" style="background-color:${details?.badgeColor || '#a855f7'}; color:${details?.badgeColor || '#a855f7'};"></span>
          <div class="species-card-text">
            <div class="species-card-title-row">
              <span class="species-latin-name">${latinName}</span>
              <span class="species-status-pill ${pillClass}">${pillText}</span>
            </div>
            <div class="species-common-desc">${commonName}</div>
          </div>
        </div>
        ${isSelected ? '<span class="species-check-mark">✓</span>' : ''}
      `;

      card.addEventListener('click', () => {
        this.speciesSelect.value = item.sp;
        this.updateNavLabel(item.sp);
        this.closeSpeciesModal();
        this.callbacks.onSpeciesChange(item.sp);
      });

      this.speciesModalList.appendChild(card);
    }

    this.speciesModal.classList.remove('hidden');
  }

  public closeSpeciesModal() {
    this.speciesModal?.classList.add('hidden');
  }

  public updateNavLabel(speciesId: SpeciesId) {
    if (this.speciesNavLabel) {
      this.speciesNavLabel.textContent = getSpeciesShortName(speciesId, currentLocale.value);
    }
  }

  /**
   * Re-sorts the species dropdown options by ascending distance to the middle of the season
   * (i.e. closest to peak season listed first).
   */
  public sortSpeciesDropdown(dateStr: string) {
    const currentSelected = (this.speciesSelect.value as SpeciesId) || 'boletus';
    const allSpecies = Object.keys(SPECIES_I18N) as SpeciesId[];

    const sorted = allSpecies.map(sp => {
      const diffDays = getDaysToSeasonMidpoint(sp, dateStr);
      const isActive = this.scoringEngine.isSeasonActive(sp, dateStr);
      return { sp, diffDays, isActive };
    }).sort((a, b) => a.diffDays - b.diffDays);

    this.speciesSelect.innerHTML = '';
    for (const item of sorted) {
      const opt = document.createElement('option');
      opt.value = item.sp;
      const formattedName = getSpeciesDisplayName(item.sp, currentLocale.value);
      const status = item.isActive
        ? (item.diffDays <= 20 ? `🟢 ${i18n.value.ui.peakSeason}` : `🟢 ${i18n.value.ui.inSeason}`)
        : `⚪ ${i18n.value.ui.offSeason}`;
      opt.textContent = `${formattedName} — ${status}`;
      this.speciesSelect.appendChild(opt);
    }

    if (sorted.some(s => s.sp === currentSelected)) {
      this.speciesSelect.value = currentSelected;
    } else if (sorted.length > 0) {
      this.speciesSelect.value = sorted[0].sp;
    }
    this.updateNavLabel(this.speciesSelect.value as SpeciesId);
  }

  public refreshTranslations() {
    const dateStr = this.dateInput.value || new Date().toISOString().split('T')[0];
    this.sortSpeciesDropdown(dateStr);
    this.updateNavLabel(this.speciesSelect.value as SpeciesId);
  }

  setSpecies(speciesId: SpeciesId) {
    this.speciesSelect.value = speciesId;
    this.updateNavLabel(speciesId);
  }
}


