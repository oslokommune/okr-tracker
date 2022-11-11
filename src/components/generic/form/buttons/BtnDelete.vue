<template>
  <v-popover offset="0" placement="top">
    <btn
      :form="form"
      :icon="icon"
      :label="label"
      :hide-label="hideLabel"
      :variant="variant"
      :disabled="disabled"
    />

    <template slot="popover">
      <btn
        variant="tertiary"
        class="btn--negative"
        :label="confirmLabel"
        @click="$emit('click', $event)"
      />
    </template>
  </v-popover>
</template>

<script>
import { VPopover } from 'v-tooltip';
import Btn from './BtnBase.vue';

export default {
  name: 'BtnDelete',

  components: {
    VPopover,
    Btn,
  },

  extends: Btn,

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
    variant: {
      type: String,
      required: false,
      default: 'tertiary',
    },
    icon: {
      type: String,
      required: false,
      default: 'trash',
    },
  },
};
</script>
