<template>
  <div v-if="product">
    <header class="page-header">
      <div class="container">
        <div class="page-header__container">
          <div class="page-header__name">
            <h1 class="title-1">{{ product.name }}</h1>
          </div>

          <img
            :src="product.photoURL || '/placeholder-image.svg'"
            :alt="`Profilbilde for ${product.name}`"
            class="page-header__profile-image"
          />
        </div>
      </div>
    </header>

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

    <div class="content">
      <div class="container container--sidebar">
        <aside class="content--sidebar">
          <nav class="sidebar-nav">
            <template v-if="hasEditPermissions">
              <router-link
                :to="{ name: 'edit-product', params: { slug: $route.params.slug } }"
                class="sidebar-nav__item"
              >
                <i class="fa fas fa-fw fa-edit"></i>Endre produkt</router-link
              >
              <div class="add-object-menu-wrapper" v-click-outside="closeAddObjective">
                <div class="sidebar-nav__item" @click="expandAddObjective = true">
                  <i class="fa fas fa-fw fa-plus"></i>Legg til mål
                </div>

                <add-objective
                  v-if="expandAddObjective"
                  :productref="product.ref"
                  @close-menu="expandAddObjective = false"
                ></add-objective>
              </div>

              <div class="add-object-menu-wrapper" v-click-outside="closeAddKeyres">
                <div class="sidebar-nav__item" @click="expandAddKeyRes = true">
                  <i class="fa fas fa-fw fa-plus"></i>Nytt nøkkelresultat
                </div>
                <add-keyres
                  v-if="expandAddKeyRes"
                  @close-menu="expandAddKeyRes = false"
                  :productref="product.ref"
                  :selected-quarter-name="activeQuarter.name"
                ></add-keyres>
              </div>

              <div class="sidebar-nav__item"><i class="fa fas fa-fw fa-chart-line"></i>Oppdater data</div>
            </template>
            <div class="sidebar-nav__item"><i class="fa fas fa-fw fa-dashboard"></i>Dashboard</div>
            <div class="sidebar-nav__item"><i class="fa fas fa-fw fa-photo"></i>Eksporter grafikk</div>
          </nav>
        </aside>

        <main class="content--main content--padding">
          <div class="grid grid-3 section">
            <div>
              <h2 class="title title-2">Oppdrag</h2>
              <p>{{ product.mission_statement }}</p>
            </div>
            <div>
              <h2 class="title title-2">Team</h2>
              <ul class="team__list">
                <li class="team__member" v-for="user in team" :key="user.id">
                  <img class="team__image" :src="user.photoURL || '/placeholder-user.svg'" :alt="user.displayName" />
                  <div class="team__name">
                    <span>{{ user.displayName }}</span>
                  </div>
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
import { serializeDocument, productFromSlug } from '@/util/db';

import AddObjective from '@/components/Objective/addObjective.vue';
import AddKeyres from '@/components/KeyRes/addKeyres.vue';
import TheObjective from '@/components/TheObjective.vue';

export default {
  name: 'Product',

  data: () => ({
    product: null,
    objectives: [],
    team: [],
    activeQuarter: null,
    expandAddObjective: false,
    expandAddKeyRes: false,
  }),

  components: {
    AddObjective,
    AddKeyres,
    TheObjective,
  },

  computed: {
    ...mapState(['user', 'quarters']),

    hasEditPermissions() {
      if (!this.user) return;
      if (this.user.admin) return true;

      return this.product.team.map(d => d.id).includes(this.user.id);
    },
  },

  watch: {
    activeQuarter() {
      if (!this.product) return;
      this.getObjectives();
    },

    async product(prod) {
      const teamPromises = prod.team.map(d => d.get());
      this.team = await Promise.all(teamPromises).then(d => d.map(serializeDocument));
    },
  },

  async mounted() {
    this.product = await productFromSlug.call(this, this.$route.params.slug);
    const [first] = this.quarters;
    this.activeQuarter = first;
    this.getObjectives();
  },

  methods: {
    getObjectives() {
      this.product.ref
        .collection('objectives')
        .where('archived', '==', false)
        .where('quarter', '==', this.activeQuarter.name)
        .onSnapshot(snapshot => {
          this.objectives = snapshot.docs.map(serializeDocument);
        });
    },

    closeAddObjective() {
      this.expandAddObjective = false;
    },
    closeAddKeyres() {
      this.expandAddKeyRes = false;
    },
  },
  directives: {
    ClickOutside,
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/colors';

.add-object-menu-wrapper {
  position: relative;
}

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
