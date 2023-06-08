<template>
  <pkt-button
    :text="label"
    :variant="variant"
    @onClick="$emit('click', $event)"
  />
</template>
<script>
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'BtnCancel',

  components: {
    PktButton,
  },
  extends: PktButton,

  props: {
    label: {
      type: String,
      required: false,
      default() {
        return this.$t('btn.cancel');
      },
    },
    variant: {
      type: String,
      required: false,
      default: 'tertiary',
    },
  },
};
</script>
