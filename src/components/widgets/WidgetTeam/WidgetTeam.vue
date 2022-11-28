<template>
  <widget v-if="activeItem.team" :title="$t('general.team')">
    <empty-state
      v-if="!teamMembers"
      :icon="'user-ninja'"
      :heading="$t('empty.team.heading')"
      :body="$t('empty.team.body')"
    />

    <role-members
      v-for="role in sortByDisplayOrder(Object.keys(teamMembers))"
      :key="role"
      :role="role"
      :members-with-role="teamMembers[role]"
      @openModal="openProfileModal"
    />

    <profile-modal
      v-if="showProfileModal"
      :id="chosenProfileId"
      @close="closeProfileModal"
    />

    <router-link
      v-if="memberOrAdmin"
      :to="{ name: 'ItemAdmin' }"
      class="btn btn--fw btn--ter"
    >
      {{ $t('btn.add') }}
    </router-link>
  </widget>
</template>

<script>
import { mapState } from 'vuex';
import {
  possibleDevelopers,
  possibleAdm,
  possibleDesigners,
  displayOrder,
} from '@/config/jobPositions';

export default {
  name: 'WidgetTeam',

  components: {
    Widget: () => import('../WidgetWrapper.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
    RoleMembers: () => import('@/components/widgets/WidgetTeam/RoleMembers.vue'),
    ProfileModal: () => import('@/components/modals/ProfileModal.vue'),
  },

  data: () => ({
    teamMembers: {},
    showProfileModal: false,
    chosenProfileId: null,
  }),

  computed: {
    ...mapState(['activeItem', 'user']),

    memberOrAdmin() {
      try {
        const isAdmin = this.user.admin;
        const isMember = this.activeItem.team.map(({ id }) => id).includes(this.user.id);
        return isAdmin || isMember;
      } catch {
        return false;
      }
    },
  },

  watch: {
    activeItem: {
      immediate: true,
      deep: true,
      handler() {
        this.teamMembers = {};

        this.activeItem.team.forEach((employee) => {
          if (!employee.position) {
            !this.teamMembers.others
              ? (this.teamMembers.others = [employee])
              : this.teamMembers.others.push(employee);
          } else if (possibleDevelopers.includes(employee.position)) {
            !this.teamMembers.developers
              ? (this.teamMembers.developers = [employee])
              : this.teamMembers.developers.push(employee);
          } else if (possibleDesigners.includes(employee.position)) {
            !this.teamMembers.designers
              ? (this.teamMembers.designers = [employee])
              : this.teamMembers.designers.push(employee);
          } else if (possibleAdm.includes(employee.position)) {
            !this.teamMembers.administration
              ? (this.teamMembers.administration = [employee])
              : this.teamMembers.administration.push(employee);
          } else {
            !this.teamMembers[employee.position]
              ? (this.teamMembers[employee.position] = [employee])
              : this.teamMembers[employee.position].push(employee);
          }
        });
      },
    },
  },

  methods: {
    openProfileModal(profileId) {
      this.showProfileModal = true;
      this.chosenProfileId = profileId;
    },

    closeProfileModal() {
      this.showProfileModal = false;
      this.chosenProfileId = null;
    },

    sortByDisplayOrder(roles) {
      return displayOrder.filter((role) => roles.includes(role));
    },
  },
};
</script>
