<script setup>
import { ref, nextTick, watch } from 'vue';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
import { PktButton } from '@oslokommune/punkt-vue';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
    default: false,
  },

  allowClickOutside: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const emit = defineEmits(['open', 'close']);

const container = ref(null);
const content = ref(null);
const header = ref(null);
const footer = ref(null);
const isVisible = ref(false);

const { activate: activateFocusTrap, deactivate: deactivateFocusTrap } = useFocusTrap(
  [content, footer, header, container],
  {
    allowOutsideClick: true,
    initialFocus: true,
    escapeDeactivates: false,
  }
);

watch(
  () => props.visible,
  () => {
    isVisible.value = props.visible;
  },
  { immediate: true }
);

async function onEnter() {
  await nextTick();
  activateFocusTrap();
  emit('open');
}

function close() {
  isVisible.value = false;
  deactivateFocusTrap();
}

function clickOutside() {
  if (props.allowClickOutside) {
    close();
  }
}

defineExpose({ close });
</script>

<template>
  <div ref="container">
    <Transition name="fade" mode="out-in">
      <div v-if="isVisible" class="overlay" @click.self="clickOutside"></div>
    </Transition>

    <Transition
      name="slide"
      mode="out-in"
      @after-enter="onEnter"
      @after-leave="$emit('close')"
    >
      <aside v-if="isVisible" class="sliderContainer">
        <div class="sliderContainer__closeButtonContainer">
          <PktButton
            skin="tertiary"
            variant="icon-only"
            icon-name="close"
            @on-click="close"
          />
        </div>

        <div class="sliderContainer__inner">
          <header v-if="$slots.header" ref="header" class="sliderContainer__header">
            <slot name="header" />
          </header>

          <div ref="content" class="sliderContainer__content">
            <slot name="default" />
          </div>

          <footer v-if="$slots.footer" ref="footer" class="sliderContainer__footer">
            <slot name="footer" />
          </footer>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

.sliderContainer {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  width: 100vw;
  max-width: 37.5rem;
  height: 100vh;
  background-color: var(--color-white);

  @include bp('phablet-up') {
    width: calc(100vw - 4rem);
  }

  &__closeButtonContainer {
    margin: 0.5rem;
    text-align: right;

    @include bp('phablet-up') {
      margin: 1rem 1rem 0;
    }

    svg {
      --fg-color: var(--color-primary);
      height: 1.5rem;
    }
  }

  &__inner {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
    padding: 1.5rem;
    padding-top: 0;
    overflow-y: auto;

    @include bp('phablet-up') {
      padding: 2.5rem;
    }
  }

  &__footer {
    margin-top: auto;
  }
}

.fade {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.25s ease-out;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
  }
}

.slide {
  &-enter-active,
  &-leave-active {
    transition: right 0.25s ease-in-out;
  }

  &-enter-from,
  &-leave-to {
    right: -504px;
  }
}
</style>
