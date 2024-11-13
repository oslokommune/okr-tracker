<script setup>
defineProps({
  user: {
    type: [Object, String],
    required: true,
  },
});
</script>

<template>
  <div>
    <a v-if="user.id" class="user-link" @click="$emit('activate', user.id)">
      <span>{{ user.displayName || user.id }}</span>
    </a>
    <span v-else>{{ user }}</span>
  </div>
</template>

<style lang="scss" scoped>
.user-link {
  text-decoration: none;
  cursor: pointer;
}
</style>
