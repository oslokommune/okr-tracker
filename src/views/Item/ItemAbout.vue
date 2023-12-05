<template>
  <page-layout breakpoint="tablet-big" class="about-page">
    <header class="about-page__header">
      <h1 class="pkt-txt-54">{{ activeItem.name }}</h1>
      <pkt-button
        v-if="hasEditRights"
        v-tooltip="$t('admin.item.change', { name: activeItem.name })"
        skin="tertiary"
        size="small"
        variant="icon-only"
        icon-name="edit"
        @onClick="showItemDrawer = true"
      />
    </header>

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

    <template v-if="hasEditRights || isMemberOfOrganization">
      <h2 class="pkt-txt-30">{{ $t('about.members') }}</h2>
      <role-members
        v-for="role in sortByDisplayOrder(Object.keys(teamMembers))"
        :key="role"
        :role="role"
        :members-with-role="teamMembers[role]"
        @openModal="openProfileModal"
      />
    </template>

    <item-drawer
      v-if="hasEditRights && showItemDrawer"
      :item="activeItem"
      @close="showItemDrawer = false"
    />

    <profile-modal
      v-if="showProfileModal"
      :id="chosenProfileId"
      @close="closeProfileModal"
    />
  </page-layout>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { PktButton } from '@oslokommune/punkt-vue2';
import { isDepartment, isOrganization } from '@/util/getActiveItemType';
import {
  possibleDevelopers,
  possibleAdm,
  possibleDesigners,
  displayOrder,
} from '@/config/jobPositions';
import HTMLOutput from '@/components/HTMLOutput.vue';
import i18n from '@/locale/i18n';
import ItemDrawer from '@/components/drawers/EditItemDrawer.vue';
import ProfileModal from '@/components/modals/ProfileModal.vue';
import RoleMembers from '@/components/RoleMembers.vue';

export default {
  name: 'ItemAbout',

  components: {
    HTMLOutput,
    PktButton,
    ItemDrawer,
    ProfileModal,
    RoleMembers,
  },

  data: () => ({
    showItemDrawer: false,
    showProfileModal: false,
    chosenProfileId: null,
  }),

  computed: {
    ...mapGetters(['hasEditRights', 'tree']),
    ...mapState(['activeItem', 'departments', 'products', 'user']),

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
      if (isOrganization(this.activeItem)) {
        return this.departments.filter(
          (department) => department.organization.id === this.activeItem.id
        );
      }
      if (isDepartment(this.activeItem)) {
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
      if (isOrganization(this.activeItem)) {
        return i18n.t('about.organizationChildren');
      }
      if (isDepartment(this.activeItem)) {
        return i18n.t('about.departmentChildren');
      }

      return null;
    },

    /**
     * Return `true` if the current user is a member of any item in the active
     * item's organization.
     */
    isMemberOfOrganization() {
      const currentOrgId = this.activeItem.organization?.id || this.activeItem.id;
      const org = this.tree.find((o) => o.id === currentOrgId);

      if (org.team.map(({ id }) => id).includes(this.user.id)) {
        return true;
      }

      for (const dep of org.children) {
        if (dep.team.map(({ id }) => id).includes(this.user.id)) {
          return true;
        }

        for (const prod of dep.children) {
          if (prod.team.map(({ id }) => id).includes(this.user.id)) {
            return true;
          }
        }
      }

      return false;
    },
  },

  watch: {
    showItemDrawer(show) {
      if (!show && this.$route.query.edit) {
        this.$router.replace({ query: null });
      }
    },
  },

  mounted() {
    this.showItemDrawer = String(this.$route.query.edit).toLowerCase() === 'true';
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
.about-page {
  padding: 2rem;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

section {
  margin: 2.75rem 0 3.625rem 0;

  .item-info__box:first-of-type h3 {
    margin-top: 1.5rem;
  }
}

h2 {
  margin: 1.25rem 0;
}

h3 {
  margin: 2rem 0 0.5rem;
}
</style>
