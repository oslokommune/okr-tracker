<script setup>
import { computed, ref } from 'vue';
import ClappingHands from '@/components/graphics/ClappingHands.vue';
import SliderContainer from '@/components/drawers/SliderContainer.vue';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
    default: false,
  },
  pageCount: {
    type: Number,
    required: false,
    default: 1,
  },
});

const container = ref(null);
const pageIndex = ref(1);
const skin = ref(null);
const isDone = ref(false);
const isSuccess = computed(() => isDone.value && skin.value === 'success');

function next(success) {
  if (success !== false && pageIndex.value < props.pageCount) {
    pageIndex.value += 1;
  } else {
    pageIndex.value = props.pageCount + 1;
    isDone.value = true;
    skin.value = success !== false ? 'success' : 'error';
  }
}

function prev() {
  if (pageIndex.value > 1) {
    pageIndex.value -= 1;
  }
}

function reset() {
  isDone.value = false;
  skin.value = null;
  pageIndex.value = 1;
}

function close() {
  container.value.close();
}

function cancel() {
  close();
}

const slotProps = computed(() => ({
  pageCount: props.pageCount,
  pageIndex: pageIndex.value,
  isDone: isDone.value,
  isSuccess: isSuccess.value,
  next,
  prev,
  reset,
  cancel,
  close,
}));

defineExpose({
  pageCount: props.pageCount,
  pageIndex,
  isDone,
  isSuccess,
  next,
  prev,
  reset,
  cancel,
});
</script>

<template>
  <SliderContainer
    ref="container"
    :visible="visible"
    :class="[
      'paged-drawer',
      { 'paged-drawer--done': isDone },
      skin ? `paged-drawer--${skin}` : null,
    ]"
    :allow-click-outside="isDone"
  >
    <template #header>
      <span
        v-if="pageCount > 1 && !isDone"
        class="paged-drawer__step-indicator pkt-txt-16-medium"
      >
        {{ $t('general.step', { step: pageIndex, steps: pageCount }) }}
      </span>
      <h1 class="paged-drawer__title">
        <slot name="title" v-bind="slotProps" />
      </h1>
    </template>

    <template #default>
      <slot v-if="!isDone" name="page" v-bind="slotProps" />
      <slot v-else name="done" v-bind="slotProps" />
    </template>

    <template #footer>
      <slot name="footer" v-bind="slotProps">
        <ClappingHands v-if="isDone && isSuccess" class="paged-drawer__graphic" />
      </slot>
    </template>
  </SliderContainer>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.paged-drawer {
  &--done {
    :deep(.sliderContainer__footer) {
      margin: auto -2.5rem -2.5rem;
    }
  }
  &--done#{&}--success {
    :deep(.sliderContainer) {
      background-color: var(--color-green-light);
    }
  }
  &--done#{&}--error {
    :deep(.sliderContainer) {
      background-color: var(--color-red-30);
    }
  }

  &__title {
    @include get-text('pkt-txt-22-medium');

    @include bp('phablet-up') {
      @include get-text('pkt-txt-30-medium');
    }
  }

  &__step-indicator {
    color: var(--color-grayscale-60);
  }

  &__graphic {
    display: block;
  }
}
</style>
