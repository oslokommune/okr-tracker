<script setup>
import { PktButton } from '@oslokommune/punkt-vue';
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
  <PktButton
    v-bind="$attrs"
    skin="primary"
    :text="text"
    :variant="variant"
    icon-name="save"
  />
</template>
