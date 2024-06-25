<template>
  <!-- <page-layout breakpoint="tablet-big"> -->
  <div
    style="
      margin: 0.5rem;
      padding: 0.5rem;
      font-size: 0.75rem;
      line-height: 1rem;
      border: 2px solid pink;
    "
  >
    {{ user }}
  </div>
  <user-profile-form :user="user" />
  <!-- </page-layout> -->
</template>

<script>
import { mapState } from 'vuex';
import UserProfileForm from '@/components/forms/UserProfileForm.vue';

export default {
  name: 'Test',

  components: {
    UserProfileForm,
  },

  data: () => ({
    // user: null,
  }),

  computed: {
    ...mapState('okrs', { okrPeriod: 'selectedPeriod' }),
    ...mapState(['user']),

    me() {
      return this.$store.state.user?.id === this.user?.id;
    },
  },

  watch: {
    // id: {
    //   immediate: true,
    //   async handler(id) {
    //     const userRef = await db.doc(`users/${id}`);
    //     this.$bind('user', userRef);
    //   },
    // },
  },

  mounted() {},
};
</script>

<!-- <style lang="scss"></style> -->
