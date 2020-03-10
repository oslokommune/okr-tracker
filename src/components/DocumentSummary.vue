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
          <router-link :to="{ name: type === 'product' ? 'edit-product' : 'edit-department' }">
            Legg inn en beskrivelse.
          </router-link>
        </p>
      </div>
      <p>{{ document.missionStatement }}</p>
    </div>
    <MembersList :type="type" :team="team"></MembersList>
    <div>
      <h2 class="title title-2">Denne perioden</h2>
      <pie-chart :document="document"></pie-chart>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import PieChart from '@/components/PieChart.vue';
import MembersList from '@/components/MembersList.vue';

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
    MembersList,
  },
};
</script>
