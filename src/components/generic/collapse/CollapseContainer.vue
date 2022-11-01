<template>
  <div :class="['collapse', `collapse--${isCollapsed ? 'collapsed' : 'open'}`]">
    <div class="collapse__header" @click="isCollapsed = !isCollapsed">
      <div class="collapse__header-content">
        <slot name="collapse-header" />
      </div>
      <button class="btn btn--ter collapse__toggle">
        <i :class="['fa', `fa-chevron-${isCollapsed ? 'down' : 'up'}`]" />
      </button>
    </div>
    <div v-if="!isCollapsed" class="collapse__body">
      <slot name="collapse-body" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CollapseContainer',

  data: () => ({
    isCollapsed: true,
  }),
};
</script>

<style lang="scss" scoped>
.collapse {
  &__header {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    cursor: pointer;
  }

  &__header-content {
    flex-grow: 1;
  }

  &__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
  }
}
</style>
