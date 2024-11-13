<script setup>
import { PktButton } from '@oslokommune/punkt-vue';

defineProps({
  role: {
    type: String,
    required: true,
  },
  membersWithRole: {
    type: Array,
    required: true,
  },
});

function getDisplayName(member) {
  return member.displayName || member.id?.replace(/@.*/, '') || '';
}
</script>

<template>
  <div class="role-group">
    <h3 class="pkt-txt-18 mt-size-16 mb-size-4">
      {{ $t('user.position.groups.' + role) }}
    </h3>
    <div class="role-group__members-list">
      <span v-for="member in membersWithRole" :key="member.id" class="role-group__member">
        <PktButton size="small" skin="tertiary" @click="$emit('open-modal', member.id)">
          {{ getDisplayName(member) }}
        </PktButton>
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pkt-btn--small {
  font-size: 18px;
}
</style>
