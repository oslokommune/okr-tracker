<template>
  <div class="grid grid-3 section">
    <div>
      <h2 class="title title-2">Oppdrag</h2>
      <div v-if="!document.missionStatement" class="content">
        <p>
          <strong>Uh-oh!</strong>
          Her mangler det noe viktig!
        </p>
        <p v-if="user.admin">
          <router-link :to="{ name: type === 'product' ? 'edit-product' : 'edit-department' }"
            >Legg inn en beskrivelse.
          </router-link>
        </p>
      </div>
      <p>{{ document.missionStatement }}</p>
    </div>
    <div>
      <h2 v-if="type === 'organization'" class="title title-2">Produktområder</h2>
      <h2 v-else-if="type === 'department'" class="title title-2">Produkter</h2>
      <h2 v-else-if="type === 'product'" class="title title-2">Team</h2>

      <div v-if="!team.length">
        <ul class="team__list team__list--empty">
          <div class="team__member empty" v-for="i in 3" :key="`empty_${i}`">
            <i v-if="type === 'organization'" class="fa fa-users"></i>
            <i v-if="type === 'department'" class="fa fa-cubes"></i>
            <i v-if="type === 'product'" class="fa fa-user-ninja"></i>
          </div>
        </ul>
        <p v-if="type === 'department'">Finner ingen produkter</p>
        <p v-if="type === 'product'">Finner ingen teammedlemmer – kanskje det bare er ninjaer her?</p>
      </div>

      <ul class="team__list">
        <li class="team__member" v-for="user in team" :key="user.id">
          <template v-if="type === 'organization'">
            <router-link :to="{ name: 'department', params: { slug: user.slug } }">
              <img
                class="team__image"
                :src="user.photoURL || '/placeholder-image.svg'"
                :alt="user.name"
                v-tooltip.auto="user.name"
              />
            </router-link>
          </template>

          <template v-if="type === 'department'">
            <router-link :to="{ name: 'product', params: { slug: user.slug } }">
              <img
                class="team__image"
                :src="user.photoURL || '/placeholder-image.svg'"
                :alt="user.name"
                v-tooltip.auto="user.name"
              />
            </router-link>
          </template>
          <template v-else-if="type === 'product'">
            <router-link :to="{ name: 'profile', params: { slug: user.slug } }">
              <img
                class="team__image"
                :src="user.photoURL || '/placeholder-user.svg'"
                :alt="user.displayName || user.email"
                v-tooltip.auto="user.displayName || user.id"
              />
            </router-link>
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
import { mapState } from 'vuex';
import PieChart from '@/components/PieChart.vue';

export default {
  name: 'DocumentSummary',

  computed: {
    ...mapState(['user']),
  },

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

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  margin: 0.25rem;
  padding: 0.25rem;
  color: $color-grey-500;
  font-size: 1.5rem;
  background: $color-grey-100;
  border-radius: 2rem;
}

.team {
  &__list {
    display: flex;
    flex-wrap: wrap;
    margin: -0.25rem;

    &--empty {
      margin-bottom: 1rem;
    }
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
    width: 4rem;
    height: 4rem;
    border-radius: 2rem;
  }
}
</style>
