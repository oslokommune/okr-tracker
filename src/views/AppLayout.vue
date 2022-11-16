<template>
  <div>
    <site-header class="header" />
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'AppLayout',
  components: {
    SiteHeader: () => import('@/components/Navigation/SiteHeader.vue'),
  },
};
</script>
