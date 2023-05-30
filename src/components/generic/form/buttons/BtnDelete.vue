<template>
  <v-popover offset="0" placement="top">
    <pkt-button
      type="button"
      skin="tertiary"
      :size="size"
      :text="label"
      :variant="variant"
      :icon-name="icon"
      :disabled="disabled"
    />

    <template slot="popover">
      <pkt-button type="button" :text="confirmLabel" @onClick="$emit('click', $event)" />
    </template>
  </v-popover>
</template>

<script>
import { PktButton } from '@oslokommune/punkt-vue2';
import { VPopover } from 'v-tooltip';

export default {
  name: 'BtnDelete',

  components: {
    PktButton,
    VPopover,
  },

  extends: PktButton,

  props: {
    label: {
      type: String,
      required: false,
      default() {
        return this.$t('btn.delete');
      },
    },
    confirmLabel: {
      type: String,
      required: false,
      default() {
        return this.$t('btn.confirmDelete');
      },
    },
    size: {
      type: String,
      required: false,
      default: 'medium',
    },
    variant: {
      type: String,
      required: false,
      default: 'icon-left',
    },
    icon: {
      type: String,
      required: false,
      default: 'trash-can',
    },
  },
};
</script>
