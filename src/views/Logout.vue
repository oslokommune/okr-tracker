<template>
  <div class="container">
    <div class="main">
      <h1 class="title-1">{{ $t('logout.header') }}</h1>
      <div class="logout">
        <div v-if="$route.query.reason === 'internal'" class="ok-alert ok-alert--warning">
          {{ $t('logout.reasons.internal') }}
        </div>
        <div
          v-if="$route.query.reason === 'permission-denied'"
          class="ok-alert ok-alert--warning"
        >
          {{ $t('logout.reasons.permission-denied') }}
        </div>
        <div
          v-if="$route.query.reason === 'auth/email-already-in-use'"
          class="ok-alert ok-alert--warning"
        >
          {{ $t('logout.reasons.email-in-use') }}
        </div>
      </div>
      <div
        v-if="$route.query.reason === 'email-not-whitelisted'"
        class="ok-alert ok-alert--warning"
      >
        {{ $t('logout.reasons.email-not-whitelisted') }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Logout',
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
