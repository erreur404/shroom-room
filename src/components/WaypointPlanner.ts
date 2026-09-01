import { ForagingWaypoint, SpeciesId } from '../types';
import { GpxService } from '../services/gpxService';

export interface WaypointPlannerCallbacks {
  onWaypointSelect: (wpt: ForagingWaypoint) => void;
  onWaypointsChanged: (waypoints: ForagingWaypoint[]) => void;
}

export class WaypointPlanner {
  private static STORAGE_KEY = 'shroom_room_waypoints_v1';
  private waypoints: ForagingWaypoint[] = [];

  constructor(
    private containerEl: HTMLElement,
    private distanceEl: HTMLElement,
    private avgSuitEl: HTMLElement,
    private avgProbEl: HTMLElement,
    private countBadgeEl: HTMLElement,
    private callbacks: WaypointPlannerCallbacks
  ) {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(WaypointPlanner.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.waypoints = parsed;
        }
      }
    } catch (e) {
      console.warn('[WaypointPlanner] Error loading from localStorage', e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(WaypointPlanner.STORAGE_KEY, JSON.stringify(this.waypoints));
    } catch (e) {
      console.warn('[WaypointPlanner] Error saving to localStorage', e);
    }
  }

  addWaypoint(wpt: ForagingWaypoint) {
    this.waypoints.push(wpt);
    this.saveToStorage();
    this.render();
    this.callbacks.onWaypointsChanged(this.waypoints);
  }

  removeWaypoint(id: string) {
    this.waypoints = this.waypoints.filter(w => w.id !== id);
    this.saveToStorage();
    this.render();
    this.callbacks.onWaypointsChanged(this.waypoints);
  }

  clearAll() {
    this.waypoints = [];
    this.saveToStorage();
    this.render();
    this.callbacks.onWaypointsChanged(this.waypoints);
  }

  initRender() {
    this.render();
    this.callbacks.onWaypointsChanged(this.waypoints);
  }

  getWaypoints(): ForagingWaypoint[] {
    return this.waypoints;
  }

  exportGPX(currentSpecies: SpeciesId) {
    const filename = `shroom_route_${currentSpecies}_${new Date().toISOString().split('T')[0]}.gpx`;
    GpxService.downloadGPX(this.waypoints, filename);
  }

  private calculateRouteDistance(): number {
    if (this.waypoints.length < 2) return 0.0;
    let totalKm = 0.0;

    for (let i = 0; i < this.waypoints.length - 1; i++) {
      const p1 = this.waypoints[i];
      const p2 = this.waypoints[i + 1];
      totalKm += this.haversineDistanceKm(p1.lat, p1.lon, p2.lat, p2.lon);
    }
    return Math.round(totalKm * 10) / 10;
  }

  private haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private render() {
    // 1. Update Metrics
    const totalDist = this.calculateRouteDistance();
    this.distanceEl.textContent = `${totalDist.toFixed(1)} km`;
    this.countBadgeEl.textContent = `${this.waypoints.length} point${this.waypoints.length === 1 ? '' : 's'}`;

    if (this.waypoints.length > 0) {
      const avgSuit = Math.round(this.waypoints.reduce((acc, w) => acc + w.suitabilityScore, 0) / this.waypoints.length);
      const avgProb = Math.round(this.waypoints.reduce((acc, w) => acc + w.probabilityScore, 0) / this.waypoints.length);
      this.avgSuitEl.textContent = `${avgSuit}%`;
      this.avgProbEl.textContent = `${avgProb}%`;
    } else {
      this.avgSuitEl.textContent = '--%';
      this.avgProbEl.textContent = '--%';
    }

    // 2. Render List
    if (this.waypoints.length === 0) {
      this.containerEl.innerHTML = `
        <div class="empty-state">
          <p>No waypoints placed yet.</p>
          <span>Click on the map or select hotspots to build your foraging trail before heading into the forest.</span>
        </div>
      `;
      return;
    }

    this.containerEl.innerHTML = '';

    this.waypoints.forEach((wpt, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'waypoint-item';
      itemEl.innerHTML = `
        <div class="wpt-number">${index + 1}</div>
        <div class="wpt-content">
          <div class="wpt-title-row">
            <span class="wpt-title">${wpt.name}</span>
            <div class="wpt-scores-badge">
              <span class="wpt-score-tag tag-purple">${wpt.probabilityScore}% Prob</span>
            </div>
          </div>
          <div class="wpt-meta">
            <span>Lat: ${wpt.lat.toFixed(4)}, Lon: ${wpt.lon.toFixed(4)}</span><br/>
            <span>pH: ${wpt.soilPH.toFixed(1)} | ${wpt.dominantTree} | Rain: ${wpt.rain14DaysMm}mm</span>
          </div>
        </div>
        <div class="wpt-actions">
          <button class="btn-icon btn-remove-wpt" title="Remove waypoint" data-id="${wpt.id}">🗑️</button>
        </div>
      `;

      itemEl.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('btn-remove-wpt') || target.closest('.btn-remove-wpt')) {
          this.removeWaypoint(wpt.id);
        } else {
          this.callbacks.onWaypointSelect(wpt);
        }
      });

      this.containerEl.appendChild(itemEl);
    });
  }
}
