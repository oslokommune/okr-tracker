<template>
  <div>
    <a v-if="user.id" class="user-link" @click="$emit('open-user-modal', user.id)">
      <span>{{ user.displayName || user.id }}</span>
    </a>
    <span v-else>{{ user }}</span>
  </div>
</template>

<script>
export default {
  name: 'ProgressHistoryRecord',

  props: {
    user: {
      type: [Object, String],
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.user-link {
  text-decoration: none;
  cursor: pointer;
}
</style>
