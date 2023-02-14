<template>
  <div class="container">
    <div class="main">
      <h1 class="title-1">{{ $t('logout.header') }}</h1>
      <div class="logout">
        <pkt-alert v-if="reason" skin="warning">
          <template #content>
            {{ reason }}
          </template>
        </pkt-alert>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Logout',
  components: {
    PktAlert: () => import('@oslokommune/punkt-vue2').then(({ PktAlert }) => PktAlert),
  },
  computed: {
    reason() {
      switch (this.$route.query.reason) {
        case 'internal':
          return this.$t('logout.reasons.internal');
        case 'permission-denied':
          return this.$t('logout.reasons.permission-denied');
        case 'auth/email-already-in-use':
          return this.$t('logout.reasons.email-in-use');
        case 'email-not-whitelisted':
          return this.$t('logout.reasons.email-not-whitelisted');
        default:
          return null;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.main {
  position: relative;
  width: span(8);
  padding: 1.5rem 0;

  @media screen and (min-width: bp(m)) {
    width: span(5);
    margin-left: span(3, 1);
  }

  @media screen and (min-width: bp(l)) {
    margin-left: span(2, 1);
  }

  @media screen and (min-width: bp(xl)) {
    margin-left: span(3, 1);
  }
}
</style>
