<template>
  <div>
    <PageHeader :data="department || {}"></PageHeader>

    <nav class="sub-nav">
      <div class="container container--sidebar">
        <div class="content--main">
          <span
            v-for="quarter in quarters"
            :key="quarter.name"
            class="sub-nav__element"
            :class="{ 'router-link-active': quarter === activeQuarter }"
            @click="activeQuarter = quarter"
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
        />

        <main class="content--main content--padding">
          <div class="grid grid-3 section">
            <pre>{{ department.progress }}</pre>
            <div>
              <h2 class="title title-2">Oppdrag</h2>
              <p>{{ department.mission_statement }}</p>
            </div>
            <div>
              <h2 class="title title-2">Produkter</h2>
              <ul class="team__list">
                <li class="team__member" v-for="prod in products" :key="prod.id">
                  <router-link :to="{ name: 'product', params: { slug: prod.slug } }">
                    <img class="team__image" :src="prod.photoURL || '/placeholder-user.svg'" :alt="user.displayName" />
                    <div class="team__name">
                      <span>{{ prod.name }}</span>
                    </div>
                  </router-link>
                </li>
              </ul>
            </div>
            <div>
              <h2 class="title title-2">Denne perioden</h2>
            </div>
          </div>
          <hr />
          <section class="section">
            <h2 class="title title-2">Mål</h2>
            <TheObjective v-for="objective in objectives" :key="objective.id" :objective="objective"></TheObjective>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ClickOutside from 'vue-click-outside';
import { departmentFromSlug, serializeDocument } from '@/util/db';

import PageHeader from '@/components/PageHeader.vue';
import TheObjective from '@/components/Objective/TheObjective.vue';
import DocumentSidebar from '../../components/DocumentSidebar.vue';

export default {
  name: 'Department',

  data: () => ({
    department: null,
    products: null,
    objectives: [],
    team: [],
    activeQuarter: null,
    expandAddObjective: false,
    expandAddKeyRes: false,
  }),

  components: {
    DocumentSidebar,
    PageHeader,
    TheObjective,
  },

  computed: {
    ...mapState(['user', 'quarters']),

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

  async mounted() {
    this.department = await departmentFromSlug.call(this, this.$route.params.slug);
    const [first] = this.quarters;
    this.activeQuarter = first;
    this.getObjectives();
  },

  methods: {
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

    &:hover .team__name {
      transform: translateY(0);
      opacity: 1;
    }
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
