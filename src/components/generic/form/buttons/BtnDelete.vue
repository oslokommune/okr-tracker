<template>
  <v-popover ref="popover" offset="0" placement="top" :disabled="disabled">
    <pkt-button
      type="button"
      skin="tertiary"
      :size="size"
      :text="label"
      :variant="variant"
      :icon-name="icon"
      :disabled="disabled"
    />

    <template v-if="!disabled" slot="popover">
      <div data-mode="dark">
        <p v-if="confirmText" class="mb-size-16">{{ confirmText }}</p>
        <pkt-button
          type="button"
          skin="secondary"
          :text="confirmLabel"
          :size="size"
          @onClick="confirm"
        />
      </div>
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
    confirmText: {
      type: String,
      required: false,
      default: null,
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
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  methods: {
    confirm(e) {
      this.$emit('click', e);
      this.$refs.popover.hide();
    },
  },
};
</script>
