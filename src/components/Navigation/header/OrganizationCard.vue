<script setup>
import { computed, inject, ref, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { onClickOutside } from '@vueuse/core';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
import { useTrackerStore } from '@/store/tracker';
import { useActiveOrganizationStore } from '@/store/activeOrganization';
import { PktIcon } from '@oslokommune/punkt-vue';
import { NavMenu, NavMenuItem, NavMenuSwitch } from '../navbar';

const router = useRouter();

defineProps({
  inline: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const { homeOrganization } = storeToRefs(useTrackerStore());
const activeOrganizationStore = useActiveOrganizationStore();
const { organization } = storeToRefs(activeOrganizationStore);

const isOpen = ref(false);
const isHome = computed(() => homeOrganization.value?.slug === organization.value.slug);

const home = computed({
  get() {
    return isHome.value;
  },
  set(checked) {
    homeOrganization.value = checked ? organization.value.slug : null;
  },
});

const closeParent = inject('closeNavMenuDropdown', false);

function changeOrganization() {
  activeOrganizationStore.setOrganization(null);
  if (closeParent) {
    closeParent();
  }
  router.push({ name: 'Home' });
}

function toggle() {
  isOpen.value = !isOpen.value;
}

function close() {
  if (isOpen.value) {
    isOpen.value = false;
  }
}

function keyDown() {
  if (!isOpen.value) {
    isOpen.value = true;
  } else {
    containerTarget.value.querySelector('[role^=menuitem]')?.focus();
  }
}

function keyUp() {
  close();
}

const containerTarget = ref(null);
const { activate, deactivate } = useFocusTrap(containerTarget);

watchEffect(() => {
  if (isOpen.value) {
    activate();
  } else {
    deactivate();
  }
});

onClickOutside(
  containerTarget,
  () => {
    isOpen.value = false;
  },
  {
    ignore: ['.ignore-click-outside'],
  }
);
</script>

<template>
  <div
    v-if="organization"
    ref="containerTarget"
    :class="[
      'organization-card',
      { 'organization-card--inline': inline },
      { 'organization-card--open': isOpen },
    ]"
  >
    <div
      class="organization-card__header"
      tabindex="0"
      role="menu"
      @click="toggle"
      @keyup.enter="toggle"
      @keyup.down="keyDown"
      @keyup.up="keyUp"
      @keyup.esc.capture.stop="close"
    >
      <PktIcon name="organization" class="pkt-icon--medium" />
      <div>
        <div class="organization-card__label">{{ $t('home.organization') }}</div>
        <div class="organization-card__name">{{ organization.name }}</div>
      </div>
      <PktIcon
        class="organization-card__toggle pkt-icon--medium"
        :name="isOpen ? 'chevron-thin-up' : 'chevron-thin-down'"
      />
    </div>

    <div v-if="isOpen" class="organization-card__content">
      <NavMenu v-if="organization" vertical>
        <NavMenuItem
          icon="chevron-left"
          :text="$t('home.changeOrganization')"
          @click="changeOrganization"
        />
        <NavMenuSwitch v-model="home" :text="$t('home.myOrganization')" />
      </NavMenu>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.organization-card {
  $self: &;
  background-color: var(--pkt-color-surface-default-gray);

  &__header {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    padding: 1rem;
    border: 2px solid transparent;
    cursor: pointer;

    &:focus-visible {
      border-color: var(--pkt-color-button-border-focus);
      outline: 4px solid var(--pkt-color-border-states-focus);
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0 1rem 1rem 1rem;
    background-color: inherit;

    :deep(.nav-menu-item__inner:hover),
    :deep(.nav-menu-switch__inner:hover) {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }

  &__label {
    @include get-text('pkt-txt-12-medium');
    color: var(--pkt-color-grays-gray-600);
    line-height: 1rem;
  }

  &__name {
    @include get-text('pkt-txt-16-medium');
  }

  &__toggle {
    margin-left: auto;
  }

  &:not(#{&}--inline) {
    position: relative;

    & #{$self}__content {
      position: absolute;
      z-index: 99;
      width: 100%;
    }
  }

  &:hover {
    & #{$self}__name {
      color: var(--pkt-color-text-action-active);
    }
  }
}
</style>
