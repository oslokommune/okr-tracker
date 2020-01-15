<template>
  <div class="container container--sidebar">
    <aside class="content--sidebar"></aside>

    <main class="content--main content--padding section">
      <div class="content-header">
        <h2 class="title-2">Administrer mål og nøkkelresultater</h2>
        <span class="quarter-selector__label">Velg kvartal</span>
        <v-select
          v-if="quarters"
          label="name"
          class="quarter-selector__selector"
          :options="quarters"
          v-model="selectedQuarter"
        ></v-select>
      </div>

      <div class="miller">
        <!-- Quarters -->
        <div class="miller__col" :class="{ active: activeLevel === 'quarter' }">
          <h3 class="miller__col__header">Kvartal</h3>
          <div
            class="miller__col__item"
            v-for="quarter in quarters"
            :key="quarter.name"
            @click="selectQuarter(quarter)"
            :class="{ active: selectedQuarter === quarter }"
          >
            {{ quarter.name }}
          </div>
        </div>

        <!-- Objectives -->
        <div class="miller__col" :class="{ active: activeLevel === 'objective' }">
          <h3 class="miller__col__header">Mål</h3>
          <div
            class="miller__col__item"
            v-for="objective in objectives"
            :key="objective.id"
            @click="selectObjective(objective)"
            :class="{ active: selectedObjective === objective }"
          >
            {{ objective.objective_title }}
          </div>
        </div>

        <!-- Key results -->
        <div class="miller__col" :class="{ active: activeLevel === 'keyres' }">
          <h3 class="miller__col__header">Nøkkelresultat</h3>
          <template v-if="selectedObjective">
            <div
              class="miller__col__item"
              v-for="keyres in key_results"
              :key="keyres.id"
              @click="selectKeyres(keyres)"
              :class="{ active: selectedKeyres === keyres }"
            >
              {{ keyres.key_result }}
            </div>
          </template>
        </div>

        <main class="miller__main">
          <UpdateKeyres
            v-if="activeLevel === 'keyres'"
            :keyres="selectedKeyres"
            @archived="selectedKeyres = null"
          ></UpdateKeyres>
          <EditObjective v-if="activeLevel === 'objective'" :objective-ref="selectedObjective"></EditObjective>
        </main>
      </div>
    </main>
  </div>
</template>

<script>
import ClickOutside from 'vue-click-outside';
import { mapState } from 'vuex';
import { serializeDocument } from '../../util/db';
import UpdateKeyres from '@/components/KeyRes/editKeyres.vue';
import EditObjective from '@/components/Objective/editObjective.vue';

export default {
  components: {
    UpdateKeyres,
    EditObjective,
  },

  data: () => ({
    modalIsOpen: false,
    product: null,
    selectedQuarter: null,
    selectedObjective: null,
    selectedKeyres: null,
    objectives: null,
    key_results: [],
  }),

  computed: {
    ...mapState(['quarters']),
    activeLevel() {
      if (this.selectedKeyres) return 'keyres';
      if (this.selectedObjective) return 'objective';
      if (this.selectedQuarter) return 'quarter';
      return false;
    },
  },

  props: {
    docref: {
      type: Object,
      required: true,
    },
  },

  directives: {
    ClickOutside,
  },

  async mounted() {
    const [firstQuarter] = this.quarters;
    this.selectedQuarter = firstQuarter;
    this.selectQuarter(this.selectedQuarter);
  },

  methods: {
    openModal() {
      this.modalIsOpen = true;
    },
    closeModal() {
      this.modalIsOpen = false;
    },

    selectKeyres(keyres) {
      this.selectedKeyres = keyres;
    },

    selectObjective(objective) {
      this.selectedKeyres = null;
      this.selectedObjective = objective;

      objective.ref
        .collection('key_results')
        .where('archived', '==', false)
        .onSnapshot(async snapshot => {
          this.key_results = await snapshot.docs.map(serializeDocument);
          console.log(this.key_results);
        });
    },

    selectQuarter(quarter) {
      this.selectedQuarter = quarter;
      this.selectedObjective = null;
      this.selectedKeyres = null;

      this.docref
        .collection('objectives')
        .where('quarter', '==', quarter.name)
        .where('archived', '==', false)
        .onSnapshot(snapshot => {
          this.objectives = snapshot.docs.map(serializeDocument);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_miller';

.add {
  position: relative;
}
</style>
