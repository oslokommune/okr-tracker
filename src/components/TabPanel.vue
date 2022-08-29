<template>
  <div
    :id="tabIds.tabPanel(activeTab)"
    role="tabpanel"
    tabindex="0"
    :aria-labelledby="tabIds.tabButton(activeTab)"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: 'TabPanel',

  props: {
    activeTab: {
      type: Number,
      required: true,
    },
    tabIds: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped></style>
