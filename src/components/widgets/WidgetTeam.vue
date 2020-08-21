<template>
  <Widget v-if="activeItem.team" title="Team" icon="users">
    <ul>
      <li v-for="user in activeItem.team" :key="user.id">
        {{ user.id }}
      </li>

      <button>+ Legg til</button>
    </ul>
  </Widget>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['activeItem']),
  },

  components: {
    Widget: () => import('./Widget.vue'),
  },
};
</script>
