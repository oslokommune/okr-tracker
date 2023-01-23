<template>
  <aside v-if="activeItem">
    <div class="widgets">
      <widget-child-items />
    </div>
  </aside>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'WidgetsItemHomeLeft',

  components: {
    WidgetChildItems: () => import('./WidgetChildItems.vue'),
  },

  computed: {
    ...mapState(['activeItem']),
  },
};
</script>
