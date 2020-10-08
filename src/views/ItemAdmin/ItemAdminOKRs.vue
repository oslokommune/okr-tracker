<template>
  <div class="wrapper" v-if="activeItemRef">
    <div class="miller">
      <div class="miller__col">
        <div class="miller__col-heading">Select period</div>
        <ul class="miller__list">
          <li v-for="p in periods" :key="p.id" class="miller__list-item">
            <router-link
              class="miller__link"
              :to="{ query: { type: 'period', id: p.id } }"
              :class="{
                active: editObject && p.id === editObject.id,
                selected: selectedPeriod && selectedPeriod.id === p.id,
              }"
            >
              <span class="miller__icon fa fa-calendar-alt"></span>
              <span class="miller__label">{{ p.name }}</span>
            </router-link>
          </li>
        </ul>
      </div>

      <div class="miller__col">
        <div class="miller__col-heading">Select objective</div>
        <ul class="miller__list">
          <li v-for="o in objectives" :key="o.id" class="miller__list-item">
            <router-link
              class="miller__link"
              :to="{ query: { type: 'objective', id: o.id } }"
              :class="{
                active: editObject && o.id === editObject.id,
                selected: selectedObjective && selectedObjective.id === o.id,
              }"
            >
              <span class="miller__icon fa fa-trophy"></span>
              <span class="miller__label">{{ o.name }}</span>
            </router-link>
          </li>
        </ul>
      </div>

      <div class="miller__col">
        <div class="miller__col-heading">Select key result</div>
        <ul class="miller__list">
          <li v-for="k in keyResults" :key="k.id" class="miller__list-item">
            <router-link
              class="miller__link"
              :to="{ query: { type: 'keyResult', id: k.id } }"
              :class="{ active: editObject && k.id === editObject.id }"
            >
              <span class="miller__icon fa fa-chart-pie"></span>
              <span class="miller__label">{{ k.name }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </div>

    <div class="details" v-if="editObject && editForm">
      <component :is="editForm" :data="editObject"></component>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';

export default {
  name: 'ItemAdminOKRs',

  data: () => ({
    editForm: null,
    editObject: null,
    showArchived: false,
    periods: [],
    objectives: [],
    keyResults: [],
    selectedPeriod: null,
    selectedObjective: null,
  }),

  computed: {
    ...mapState(['activeItemRef']),
  },

  watch: {
    '$route.query': {
      immediate: true,
      async handler(query) {
        await this.setItems(query);
        this.setFormComponent(query);
      },
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
      this.bindPeriods();

      if (!type || !id) {
        if (this.objectives.length) this.$unbind('objectives');
        if (this.keyResults.length) this.$unbind('keyResults');
      }

      if (type === 'period') {
        await this.bindObjectives({ parentId: id });
        if (this.keyResults.length) this.$unbind('keyResults');
        this.selectedObjective = null;
        this.selectedPeriod = null;
      } else if (type === 'objective') {
        const [keyres] = await this.bindKeyResults({ parentId: id });
        await this.bindObjectives({ parentId: keyres.objective.period.id });
        this.selectedPeriod = keyres.objective.period;
        this.selectedObjective = null;
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

        this.selectedPeriod = objective.period;
        this.selectedObjective = keyRes.objective;
        await this.bindObjectives({ parentId: objective.period.id });
        await this.bindKeyResults({ parentId: keyRes.objective.id });
      }
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
  // grid-gap: span(0, 1);
  grid-template-columns: repeat(1, 1fr);
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
  width: 100%;
  border-left: 1px solid $color-grey-100;

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
  color: $color-grey-900;
  text-decoration: none;
  border-bottom: 1px solid $color-grey-100;

  &.selected {
    font-weight: 500;
  }

  &.active {
    font-weight: 500;
    background: $color-yellow;
  }
}

.miller__icon {
  margin-right: 0.35rem;
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
