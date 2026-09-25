<script setup>
import '@oslokommune/punkt-elements/dist/pkt-button.js';
import i18n from '@/locale/i18n';

defineProps({
  text: {
    type: String,
    required: false,
    default: i18n.global.t('btn.save'),
  },
  variant: {
    type: String,
    required: false,
    default: 'icon-left',
  },
});
</script>

<template>
  <pkt-button v-bind="$attrs" skin="primary" :variant="variant" iconName="save">
    <span>{{ text }}</span>
  </pkt-button>
</template>
