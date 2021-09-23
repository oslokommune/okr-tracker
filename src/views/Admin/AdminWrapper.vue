<template>
  <router-view></router-view>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'AdminWrapper',

  computed: {
    ...mapState(['user']),
    ...mapGetters(['isAdmin']),
  },

  created() {
    console.log(this.user);
    if (!this.isAdmin && !this.user.superAdmin) {
      this.$router.push({ name: 'Home' });
    }
  },
};
</script>
