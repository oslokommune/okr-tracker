<template>
  <pkt-button
    v-bind="$attrs"
    skin="primary"
    :text="text"
    :variant="variant"
    icon-name="save"
    v-on="$listeners"
  />
</template>

<script>
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'BtnSave',

  components: {
    PktButton,
  },

  props: {
    text: {
      type: String,
      required: false,
      default() {
        return this.$t('btn.save');
      },
    },
    variant: {
      type: String,
      required: false,
      default: 'icon-left',
    },
  },
};
</script>
