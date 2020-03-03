<template>
  <div>
    <page-header :data="department || {}"></page-header>

    <the-sub-nav v-if="department" :document="department" />

    <div class="content" v-if="department">
      <div class="container container--sidebar">
        <document-sidebar
          :active-quarter="activeQuarter"
          :document="department"
          :has-edit-permissions="hasEditPermissions"
          type="department"
        ></document-sidebar>

        <main class="content--main content--padding">
          <document-summary :document="department" :team="departmentProducts" type="department"></document-summary>
          <hr />
          <objectives-list :document="department"></objectives-list>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import ClickOutside from 'vue-click-outside';
import { serializeDocument } from '@/db/db';

import PageHeader from '@/components/PageHeader.vue';
import DocumentSidebar from '@/components/DocumentSidebar.vue';
import DocumentSummary from '@/components/DocumentSummary.vue';
import ObjectivesList from '@/components/ObjectivesList.vue';
import TheSubNav from '@/components/TheSubNav.vue';

export default {
  name: 'DepartmentHome',

  data: () => ({
    objectives: [],
    team: [],
  }),

  components: {
    ObjectivesList,
    DocumentSummary,
    DocumentSidebar,
    PageHeader,
    TheSubNav,
  },

  computed: {
    ...mapState(['user', 'activeQuarter', 'departmentProducts', 'department']),

    slug() {
      return this.$route.params.slug;
    },

    hasEditPermissions() {
      if (!this.user) return;
      return this.user.admin;
    },
  },

  watch: {
    activeQuarter() {
      if (!this.department) return;
      this.getObjectives();
    },

    slug(slug) {
      this.watchDepartment(slug);
    },
  },

  created() {
    this.watchDepartment(this.slug);
  },

  methods: {
    ...mapActions(['watchDepartment']),
    getObjectives() {
      this.department.ref
        .collection('objectives')
        .where('archived', '==', false)
        .where('quarter', '==', this.activeQuarter.name)
        .onSnapshot(snapshot => {
          this.objectives = snapshot.docs.map(serializeDocument);
        });
    },
  },

  directives: {
    ClickOutside,
  },
};
</script>

<style lang="scss" scoped>
@import '../../styles/_colors.scss';

.sub-nav__element {
  cursor: pointer;
  user-select: none;
}

.team {
  &__list {
    display: flex;
    flex-wrap: wrap;
    margin: -0.25rem;
  }

  &__member {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 0.25rem;
    text-align: center;
  }

  &__image {
    width: 5rem;
    height: 5rem;
    border-radius: 2.5rem;
  }

  &__name {
    position: absolute;
    top: 5rem;
    left: -50%;
    z-index: 2;
    display: flex;
    justify-content: center;
    width: 200%;
    color: white;
    transform: translateY(-1rem);
    opacity: 0;
    transition: all 0.12s ease-in-out;
    user-select: none;
    pointer-events: none;

    & > span {
      padding: 0.25rem 0.5rem;
      background: $color-purple;
    }
  }
}
</style>
