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
            v-for="quarter in quartersList"
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
            :class="{ active: selectedObjective && selectedObjective.id === objective.id }"
          >
            {{ objective.objective_title }}
          </div>
          <div v-if="selectedQuarter" class="miller__col__item miller__col__add" @click="addObjective">+ Legg til</div>
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
              :class="{ active: selectedKeyres && selectedKeyres.id === keyres.id }"
            >
              {{ keyres.key_result }}
            </div>
          </template>
          <div
            v-if="selectedQuarter && selectedObjective"
            class="miller__col__item miller__col__add"
            @click="addKeyres"
          >
            + Legg til
          </div>
        </div>

        <main class="miller__main">
          <UpdateKeyres
            v-if="activeLevel === 'keyres'"
            :keyres="selectedKeyres"
            @archived="selectedKeyres = null"
          ></UpdateKeyres>
          <EditObjective
            v-if="selectedObjective && activeLevel === 'objective'"
            :objective-ref="selectedObjective"
          ></EditObjective>
        </main>
      </div>
    </main>
  </div>
</template>

<script>
import ClickOutside from 'vue-click-outside';
import { mapState } from 'vuex';
import { getQuarter } from 'date-fns';
import { serializeDocument } from '../../util/db';
import UpdateKeyres from '../../components/KeyRes/editKeyres.vue';
import EditObjective from '../../components/Objective/editObjective.vue';
import * as Toast from '../../util/toasts';

export default {
  name: 'EditObjectivesAndKeyResults',

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
    ...mapState(['quarters', 'user']),

    // Add next quarter to this list, allowing users to set future objectives
    quartersList() {
      const nextStartDate = this.quarters[0].toDate;
      const quarter = getQuarter(nextStartDate);
      const year = nextStartDate.getFullYear();
      const nextQuarter = {
        name: `Q${quarter} ${year}`,
      };

      return [nextQuarter, ...this.quarters];
    },
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

  watch: {
    objectives(newList) {
      if (!newList.length) {
        this.selectedObjective = null;
      }
    },
  },

  directives: {
    ClickOutside,
  },

  async mounted() {
    const { keyres, objective } = this.$route.params;

    if (keyres && objective) {
      const quarter = this.quarters.find(q => q.name === objective.quarter);
      this.selectedQuarter = quarter;
      this.selectQuarter(quarter);
      this.selectObjective(objective);
      this.selectKeyres(keyres);
    } else {
      const [firstQuarter] = this.quarters;
      this.selectedQuarter = firstQuarter;
      this.selectQuarter(this.selectedQuarter);
    }
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

    async selectObjective(objective) {
      if (!objective || !objective.id) return;

      this.selectedKeyres = null;
      this.selectedObjective = objective;

      objective.ref
        .collection('key_results')
        .where('archived', '==', false)
        .onSnapshot(async snapshot => {
          this.key_results = await snapshot.docs.map(serializeDocument);
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

    addObjective() {
      this.docref
        .collection('objectives')
        .add({
          created_by: this.user.ref,
          created: new Date(),
          quarter: this.selectedQuarter.name,
          archived: false,
          icon: 'trophy',
          objective_title: 'Nytt mål',
          objective_body: '',
        })
        .then(() => {
          return Toast.addedObjective(this.selectedQuarter.name);
        })
        .then(() => {})
        .catch(this.$errorHandler);
    },

    addKeyres() {
      if (!this.selectedObjective) return;

      // console.dir(this.selectedObjective);
      // return;

      this.selectedObjective.ref
        .collection('key_results')
        .add({
          archived: false,
          key_result: 'Beskriv nøkkelresultatet',
          start_value: 0,
          target_value: 100,
          created: new Date(),
          created_by: this.user.ref,
          unit: '',
        })
        .then(response => {
          Toast.addedKeyResult();
          return response;
        })
        .catch(this.$errorHandler);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../styles/_miller';

.add {
  position: relative;
}
</style>
