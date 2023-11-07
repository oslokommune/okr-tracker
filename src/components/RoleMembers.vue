<template>
  <div class="role-group">
    <h3 class="title-3">{{ $t('user.position.groups.' + role) }}</h3>
    <div class="role-group__members-list">
      <span v-for="member in membersWithRole" :key="member.id" class="role-group__member">
        <pkt-button size="small" skin="tertiary" @onClick="openProfileModal(member.id)">
          {{ displayName(member) }}
        </pkt-button>
      </span>
    </div>
  </div>
</template>

<script>
import { PktButton } from '@oslokommune/punkt-vue2';

export default {
  name: 'RoleMembers',

  components: {
    PktButton,
  },

  props: {
    role: {
      type: String,
      required: true,
    },
    membersWithRole: {
      type: Array,
      required: true,
    },
  },

  methods: {
    displayName(member) {
      return member.displayName || member.id?.replace(/@.*/, '') || '';
    },

    openProfileModal(profileId) {
      this.$emit('openModal', profileId);
    },
  },
};
</script>

<style lang="scss" scoped>
.title-3 {
  margin: 1rem 0 0.25rem;
  font-weight: 400;
  font-size: 18px;
}

.pkt-btn--small {
  font-size: 18px;
}
</style>
