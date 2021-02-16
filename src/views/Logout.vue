<template>
  <div class="main">
    <h1 class="title-1">{{ $t('logout.header') }}</h1>
    <div class="logout">
      <div v-if="$route.query.reason === 'internal'" class="ok-alert ok-alert--warning">
        {{ $t('logout.reasons.internal') }}
      </div>
      <div v-if="$route.query.reason === 'permission-denied'" class="ok-alert ok-alert--warning">
        {{ $t('logout.reasons.permission-denied') }}
      </div>
      <div v-if="$route.query.reason === 'auth/email-already-in-use'" class="ok-alert ok-alert--warning">
        {{ $t('logout.reasons.email-in-use') }}
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
.logout {
  display: flex;
  flex-direction: column;
  width: span(8);
}
</style>
