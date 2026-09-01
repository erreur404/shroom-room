import { BasemapId, SpeciesId } from '../types';

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

  private isWaypointMode = false;

  constructor(private callbacks: HeaderBarCallbacks) {
    this.speciesSelect = document.getElementById('species-select') as HTMLSelectElement;
    this.basemapSelect = document.getElementById('basemap-select') as HTMLSelectElement;
    this.dateInput = document.getElementById('simulation-date') as HTMLInputElement;
    this.refreshWeatherBtn = document.getElementById('btn-refresh-weather') as HTMLButtonElement;
    this.waypointModeBtn = document.getElementById('btn-mode-waypoint') as HTMLButtonElement;

    this.initEvents();
  }

  private initEvents() {
    // Default to today's date
    const today = new Date().toISOString().split('T')[0];
    this.dateInput.value = today;

    this.speciesSelect.addEventListener('change', () => {
      const species = this.speciesSelect.value as SpeciesId;
      this.callbacks.onSpeciesChange(species);
    });

    this.basemapSelect.addEventListener('change', () => {
      const basemapId = this.basemapSelect.value as BasemapId;
      this.callbacks.onBasemapChange(basemapId);
    });

    this.dateInput.addEventListener('change', () => {
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

  setSpecies(speciesId: SpeciesId) {
    this.speciesSelect.value = speciesId;
  }
}
