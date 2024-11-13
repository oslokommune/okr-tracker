<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
import { PktButton } from '@oslokommune/punkt-vue';

defineProps({
  variant: {
    type: String,
    required: false,
    default: 'normal',
    validator: (value) => ['normal', 'wide'].includes(value),
  },
});

const emit = defineEmits(['open', 'close']);

const isOpen = ref(false);
const modalOverlay = ref(null);
const modal = ref(null);
const modalContent = ref(null);

const { activate: activateFocusTrap, deactivate: deactivateFocusTrap } = useFocusTrap(
  [modalContent, modal],
  {
    allowOutsideClick: true,
    initialFocus: true,
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
        <div ref="modal" :class="['modal', `modal--${variant}`]">
          <div class="modal__header">
            <h1 class="pkt-txt-18-medium">
              <slot name="header" />
            </h1>
            <PktButton
              ref="closeButton"
              size="small"
              variant="icon-only"
              icon-name="close"
              skin="tertiary"
              @click.stop="close"
            />
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
