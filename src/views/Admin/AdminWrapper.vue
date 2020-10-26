<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'AdminWrapper',

  computed: {
    ...mapState(['user']),
  },

  created() {
    if (!this.user.admin) {
      this.$router.push({ name: 'Home' });
    }
  },
};
</script>
