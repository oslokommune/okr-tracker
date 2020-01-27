<template>
  <div class="grid grid-3 section">
    <div>
      <h2 class="title title-2">Oppdrag</h2>
      <p>{{ document.mission_statement }}</p>
    </div>
    <div>
      <h2 v-if="type === 'department'" class="title title-2">Produkter</h2>
      <h2 v-else-if="type === 'product'" class="title title-2">Team</h2>
      <ul class="team__list">
        <li class="team__member" v-for="user in team" :key="user.id">
          <template v-if="type === 'department'">
            <router-link :to="{ name: 'product', params: { slug: user.slug } }">
              <img class="team__image" :src="user.photoURL || '/placeholder-user.svg'" :alt="user.name" />
              <div class="team__name">
                <span>{{ user.name }}</span>
              </div>
            </router-link>
          </template>
          <template v-else-if="type === 'product'">
            <img class="team__image" :src="user.photoURL || '/placeholder-user.svg'" :alt="user.displayName" />
            <div class="team__name">
              <span>{{ user.displayName }}</span>
            </div>
          </template>
        </li>
      </ul>
    </div>
    <div>
      <h2 class="title title-2">Denne perioden</h2>
      <pie-chart :document="document"></pie-chart>
    </div>
  </div>
</template>

<script>
import PieChart from './PieChart.vue';

export default {
  name: 'DocumentSummary',

  props: {
    document: {
      type: Object,
      required: true,
    },
    team: {
      type: Array,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },

  components: {
    PieChart,
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/colors';

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
