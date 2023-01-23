<template>
  <aside v-if="activeItem">
    <div class="widgets"></div>
  </aside>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'WidgetsItemHomeLeft',

  computed: {
    ...mapState(['activeItem']),
  },
};
</script>
