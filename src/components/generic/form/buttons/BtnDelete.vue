<script setup>
import { computed, nextTick, ref } from 'vue';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
import '@oslokommune/punkt-elements/dist/pkt-button.js';
import i18n from '@/locale/i18n';

const props = defineProps({
  text: {
    type: String,
    required: false,
    default: i18n.global.t('btn.delete'),
  },
  tooltipText: {
    type: String,
    required: false,
    default: null,
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

const emit = defineEmits(['confirm']);

const popover = ref(null);
const popoverContent = ref(null);
const isShown = computed(() => popover.value && popover.value.state.isShown);
const tooltipContent = computed(() =>
  props.tooltipText && !isShown.value ? props.tooltipText : null
);

const { activate: activateFocusTrap, deactivate: deactivateFocusTrap } = useFocusTrap(
  popoverContent,
  {
    allowOutsideClick: true,
    initialFocus: false,
    escapeDeactivates: false,
  }
);

async function onShow() {
  await nextTick();
  activateFocusTrap();
}

function onHide() {
  deactivateFocusTrap();
}

function confirm(e, hide) {
  emit('confirm', e);
  hide();
}
</script>

<template>
  <span>
    <Tooltip
      ref="popover"
      interactive
      trigger="click"
      placement="top"
      :on-show="onShow"
      :on-hide="onHide"
      @keydown.esc="onHide"
    >
      <template #default>
        <pkt-button
          v-tooltip="{ content: tooltipContent, hideOnClick: true, reactive: true }"
          v-bind="$attrs"
          skin="tertiary"
          :variant="variant"
          :iconName="iconName"
        >
          <span>{{ text }}</span>
        </pkt-button>
      </template>

      <template #content="{ hide }">
        <div ref="popoverContent" data-mode="dark" @keydown.esc.stop="hide">
          <p v-if="confirmHelp">{{ confirmHelp }}</p>
          <pkt-button
            type="button"
            skin="secondary"
            class="my-size-8"
            :size="$attrs?.size || 'medium'"
            @click="confirm($event, hide)"
          >
            <span>{{ confirmText }}</span>
          </pkt-button>
        </div>
      </template>
    </Tooltip>
  </span>
</template>
