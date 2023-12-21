<template>
  <pkt-button v-bind="$attrs" :text="text" :skin="skin" type="button" v-on="$listeners" />
</template>
<script>
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'BtnCancel',

  components: {
    PktButton,
  },

  props: {
    text: {
      type: String,
      required: false,
      default() {
        return this.$t('btn.cancel');
      },
    },
    skin: {
      type: String,
      required: false,
      default: 'tertiary',
    },
  },
};
</script>
