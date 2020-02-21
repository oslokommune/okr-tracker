<template>
  <div class="container container--sidebar">
    <aside class="content--sidebar"></aside>

    <main class="content--main content--padding section">
      <div class="content-header">
        <h2 class="title-2">Administrer mål og nøkkelresultater</h2>
      </div>

      <div class="miller__container">
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
              {{ objective.name }}
            </div>
            <div
              v-if="selectedQuarter"
              class="miller__col__item miller__col__add"
              @click="addObjective"
              v-tooltip.bottom="`Legg til et mål for valgt kvartal`"
            >
              + Legg til
            </div>
          </div>

          <!-- Key results -->
          <div class="miller__col" :class="{ active: activeLevel === 'keyres' }">
            <h3 class="miller__col__header">Nøkkelresultat</h3>
            <template v-if="selectedObjective">
              <div
                class="miller__col__item"
                v-for="keyres in keyResults"
                :key="keyres.id"
                @click="selectKeyres(keyres)"
                :class="{ active: selectedKeyres && selectedKeyres.id === keyres.id }"
              >
                {{ keyres.description }}
              </div>
            </template>
            <div
              v-if="selectedQuarter && selectedObjective"
              class="miller__col__item miller__col__add"
              @click="addKeyres"
              v-tooltip.bottom="`Legg til et nøkkelresultat for valgt mål`"
            >
              + Legg til
            </div>
          </div>

          <main
            class="miller__main"
            v-tooltip.top="activeLevel === 'quarter' ? `Tomt? Velg et mål eller nøkkelresultat i listen` : ``"
          >
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
      </div>
    </main>
  </div>
</template>

<script>
import ClickOutside from 'vue-click-outside';
import { mapState } from 'vuex';
import { getQuarter } from 'date-fns';
import { serializeDocument } from '@/db/db';
import UpdateKeyres from '@/components/KeyRes/editKeyres.vue';
import EditObjective from '@/components/Objective/editObjective.vue';
import * as Toast from '@/util/toasts';
import Audit from '@/db/audit';
import Keyresult from '@/db/keyresultHandler';

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
    keyResults: [],
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

      this.keyResults = [];
      this.selectedKeyres = null;
      this.selectedObjective = objective;

      objective.ref
        .collection('keyResults')
        .where('archived', '==', false)
        .onSnapshot(async snapshot => {
          this.keyResults = await snapshot.docs.map(serializeDocument);
        });
    },

    selectQuarter(quarter) {
      this.selectedQuarter = quarter;
      this.selectedObjective = null;
      this.selectedKeyres = null;
      this.keyResults = [];
      this.objectives = [];

      this.docref
        .collection('objectives')
        .where('quarter', '==', quarter.name)
        .where('archived', '==', false)
        .onSnapshot(snapshot => {
          this.objectives = snapshot.docs.map(serializeDocument);
        });
    },

    async addObjective() {
      const objectiveCount = await this.docref
        .collection('objectives')
        .where('quarter', '==', this.selectedQuarter.name)
        .get()
        .then(snapshot => snapshot.docs.map(doc => doc.data()).filter(doc => !doc.archived).length);

      if (objectiveCount >= 4) {
        Toast.show('Kan ikke ha flere enn 4 mål');
        return;
      }

      this.docref
        .collection('objectives')
        .add({
          createdBy: this.user.ref,
          created: new Date(),
          quarter: this.selectedQuarter.name,
          archived: false,
          icon: 'trophy',
          name: 'Nytt mål',
          description: '',
        })
        .then(async response => {
          this.selectedObjective = await response.get().then(serializeDocument);
          this.selectedKeyres = null;
          this.keyResults = [];

          Audit.createObjective(response, response.parent.parent);
          return Toast.addedObjective(this.selectedQuarter.name);
        })
        .catch(err => {
          this.$errorHandler('add_objective', this.user.email, this.$route.path, err);
        });
    },

    async addKeyres() {
      if (!this.selectedObjective) return;

      const newKeyres = await Keyresult.create(this.selectedObjective.ref)
        .then(response => response.get())
        .then(serializeDocument);

      this.selectedKeyres = newKeyres;

      if (!this.keyResults.length) {
        this.keyResults.push(newKeyres);
      }
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
