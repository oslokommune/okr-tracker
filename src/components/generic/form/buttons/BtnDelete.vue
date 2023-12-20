<template>
  <v-popover ref="popover" offset="0" placement="top" :disabled="$attrs?.disabled">
    <pkt-button
      v-bind="$attrs"
      skin="tertiary"
      :text="text"
      :variant="variant"
      :icon-name="iconName"
    />

    <template v-if="!$attrs?.disabled" slot="popover">
      <div data-mode="dark">
        <p v-if="confirmHelp" class="mb-size-16">{{ confirmHelp }}</p>
        <pkt-button
          type="button"
          skin="secondary"
          :size="$attrs?.size || 'medium'"
          :text="confirmText"
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

  inheritAttrs: false,

  props: {
    text: {
      type: String,
      required: false,
      default() {
        return this.$t('btn.delete');
      },
    },
    confirmText: {
      type: String,
      required: false,
      default() {
        return this.$t('btn.confirmDelete');
      },
    },
    confirmHelp: {
      type: String,
      required: false,
      default: null,
    },
    variant: {
      type: String,
      required: false,
      default: 'icon-left',
    },
    iconName: {
      type: String,
      required: false,
      default: 'trash-can',
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
