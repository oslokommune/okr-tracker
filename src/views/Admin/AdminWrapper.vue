<template>
  <router-view></router-view>
</template>

<script>
import { mapState } from 'vuex';
import isAdmin from '@/util/user';

export default {
  name: 'AdminWrapper',

  computed: {
    ...mapState(['user']),
  },

  created() {
    if (!isAdmin(this.user)) {
      this.$router.push({ name: 'Home' });
    }
  },
};
</script>
