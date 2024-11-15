<script setup>
import { computed, defineOptions, nextTick, ref } from 'vue';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
import { PktButton } from '@oslokommune/punkt-vue';
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

const emit = defineEmits(['onClick']);

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
  emit('onClick', e);
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
        <PktButton
          v-tooltip="{ content: tooltipContent, hideOnClick: true, reactive: true }"
          v-bind="$attrs"
          skin="tertiary"
          :text="text"
          :variant="variant"
          :icon-name="iconName"
        />
      </template>

      <template #content="{ hide }">
        <div ref="popoverContent" data-mode="dark" @keydown.esc="hide">
          <p v-if="confirmHelp">{{ confirmHelp }}</p>
          <PktButton
            type="button"
            skin="secondary"
            class="my-size-8"
            :size="$attrs?.size || 'medium'"
            :text="confirmText"
            @on-click="confirm($event, hide)"
          />
        </div>
      </template>
    </Tooltip>
  </span>
</template>
