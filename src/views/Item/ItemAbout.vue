<template>
  <div class="container">
    <main class="main">
      <h1 class="pkt-txt-54">{{ activeItem.name }}</h1>
      <section>
        <HTML-output class="pkt-txt-24-light" :html="activeItem.missionStatement" />
      </section>

      <section v-if="activeItem.targetAudience">
        <h2 class="pkt-txt-30">{{ $t('dashboard.targetAudience') }}</h2>
        <HTML-output class="pkt-txt-18" :html="activeItem.targetAudience" />
      </section>

      <section v-if="children">
        <h2 class="pkt-txt-30">{{ childrenTitle }}</h2>
        <div
          v-for="child in children"
          :key="child.id"
          class="item-info__box item-info__box--link"
        >
          <h3 class="pkt-txt-24">{{ child.name }}</h3>
          <HTML-output class="pkt-txt-18" :html="child.missionStatement" />
        </div>
      </section>

      <!--
      <h2 class="pkt-txt-30">{{ $t('about.members') }}</h2>
      <role-members
        v-for="role in sortByDisplayOrder(Object.keys(teamMembers))"
        :key="role"
        :role="role"
        :members-with-role="teamMembers[role]"
        @openModal="openProfileModal"
      />
      -->

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
    // RoleMembers: () => import('@/components/RoleMembers.vue'),
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
        return i18n.t('about.organizationChildren');
      }
      if (itemType === 'department') {
        return i18n.t('about.departmentChildren');
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
}

section {
  margin: 2.75rem 0 3.625rem 0;

  .item-info__box:first-of-type h3 {
    margin-top: 1.5rem;
  }

  &:last-of-type {
    margin-bottom: 1.5rem;
  }
}

h2 {
  margin: 1.25rem 0;
}

h3 {
  margin: 2rem 0 0.5rem;
}
</style>
