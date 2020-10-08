<template>
  <div>
    <div class="action-bar">
      <label class="form-group--checkbox">
        <input class="form__checkbox" type="checkbox" v-model="showArchived" />
        <span class="form-label">Show archived</span>
      </label>
    </div>

    <div class="wrapper" v-if="activeItemRef">
      <div class="miller">
        <div
          class="miller__col"
          v-for="{ type, heading, activeClass, selectedClass, items, icon, notSelected, addEvent } in columns"
          :key="type"
        >
          <div class="miller__col-heading">{{ heading }}</div>
          <div class="miller__not-selected" v-if="notSelected">{{ notSelected }}</div>
          <ul class="miller__list" v-else>
            <li v-for="{ id, name, archived } in items" :key="id" class="miller__list-item">
              <router-link
                class="miller__link"
                :to="{ query: { type, id } }"
                :class="{
                  active: activeClass(id),
                  selected: selectedClass(id),
                }"
              >
                <span class="miller__icon fa" :class="icon"></span>
                <span class="miller__label">{{ name }}</span>
                <span class="miller__archived fa fa-recycle" v-if="archived"></span>
              </router-link>
            </li>
          </ul>
          <button v-if="!notSelected" class="miller__add btn btn--ter btn--icon btn--fw" @click="addEvent">
            <span class="icon fa fa-plus"></span>
            <span>Create new</span>
          </button>
        </div>
      </div>

      <div class="details" v-if="editObject && editForm">
        <component :is="editForm" :data="editObject"></component>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';
import Period from '@/db/Period';
import Objective from '@/db/Objective';
import KeyResult from '@/db/KeyResult';

export default {
  name: 'ItemAdminOKRs',

  data: () => ({
    editForm: null,
    editObject: null,
    showArchived: false,
    periods: [],
    objectives: [],
    keyResults: [],
    selectedType: null,
    selectedPeriod: null,
    selectedObjective: null,
  }),

  computed: {
    ...mapState(['activeItemRef']),

    columns() {
      return [
        {
          heading: 'Select Period',
          items: this.periods,
          type: 'period',
          icon: 'fa-calendar-alt',
          activeClass: id => this.editObject && id === this.editObject.id,
          selectedClass: id => id === this.selectedPeriodId,
          notSelected: false,
          addEvent: this.createPeriod,
        },
        {
          heading: 'Select objective',
          items: this.objectives,
          type: 'objective',
          icon: 'fa-trophy',
          activeClass: id => this.editObject && id === this.editObject.id,
          selectedClass: id => id === this.selectedObjectiveId,
          notSelected: !this.selectedType ? 'No period selected' : false,
          addEvent: this.createObjective,
        },
        {
          heading: 'Select key results',
          items: this.keyResults,
          type: 'keyResult',
          icon: 'fa-chart-pie',
          activeClass: id => this.editObject && id === this.editObject.id,
          selectedClass: () => false,
          notSelected: !this.selectedType || this.selectedType === 'period' ? 'No objective selected' : false,
          addEvent: this.createKeyResult,
        },
      ];
    },
  },

  watch: {
    '$route.query': {
      immediate: true,
      async handler(query) {
        await this.setItems(query);
        this.setFormComponent(query);
      },
    },
    async showArchived() {
      const { query } = this.$route;
      await this.bindPeriods();
      await this.setItems(query);
      this.setFormComponent(query);
    },
  },

  methods: {
    setFormComponent({ type, id }) {
      if (!type || !id) {
        this.editForm = null;
        this.editObject = null;
        return;
      }

      switch (type) {
        case 'period':
          this.editForm = () => import('./ItemAdminPeriod.vue');
          this.editObject = this.periods.find(obj => obj.id === id);
          break;
        case 'objective':
          this.editForm = () => import('./ItemAdminObjective.vue');
          this.editObject = this.objectives.find(obj => obj.id === id);
          break;
        case 'keyResult':
          this.editForm = () => import('./ItemAdminKeyResult.vue');
          this.editObject = this.keyResults.find(obj => obj.id === id);
          break;
        default:
          this.editForm = null;
          this.editObject = null;
      }
    },

    async setItems({ type, id }) {
      if (!type || !id) {
        if (this.objectives.length) this.$unbind('objectives');
        if (this.keyResults.length) this.$unbind('keyResults');
        this.selectedType = null;
      }

      if (!this.selectedType) {
        this.bindPeriods();
      }

      if (type === 'period') {
        await this.bindObjectives({ parentId: id });
        if (this.keyResults.length) this.$unbind('keyResults');
        this.selectedObjectiveId = null;
        this.selectedPeriodId = id;
      } else if (type === 'objective') {
        await this.bindKeyResults({ parentId: id });
        const { period } = await db
          .collection('objectives')
          .doc(id)
          .get()
          .then(snap => snap.data());
        await this.bindObjectives({ parentId: period.id });
        this.selectedPeriodId = period.id;
        this.selectedObjectiveId = id;
      } else if (type === 'keyResult') {
        const keyRes = await db
          .collection('keyResults')
          .doc(id)
          .get()
          .then(snap => snap.data());

        const objective = await db
          .collection('objectives')
          .doc(keyRes.objective.id)
          .get()
          .then(snap => snap.data());

        this.selectedPeriodId = objective.period.id;
        this.selectedObjectiveId = keyRes.objective.id;
        await this.bindObjectives({ parentId: objective.period.id });
        await this.bindKeyResults({ parentId: keyRes.objective.id });
      }

      this.selectedType = type;
    },

    bindPeriods() {
      return this.$bind(
        'periods',
        db
          .collection('periods')
          .where('parent', '==', this.activeItemRef)
          .where('archived', 'in', [false, this.showArchived])
      );
    },

    bindObjectives({ parentId }) {
      return this.$bind(
        'objectives',
        db
          .collection('objectives')
          .where('period', '==', db.collection('periods').doc(parentId))
          .where('archived', 'in', [false, this.showArchived])
      );
    },

    bindKeyResults({ parentId }) {
      return this.$bind(
        'keyResults',
        db
          .collection('keyResults')
          .where('objective', '==', db.collection('objectives').doc(parentId))
          .where('archived', 'in', [false, this.showArchived])
      );
    },

    async createPeriod() {
      const startDate = new Date();
      const endDate = new Date();
      try {
        const { id } = await Period.create({ name: 'placeholder', parent: this.activeItemRef, startDate, endDate });
        this.$router.push({ query: { type: 'period', id } });
      } catch (error) {
        throw new Error(error);
      }
    },
    async createObjective() {
      try {
        const period = db.collection('periods').doc(this.selectedPeriodId);
        const { id } = await Objective.create({ name: 'placeholder', parent: this.activeItemRef, weight: 1, period });
        await this.$router.push({ query: { type: 'objective', id } });
      } catch (error) {
        throw new Error(error);
      }
    },
    async createKeyResult() {
      try {
        const data = {
          name: 'placeholder',
          objective: db.collection('objectives').doc(this.selectedObjectiveId),
          parent: this.activeItemRef,
          startValue: 0,
          targetValue: 100,
          unit: '',
          weight: 1,
        };

        const { id } = await KeyResult.create(data);
        await this.$router.push({ query: { type: 'keyResult', id } });
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.wrapper {
  width: 100%;

  @media screen and (min-width: bp(l)) {
    display: flex;
  }
}

.miller {
  display: grid;
  grid-gap: 1.75rem 0;
  grid-template-columns: repeat(1, 1fr);
  align-self: flex-start;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba($color-grey-400, 0.3);

  @media screen and (min-width: bp(s)) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media screen and (min-width: bp(m)) {
    width: span(9, 0, span(9));
  }

  @media screen and (min-width: bp(l)) {
    width: span(7, 0, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(6, 0, span(10));
  }
}

.miller__col {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-left: 2px solid $color-grey-100;

  &:first-child {
    border-left: none;
  }

  @media screen and (min-width: bp(s)) {
    min-height: 15rem;
  }

  @media screen and (min-width: bp(m)) {
    min-height: 25rem;
  }
}

.miller__col-heading {
  padding: 0.5rem 0.75rem;
  color: $color-grey-600;
  border-bottom: 1px solid $color-grey-100;
}

.miller__link {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  color: $color-grey-800;
  text-decoration: none;
  border-bottom: 1px solid $color-grey-100;

  &.selected {
    color: black;
    font-weight: 500;
    background: $color-grey-50;
  }

  &.active {
    color: black;
    font-weight: 500;
    background: $color-yellow;
  }
}

.miller__list {
  max-height: 11rem;
  overflow: auto;

  @media screen and (min-width: bp(s)) {
    max-height: 20rem;
  }

  @media screen and (min-width: bp(m)) {
    max-height: 25rem;
  }

  @media screen and (min-width: bp(l)) {
    max-height: 35rem;
  }
}

.miller__add {
  margin-top: auto;
  border-top: 1px solid $color-grey-100;
}

.miller__not-selected {
  padding: 0.5rem 0.75rem;
  color: $color-grey-500;
  font-style: italic;
}

.miller__icon {
  margin-right: 0.35rem;
  opacity: 0.75;
}

.miller__archived {
  margin-left: auto;
}

.details {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba($color-grey-400, 0.3);

  @media screen and (min-width: bp(l)) {
    align-self: flex-start;
    width: span(3, 0, span(10));
    margin-top: 0;
    margin-left: span(0, 1, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(3, 0, span(10));
    margin-left: span(1, 2, span(10));
  }
}
</style>
