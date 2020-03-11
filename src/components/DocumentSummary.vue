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
      <div class="md" v-html="displayMarkdown(document.missionStatement)"></div>
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
import marked from 'marked';
import { sanitize } from 'dompurify';
import PieChart from '@/components/PieChart.vue';
import MembersList from '@/components/MembersList.vue';

marked.setOptions({
  smartypants: true,
});

export default {
  name: 'DocumentSummary',

  computed: {
    ...mapState(['user']),
  },

  methods: {
    displayMarkdown(str) {
      return sanitize(marked(str));
    },
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
