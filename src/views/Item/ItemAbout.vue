<template>
  <div class="container">
    <main class="main">
      <h1 class="title-1">{{ activeItem.name }}</h1>
      <section class="mission-statement">
        <HTML-output :html="activeItem.missionStatement" />
      </section>

      <section v-if="activeItem.targetAudience">
        <h2 class="title-2">{{ $t('dashboard.targetAudience') }}</h2>
        <HTML-output :html="activeItem.targetAudience" />
      </section>

      <section v-if="children">
        <h2 class="title-2">{{ childrenTitle }}</h2>
        <div
          v-for="child in children"
          :key="child.id"
          class="item-info__box item-info__box--link"
        >
          <h3 class="title-3">{{ child.name }}</h3>
          <HTML-output :html="child.missionStatement" />
        </div>
      </section>

      <h2 class="title-2">{{ $t('about.members') }}</h2>
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
    </main>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import {
  possibleDevelopers,
  possibleAdm,
  possibleDesigners,
  displayOrder,
} from '@/config/jobPositions';
import HTMLOutput from '@/components/HTMLOutput.vue';
import getActiveItemType from '@/util/getActiveItemType';
import i18n from '@/locale/i18n';

export default {
  name: 'ItemAbout',

  components: {
    HTMLOutput,
    RoleMembers: () => import('@/components/RoleMembers.vue'),
    ProfileModal: () => import('@/components/modals/ProfileModal.vue'),
  },

  data: () => ({
    showProfileModal: false,
    chosenProfileId: null,
  }),

  computed: {
    ...mapState(['activeItem', 'departments', 'products']),

    teamMembers() {
      const members = {};

      this.activeItem.team.forEach((employee) => {
        if (!employee.position) {
          if (!members.others) {
            members.others = [];
          }
          members.others.push(employee);
        } else if (possibleDevelopers.includes(employee.position)) {
          if (!members.developers) {
            members.developers = [];
          }
          members.developers.push(employee);
        } else if (possibleDesigners.includes(employee.position)) {
          if (!members.designers) {
            members.designers = [];
          }
          members.designers.push(employee);
        } else if (possibleAdm.includes(employee.position)) {
          if (!members.administration) {
            members.administration = [];
          }
          members.administration.push(employee);
        } else {
          if (!members[employee.position]) {
            members[employee.position] = [];
          }
          members[employee.position].push(employee);
        }
      });

      return members;
    },

    children() {
      const itemType = getActiveItemType(this.activeItem);

      if (itemType === 'organization') {
        return this.departments.filter(
          (department) => department.organization.id === this.activeItem.id
        );
      }
      if (itemType === 'department') {
        return this.products.filter(
          (product) => product.department.id === this.activeItem.id
        );
      }

      return null;
    },

    /**
     * Return a fitting title for the list of sub-items under the current item.
     */
    childrenTitle() {
      const itemType = getActiveItemType(this.activeItem);

      if (itemType === 'organization') {
        return i18n.t('about.aboutDepartment');
      }
      if (itemType === 'department') {
        return i18n.t('about.aboutProduct');
      }

      return null;
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

<style lang="scss" scoped>
@use '@/styles/typography';

.main {
  padding: 2rem;
  font-size: typography.$font-size-3;
  background-color: var(--color-white);
}

.title-1 {
  margin: 2rem 0;
  font-weight: 400;
  font-size: typography.$font-size-7;
}

.title-2 {
  margin: 5rem 0 2rem;
  font-weight: 400;
  font-size: typography.$font-size-6;
}

.title-3 {
  margin: 2rem 0 1rem;
  font-weight: 400;
  font-size: typography.$font-size-5;
}

.mission-statement {
  margin: 5rem 0;
  font-size: typography.$font-size-5;
  line-height: 2.25rem;
}
</style>
