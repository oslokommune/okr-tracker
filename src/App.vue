<script setup>
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useHead } from '@unhead/vue';
import { useI18n } from 'vue-i18n';
import { useTrackerStore } from '@/store/tracker';
import { useActiveOrganizationStore } from '@/store/activeOrganization';
import AppLayout from './components/AppLayout.vue';

const i18n = useI18n();

const { homeOrganization, owner } = storeToRefs(useTrackerStore());
const activeOrganizationStore = useActiveOrganizationStore();
const { organization } = storeToRefs(activeOrganizationStore);

useHead({
  title: owner.value,
  titleTemplate: (title) => `${title} | ${i18n.t('general.project')}`,
});

watch(
  homeOrganization,
  () => {
    // Set active organization to home organization if not otherwise set
    if (homeOrganization.value && !organization.value) {
      activeOrganizationStore.setOrganization(homeOrganization.value.id);
    }
  },
  { immediate: true }
);

// Using a class on body to determine how to style focus states
document.body.addEventListener('mousedown', () => {
  document.body.classList.add('using-mouse');
});
document.body.addEventListener('keydown', () => {
  document.body.classList.remove('using-mouse');
});

/*
 * The swagger-ui package loads zenscroll, which overrides scolling behavior of
 * *every* anchor tag on every page by placing a nasty click event listener on
 * the main `html` element. In order to disable this, we have to do the
 * following before the swagger-ui package even loads.
 */
window.noZensmooth = true;
</script>

<template>
  <div class="app">
    <AppLayout />
  </div>
</template>
