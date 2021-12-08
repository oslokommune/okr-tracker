<template>
  <widget v-if="activeItem.team" :title="$t('general.team')">
    <empty-state
      v-if="!activeItem.team.length"
      :icon="'user-ninja'"
      :heading="$t('empty.team.heading')"
      :body="$t('empty.team.body')"
    />

    <template v-if="director">
      <role-members :role="$t('user.position.groups.director')" :membersWithRole="new Array(director)" @openModal="openProfileModal"/>
    </template>

    <template v-if="departmentDirector">
      <role-members :role="$t('user.position.groups.departmentDirector')" :membersWithRole="new Array(departmentDirector)" @openModal="openProfileModal"/>
    </template>

    <template v-if="productOwner">
      <role-members :role="$t('user.position.groups.productOwner')" :membersWithRole="new Array(productOwner)" @openModal="openProfileModal"/>
    </template>

    <template v-if="teamLead">
      <role-members :role="$t('user.position.groups.teamLead')" :membersWithRole="new Array(teamLead)" @openModal="openProfileModal"/>
    </template>

    <template v-if="techLead">
      <role-members :role="$t('user.position.groups.techLead')" :membersWithRole="new Array(techLead)" @openModal="openProfileModal"/>
    </template>

    <template v-if="designers.length > 0">
      <role-members :role="$t('user.position.groups.designers')" :membersWithRole="designers" @openModal="openProfileModal"/>
    </template>

    <template v-if="developers.length > 0">
      <role-members :role="$t('user.position.groups.developers')" :membersWithRole="developers" @openModal="openProfileModal"/>
    </template>

    <template v-if="administration.length > 0">
      <role-members :role="$t('user.position.groups.administration')" :membersWithRole="administration" @openModal="openProfileModal"/>
    </template>

    <template v-if="others.length > 0">
      <role-members :role="$t('user.position.groups.others')" :membersWithRole="others" @openModal="openProfileModal"/>
    </template>

    <profile-modal v-if="showProfileModal" @close="closeProfileModal" :id="this.chosenProfileId"/>

    <router-link v-if="memberOrAdmin" :to="{ name: 'ItemAdmin' }" class="btn btn--fw btn--ter">
      {{ $t('btn.add') }}
    </router-link>
  </widget>
</template>

<script>
import { mapState } from 'vuex';
import { possibleDevelopers, possibleAdm, possibleDesigners } from '@/config/jobPositions';

export default {
  name: 'WidgetTeam',

  components: {
    Widget: () => import('../WidgetWrapper.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
    RoleMembers: () => import('@/components/widgets/WidgetTeam/RoleMembers.vue'),
    ProfileModal: () => import('@/components/ProfileModal.vue'),
  },

  data: () => ({
    developers: [],
    designers: [],
    administration: [],
    others: [],
    techLead: null,
    teamLead: null,
    director: null,
    productOwner: null,
    departmentDirector: null,
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
        this.developers = [];
        this.designers = [];
        this.administration = [];
        this.others = [];
        this.director = null;
        this.techLead = null;
        this.teamLead = null;
        this.productOwner = null;
        this.departmentDirector = null;

        this.activeItem.team.forEach((employee) => {
          if (possibleDevelopers.includes(employee.position)) {
            this.developers.push(employee);
          } else if (possibleDesigners.includes(employee.position)) {
            this.designers.push(employee);
          } else if (possibleAdm.includes(employee.position)) {
            this.administration.push(employee);
          } else if (employee.position === 'director') {
            this.director = employee;
          } else if (employee.position === 'techLead') {
            this.techLead = employee;
          } else if (employee.position === 'teamLead') {
            this.teamLead = employee;
          } else if (employee.position === 'productOwner') {
            this.productOwner = employee;
          } else if (employee.position === 'departmentDirector') {
            this.departmentDirector = employee;
          } else {
            this.others.push(employee);
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
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.users__list {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}

.user__link {
  display: flex;
  align-items: center;
  color: var(--color-text);
  font-weight: 500;
  text-decoration: none;
  word-break: break-all;
}

.user {
  padding: 0.2rem;
  word-break: break-all;

  &:hover {
    background: rgba(var(--color-grey-500-rgb), 0.1);
  }
}

.user__title {
  padding: 0.2rem;
  color: var(--color-grey-300);
  font-weight: 400;
  font-size: typography.$font-size-2;
  letter-spacing: -0.03rem;
}
</style>
