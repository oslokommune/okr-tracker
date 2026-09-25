<script setup>
import '@oslokommune/punkt-elements/dist/pkt-button.js';
import i18n from '@/locale/i18n';

defineProps({
  text: {
    type: String,
    required: false,
    default: i18n.global.t('btn.cancel'),
  },
  skin: {
    type: String,
    required: false,
    default: 'tertiary',
  },
});
</script>

<template>
  <pkt-button v-bind="$attrs" :skin="skin" type="button">
    <span>{{ text }}</span>
  </pkt-button>
</template>
