<script setup>
import { defineOptions, ref } from 'vue';
import { PktButton } from '@oslokommune/punkt-vue';
import i18n from '@/locale/i18n';

defineProps({
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
});

defineOptions({
  inheritAttrs: false,
});

const emit = defineEmits(['onClick']);
const popover = ref(null);

function confirm(e) {
  emit('onClick', e);
  popover.value.hide();
}
</script>

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

    <template #content>
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
