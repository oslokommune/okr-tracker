<template>
  <Tooltip ref="popover" interactive trigger="click" placement="top">
    <template #default>
      <pkt-button
        v-bind="$attrs"
        skin="tertiary"
        :text="text"
        :variant="variant"
        :icon-name="iconName"
      />
    </template>

    <template v-if="!$attrs?.disabled" #content>
      <div data-mode="dark">
        <p v-if="confirmHelp">{{ confirmHelp }}</p>
        <pkt-button
          type="button"
          skin="secondary"
          class="my-size-8"
          :size="$attrs?.size || 'medium'"
          :text="confirmText"
          @on-click="confirm"
        />
      </div>
    </template>
  </Tooltip>
</template>

<script>
import { PktButton } from '@oslokommune/punkt-vue';
import i18n from '@/locale/i18n';

export default {
  name: 'BtnDelete',

  components: {
    PktButton,
  },

  inheritAttrs: false,

  props: {
    text: {
      type: String,
      required: false,
      default: i18n.global.t('btn.delete'),
    },
    confirmText: {
      type: String,
      required: false,
      default: i18n.global.t('btn.confirmDelete'),
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

  emits: ['onClick'],

  methods: {
    confirm(e) {
      this.$emit('onClick', e);
      this.$refs.popover.hide();
    },
  },
};
</script>
