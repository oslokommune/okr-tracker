<template>
  <div
    :id="`tabsPanel-${activeTab}`"
    role="tabpanel"
    tabindex="0"
    :aria-labelledby="`tabsButton-${activeTab}`"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: 'TabsPanel',

  props: {
    activeTab: {
      type: Number,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped></style>
