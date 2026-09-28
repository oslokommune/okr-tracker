<script setup>
import { computed, nextTick, onMounted, ref } from 'vue';
import { useDraggable, useMediaQuery } from '@vueuse/core';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
import '@oslokommune/punkt-elements/dist/pkt-button.js';

const props = defineProps({
  title: {
    type: String,
    required: false,
    default: null,
  },
  icon: {
    type: String,
    required: false,
    default: null,
  },
  variant: {
    type: String,
    required: false,
    default: 'normal',
    validator: (value) => ['normal', 'wide'].includes(value),
  },
  initialFocus: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const emit = defineEmits(['open', 'close']);

const isOpen = ref(false);
const modalOverlay = ref(null);
const modal = ref(null);
const modalHeader = ref(null);
const modalContent = ref(null);

// Let the modal be dragged by its header, including the padding around it, on
// larger screens. It stays centered by the overlay's flexbox until the first
// move, then follows the pointer.
const isDraggable = useMediaQuery('(min-width: 36rem)');
const moved = ref(false);
const isMoved = computed(() => moved.value && isDraggable.value);
const { style: dragStyle } = useDraggable(modal, {
  containerElement: modalOverlay,
  preventDefault: true,
  disabled: () => !isDraggable.value,
  onStart: (_, { target, clientY }) =>
    !target.closest('pkt-button') &&
    (modalHeader.value.contains(target) ||
      (target === modal.value &&
        clientY <= modalHeader.value.getBoundingClientRect().bottom)),
  onMove: () => {
    moved.value = true;
  },
});

const { activate: activateFocusTrap, deactivate: deactivateFocusTrap } = useFocusTrap(
  [modalContent, modal],
  {
    allowOutsideClick: true,
    initialFocus: props.initialFocus,
  }
);

onMounted(async () => {
  isOpen.value = true;
});

async function onOpen() {
  await nextTick();
  activateFocusTrap();
  emit('open');
}

function close() {
  deactivateFocusTrap();
  emit('close');
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade" @after-enter="onOpen">
      <div v-if="isOpen" ref="modalOverlay" class="overlay" @keydown.esc="close">
        <div
          ref="modal"
          :class="['modal', `modal--${variant}`, { 'modal--moved': isMoved }]"
          :style="isMoved ? dragStyle : null"
        >
          <div ref="modalHeader" class="modal__header">
            <pkt-icon v-if="icon" :name="icon" />
            <h1 class="pkt-txt-18-medium">
              <slot name="header">{{ title }}</slot>
            </h1>
            <pkt-button
              size="small"
              variant="icon-only"
              iconName="close"
              skin="tertiary"
              @click.stop="close"
            >
              <span>{{ $t('btn.close') }}</span>
            </pkt-button>
          </div>

          <div ref="modalContent" class="modal__content">
            <slot />
          </div>

          <div v-if="$slots.footer" class="modal__footer">
            <slot name="footer" />
          </div>

          <div v-if="$slots.subfooter" class="modal__subfooter">
            <slot name="subfooter" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: 0.25s ease all;
}
</style>
