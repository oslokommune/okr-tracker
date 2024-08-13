<template>
  <pkt-button
    v-bind="$attrs"
    :text="text"
    :skin="skin"
    type="button"
    @on-click="$emit('onClick', $event)"
  />
</template>
<script>
import { PktButton } from '@oslokommune/punkt-vue';
import i18n from '@/locale/i18n';

export default {
  name: 'BtnCancel',

  components: {
    PktButton,
  },

  props: {
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
  },
};
</script>
