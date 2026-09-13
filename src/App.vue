<template>
  <div id="shroom-app-root">
    <!-- Map Page (kept alive via v-show so Leaflet map and state are fully preserved) -->
    <MapPage
      ref="mapPageRef"
      v-show="currentView === 'map'"
      @navigate="onNavigate"
    />

    <!-- Mushroom Anatomy Page -->
    <AnatomyPage
      v-if="currentView === 'anatomy'"
      @navigate="onNavigate"
    />

    <!-- Dedicated Mushroom Detail Page -->
    <MushroomDetailPage
      v-if="currentView === 'mushroom'"
      :species-id="selectedSpecies"
      @navigate="onNavigate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import MapPage from './pages/MapPage.vue';
import AnatomyPage from './pages/AnatomyPage.vue';
import MushroomDetailPage from './pages/MushroomDetailPage.vue';
import { SpeciesId } from './types';

type PageView = 'map' | 'anatomy' | 'mushroom';

const currentView = ref<PageView>('map');
const selectedSpecies = ref<SpeciesId>('boletus');
const mapPageRef = ref<InstanceType<typeof MapPage> | null>(null);

function onNavigate(page: PageView, speciesId?: SpeciesId) {
  if (speciesId) {
    selectedSpecies.value = speciesId;
  } else if (mapPageRef.value) {
    selectedSpecies.value = mapPageRef.value.getCurrentSpecies();
  }

  currentView.value = page;

  if (page === 'map') {
    nextTick(() => {
      mapPageRef.value?.invalidateMapSize();
    });
  }
}
</script>

<style>
#shroom-app-root {
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}
</style>
