<template>
  <pkt-button
    :type="type"
    :text="label"
    :skin="skin"
    :variant="variant"
    :icon-name="icon"
    :disabled="disabled"
    @onClick="$emit('click', $event)"
  />
</template>

<script>
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'BtnSave',
  components: { PktButton },
  extends: PktButton,

  props: {
    type: {
      type: String,
      required: false,
      default: 'button',
    },
    label: {
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
    skin: {
      type: String,
      required: false,
      default: 'primary',
    },
    icon: {
      type: String,
      required: false,
      default: 'save',
    },
  },
};
</script>
