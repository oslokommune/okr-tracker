<template>
  <router-view></router-view>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'AdminWrapper',

  computed: {
    ...mapState(['user']),
  },

  created() {
    console.log(this.user);
    if (!this.user.admin && !this.user.superAdmin) {
      this.$router.push({ name: 'Home' });
    }
  },
};
</script>
