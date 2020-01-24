<template>
  <div>
    <page-header :data="department || {}"></page-header>

    <nav class="sub-nav">
      <div class="container container--sidebar">
        <div class="content--main">
          <span
            v-for="quarter in quarters"
            :key="quarter.name"
            class="sub-nav__element"
            :class="{ 'router-link-active': quarter === activeQuarter }"
            @click="setQuarter(quarter)"
            >{{ quarter.name }}</span
          >
        </div>
      </div>
    </nav>

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
import { serializeDocument } from '../../util/db';

import PageHeader from '../../components/PageHeader.vue';
import DocumentSidebar from '../../components/DocumentSidebar.vue';
import DocumentSummary from '../../components/DocumentSummary.vue';
import ObjectivesList from '../../components/ObjectivesList.vue';

export default {
  name: 'Department',

  data: () => ({
    objectives: [],
    team: [],
  }),

  components: {
    ObjectivesList,
    DocumentSummary,
    DocumentSidebar,
    PageHeader,
  },

  computed: {
    ...mapState(['user', 'quarters', 'activeQuarter', 'departmentProducts', 'department']),

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
  },

  created() {
    this.watchDepartment(this.$route.params.slug);
  },

  methods: {
    ...mapActions(['setQuarter', 'watchDepartment']),
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
@import '../../styles/colors';

.sub-nav__element {
  cursor: pointer;
  user-select: none;
}

.button--tab {
  position: relative;
  display: inline-block;
  padding: 0.75rem 0.5rem;
  color: $color-purple;
  background: none;

  border: none;

  &.active {
    position: relative;
    cursor: default;

    &::after {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      height: 4px;
      background-color: $color-purple;
      content: '';
    }
  }
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
