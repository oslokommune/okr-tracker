<script setup>
import { PktButton } from '@oslokommune/punkt-vue';
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
  <pkt-button v-bind="$attrs" :text="text" :skin="skin" type="button" />
</template>
