<template>
  <pkt-button
    :text="label"
    :skin="skin"
    type="button"
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
    skin: {
      type: String,
      required: false,
      default: 'tertiary',
    },
  },
};
</script>
