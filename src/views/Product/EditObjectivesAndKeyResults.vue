<template>
  <div class="container container--sidebar">
    <aside class="content--sidebar"></aside>

    <main class="content--main content--padding section">
      <div class="content-header">
        <h2 class="title-2">Administrer mål og nøkkelresultater</h2>
      </div>

      <div class="miller__container">
        <div class="miller">
          <!-- Periods -->
          <div class="miller__col" :class="{ active: activeLevel === 'period' }">
            <h3 class="miller__col__header">Periode</h3>
            <div
              class="miller__col__item"
              v-for="period in periods"
              :key="period.name"
              @click="selectPeriod(period)"
              :class="{ active: selectedPeriod && selectedPeriod.id === period.id }"
            >
              {{ period.name }}
            </div>

            <div class="miller__col__item miller__col__add" @click="addPeriod" v-tooltip.bottom="`Legg til ny periode`">
              + Legg til periode
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
              v-if="selectedPeriod"
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
              v-if="selectedPeriod && selectedObjective"
              class="miller__col__item miller__col__add"
              @click="addKeyres"
              v-tooltip.bottom="`Legg til et nøkkelresultat for valgt mål`"
            >
              + Legg til
            </div>
          </div>

          <main
            class="miller__main"
            v-tooltip.top="!activeLevel ? `Tomt? Velg et mål eller nøkkelresultat i listen` : ``"
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

            <EditPeriod
              v-if="selectedPeriod && activeLevel === 'period'"
              :period="selectedPeriod"
              @deletedPeriod="selectedPeriod = null"
            ></EditPeriod>
          </main>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import ClickOutside from 'vue-click-outside';
import { mapState } from 'vuex';
import { serializeDocument, serializeList } from '@/db/db';
import UpdateKeyres from '@/components/KeyRes/editKeyres.vue';
import EditObjective from '@/components/Objective/editObjective.vue';
import EditPeriod from '@/components/Period/editPeriod.vue';
import * as Toast from '@/util/toasts';
import Audit from '@/db/audit';
import Keyresult from '@/db/keyresultHandler';

export default {
  name: 'EditObjectivesAndKeyResults',

  components: {
    UpdateKeyres,
    EditObjective,
    EditPeriod,
  },

  data: () => ({
    modalIsOpen: false,
    product: null,
    selectedPeriod: null,
    selectedObjective: null,
    selectedKeyres: null,
    objectives: null,
    keyResults: [],
    periods: [],
  }),

  computed: {
    ...mapState(['user']),

    activeLevel() {
      if (this.selectedKeyres) return 'keyres';
      if (this.selectedObjective) return 'objective';
      if (this.selectedPeriod) return 'period';
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
    this.docref.collection('periods').onSnapshot(snapshot => {
      this.periods = serializeList(snapshot);
    });

    const { keyres, objective } = this.$route.params;
    if (keyres && objective) {
      this.selectedPeriod = objective.period;

      this.objectives = await this.docref
        .collection('objectives')
        .where('archived', '==', false)
        .where('period', '==', objective.period)
        .get()
        .then(serializeList);

      await this.selectObjective(objective);
      await this.selectKeyres(keyres);
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
          this.keyResults = await serializeList(snapshot);
        });
    },

    async selectPeriod(period) {
      this.selectedPeriod = period;
      this.selectedObjective = null;
      this.selectedKeyres = null;
      this.keyResults = [];
      this.objectives = [];

      this.docref
        .collection('objectives')
        .where('archived', '==', false)
        .where('period', '==', period.ref)
        .onSnapshot(snapshot => {
          this.objectives = serializeList(snapshot);
        });

      this.objectives = await this.docref
        .collection('objectives')
        .where('archived', '==', false)
        .where('period', '==', period.ref)
        .get()
        .then(serializeList);
    },

    async addObjective() {
      const objectiveCount = await this.docref
        .collection('objectives')
        .where('archived', '==', false)
        .where('period', '==', this.selectedPeriod.ref)
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
          period: this.selectedPeriod.ref,
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
          return Toast.addedObjective(this.selectedPeriod.name);
        })
        .catch(err => {
          this.$errorHandler('add_objective', this.user.email, this.$route.path, err);
        });
    },

    async addPeriod() {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.docref
        .collection('periods')
        .add({
          archived: false,
          created: new Date(),
          createdBy: this.user.id,
          name: 'Ny periode',
          startDate: today,
          endDate: tomorrow,
        })
        .then(async response => {
          this.selectedPeriod = await response.get().then(serializeDocument);
          this.selectedObjective = null;
          this.selectedKeyres = null;
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
