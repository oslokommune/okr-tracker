<template>
  <widget v-if="activeItem.team" :title="$t('general.team')">
    <empty-state
      v-if="!activeItem.team.length"
      :icon="'user-ninja'"
      :heading="$t('empty.team.heading')"
      :body="$t('empty.team.body')"
    />

    <template v-if="director">
      <role-members
        :role="$t('user.position.groups.director')"
        :members-with-role="new Array(director)"
        @openModal="openProfileModal"
      />
    </template>

    <template v-if="departmentDirector">
      <role-members
        :role="$t('user.position.groups.departmentDirector')"
        :members-with-role="new Array(departmentDirector)"
        @openModal="openProfileModal"
      />
    </template>

    <template v-if="productOwner">
      <role-members
        :role="$t('user.position.groups.productOwner')"
        :members-with-role="new Array(productOwner)"
        @openModal="openProfileModal"
      />
    </template>

    <template v-if="teamLead">
      <role-members
        :role="$t('user.position.groups.teamLead')"
        :members-with-role="new Array(teamLead)"
        @openModal="openProfileModal"
      />
    </template>

    <template v-if="techLead">
      <role-members
        :role="$t('user.position.groups.techLead')"
        :members-with-role="new Array(techLead)"
        @openModal="openProfileModal"
      />
    </template>

    <template v-if="designLead">
      <role-members
        :role="$t('user.position.groups.designLead')"
        :members-with-role="new Array(designLead)"
        @openModal="openProfileModal"
      />
    </template>

    <template v-if="designers.length > 0">
      <role-members
        :role="$t('user.position.groups.designers')"
        :members-with-role="designers"
        @openModal="openProfileModal"
      />
    </template>

    <template v-if="developers.length > 0">
      <role-members
        :role="$t('user.position.groups.developers')"
        :members-with-role="developers"
        @openModal="openProfileModal"
      />
    </template>

    <template v-if="administration.length > 0">
      <role-members
        :role="$t('user.position.groups.administration')"
        :members-with-role="administration"
        @openModal="openProfileModal"
      />
    </template>

    <template v-if="others.length > 0">
      <role-members
        :role="$t('user.position.groups.others')"
        :members-with-role="others"
        @openModal="openProfileModal"
      />
    </template>

    <profile-modal v-if="showProfileModal" :id="chosenProfileId" @close="closeProfileModal" />

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
    designLead: null,
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
        this.designLead = null;
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
          } else if (employee.position === 'designLead') {
            this.designLead = employee;
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
