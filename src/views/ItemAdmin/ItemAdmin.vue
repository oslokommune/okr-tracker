<template>
  <div>
    <router-link exact :to="{ name: 'ItemAdmin' }">General</router-link>
    <router-link exact :to="{ name: 'ItemAdminOKRs' }">OKRs</router-link>
    <router-link exact :to="{ name: 'ItemAdminKPIs' }">KPIs</router-link>

    <router-view></router-view>
  </div>
</template>

<style lang="scss" scoped>
.router-link-active {
  font-weight: bold;
}
</style>
