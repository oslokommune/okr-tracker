<template>
  <div v-if="product">
    <header class="product-header">
      <div class="container">
        <div class="product-header__container">
          <div class="product-header__name">
            <h1 class="title-1">{{ product.name }}</h1>
          </div>

          <img
            :src="product.photoURL || '/placeholder-image.svg'"
            :alt="`Profilbilde for ${product.name}`"
            class="product-header__profile-image"
          />
          <span class="product-header__edit" v-if="editPermissions">
            <router-link :to="{ name: 'edit-product', params: { slug: $route.params.slug } }">
              Endre produkt
            </router-link>
          </span>
        </div>
      </div>
    </header>

    <nav class="sub-nav">
      <div class="container container--sidebar">
        <a
          v-for="quarter in quarters"
          :key="quarter.name"
          class="sub-nav__element"
          href="#"
          :class="{ 'router-link-active': quarter === activeQuarter }"
          @click="activeQuarter = quarter"
          >{{ quarter.name }}</a
        >
      </div>
    </nav>

    <div class="content">
      <div class="container container--sidebar">
        <div class="grid grid-3 section">
          <section class="section">
            <h2 class="title title-2">Oppdrag</h2>
            <p>{{ product.mission_statement }}</p>
          </section>
          <section class="section">
            <h2 class="title title-2">Team</h2>
            <ul class="team__list">
              <li class="team__member" v-for="user in team" :key="user.id">
                <img class="team__image" :src="user.photoURL || '/placeholder-user.svg'" :alt="user.displayName" />
                <div class="team__name">
                  <span>{{ user.displayName }}</span>
                </div>
              </li>
            </ul>
          </section>
          <section class="section">
            <h2 class="title title-2">Denne perioden</h2>
          </section>
        </div>

        <hr />
        <section class="section">
          <h2 class="title title-2">Mål</h2>
          <TheObjective v-for="objective in objectives" :key="objective.id" :objective="objective"></TheObjective>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { productListener, serializeDocument } from '@/util/db';
import TheObjective from '@/components/TheObjective.vue';

export default {
  name: 'Product',

  data: () => ({
    product: null,
    objectives: [],
    team: [],
    activeQuarter: {
      name: null,
      isActive: false,
    },
  }),

  components: {
    TheObjective,
  },

  computed: {
    ...mapState(['user', 'quarters']),
    editPermissions() {
      if (this.user.admin) return true;
      return this.product.team.map(d => d.id).includes(this.user.id);
    },
  },

  watch: {
    quarters(list) {
      this.activeQuarter = list[0];
    },

    activeQuarter(active) {
      if (!this.product) return;
      this.product.ref
        .collection('objectives')
        .where('archived', '==', false)
        .where('quarter', '==', active.name)
        .onSnapshot(snapshot => {
          this.objectives = snapshot.docs.map(serializeDocument);
        });
    },

    async product(prod) {
      const teamPromises = prod.team.map(d => d.get());
      this.team = await Promise.all(teamPromises).then(d => d.map(serializeDocument));
    },
  },

  mounted() {
    productListener.call(this, this.$route.params.slug);
    this.activeQuarter = this.quarters[0];
  },

  methods: {
    setQuarter(targetIndex) {
      this.quarters.forEach((quarter, i) => {
        quarter.isActive = targetIndex === i;
      });
      this.activeQuarter = this.quarters.find(d => d.isActive);
      // this.quarters[i].isCurrent = true;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/colors';

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
