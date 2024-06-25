<template>
  <pkt-button
    v-bind="$attrs"
    skin="primary"
    :text="text"
    :variant="variant"
    icon-name="save"
    @onClick="$emit('click', $event)"
  />
</template>

<script>
import { PktButton } from '@oslokommune/punkt-vue';
import i18n from '@/locale/i18n';

export default {
  name: 'BtnSave',

  components: {
    PktButton,
  },

  props: {
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
  },
};
</script>
