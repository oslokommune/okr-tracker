<template>
  <div>
    <div class="action-bar">
      <label class="form-group--checkbox">
        <input v-model="showArchived" class="form__checkbox" type="checkbox" />
        <span class="form-label">{{ $t('admin.objects.showArchived') }}</span>
      </label>
    </div>

    <div v-if="activeItemRef" class="wrapper">
      <div class="miller">
        <div
          v-for="{
            type,
            heading,
            activeClass,
            selectedClass,
            items,
            icon,
            notSelected,
            nonexistent,
            addEvent,
            cyCreate,
          } in columns"
          :key="type"
          class="miller__col"
        >
          <div class="miller__col-heading">{{ heading }}</div>
          <empty-state v-if="notSelected" :icon="'arrow-left'" :heading="notSelected" />

          <ul v-else class="miller__list">
            <template v-if="!items.length && type === 'objective'">
              <empty-state v-if="!items.length && !isLoadingPeriod" :icon="'exclamation'" :heading="nonexistent" />
              <template v-if="isLoadingPeriod">
                <template v-for="index in 2">
                  <content-loader-okr-row :key="`okr-row-objective-${index}`"></content-loader-okr-row>
                </template>
              </template>
            </template>

            <template v-else-if="!items.length && type === 'keyResult'">
              <empty-state
                v-if="!items.length && !isLoadingObjective && type === 'keyResult'"
                :icon="'exclamation'"
                :heading="nonexistent"
              />
              <template v-if="isLoadingObjective">
                <template v-for="index in 3">
                  <content-loader-okr-row :key="`okr-row-objective-${index}`"></content-loader-okr-row>
                </template>
              </template>
            </template>

            <template v-else>
              <li v-for="{ id, name, archived } in items" :key="id" class="miller__list-item">
                <router-link
                  class="miller__link"
                  :to="{ name: 'ItemAdminOKRs', query: { type, id } }"
                  :class="{
                    active: activeClass(id),
                    selected: selectedClass(id),
                  }"
                >
                  <i class="miller__icon fa" :class="icon" />
                  <span class="miller__label">{{ name }}</span>
                  <span v-if="archived" class="miller__archived fa fa-file-archive"></span>
                </router-link>
              </li>
            </template>
          </ul>
          <button
            v-if="!notSelected"
            class="miller__add btn btn--ter btn--icon btn--fw btn--icon-pri"
            :data-cy="cyCreate"
            @click="addEvent"
          >
            <i class="icon fa fa-plus" />
            <span>{{ $t('btn.create') }}</span>
          </button>
        </div>
      </div>

      <component :is="editForm" :data="editObject"></component>
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

  components: {
    EmptyState: () => import('@/components/EmptyState.vue'),
    ContentLoaderOkrRow: () => import('@/components/ContentLoader/ContentLoaderOKRRow.vue'),
  },

  data: () => ({
    editForm: null,
    editObject: null,
    showArchived: false,
    periods: [],
    objectives: [],
    keyResults: [],
    selectedType: null,
    selectedPeriodId: null,
    selectedObjectiveId: null,
    isLoadingPeriod: false,
    isLoadingObjective: false,
  }),

  computed: {
    ...mapState(['activeItemRef']),

    columns() {
      return [
        {
          heading: this.$t('admin.showPeriods'),
          items: this.periods,
          type: 'period',
          icon: 'fa-calendar-alt',
          activeClass: (id) => this.editObject && id === this.editObject.id,
          selectedClass: (id) => id === this.selectedPeriodId,
          notSelected: false,
          addEvent: this.createPeriod,
          nonexistent: this.$t('empty.itemAdmin.period'),
          cyCreate: 'okr-create-period',
        },
        {
          heading: this.$t('admin.showObjectives'),
          items: this.objectives,
          type: 'objective',
          icon: 'fa-trophy',
          activeClass: (id) => this.editObject && id === this.editObject.id,
          selectedClass: (id) => id === this.selectedObjectiveId,
          notSelected: !this.selectedType ? this.$t('admin.noPeriodSelected') : false,
          addEvent: this.createObjective,
          nonexistent: this.$t('empty.itemAdmin.objective'),
          cyCreate: 'okr-create-objective',
        },
        {
          heading: this.$t('admin.showKeyResults'),
          items: this.keyResults,
          type: 'keyResult',
          icon: 'fa-chart-pie',
          activeClass: (id) => this.editObject && id === this.editObject.id,
          selectedClass: () => false,
          notSelected:
            !this.selectedType || this.selectedType === 'period' ? this.$t('admin.noObjectiveSelected') : false,
          addEvent: this.createKeyResult,
          nonexistent: this.$t('empty.itemAdmin.keyResult'),
          cyCreate: 'okr-create-keyResult',
        },
      ];
    },
  },

  watch: {
    '$route.query': {
      immediate: true,
      async handler(newQuery, oldQuery) {
        if (newQuery && !oldQuery) {
          await this.setItems(newQuery, true);
        } else {
          await this.setItems(newQuery, false);
        }
        await this.setFormComponent(newQuery);
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
          this.editObject = this.periods.find((obj) => obj.id === id);
          this.selectedObjectiveId = null;
          this.selectedPeriodId = id;
          break;
        case 'objective':
          this.editForm = () => import('./ItemAdminObjective.vue');
          this.editObject = this.objectives.find((obj) => obj.id === id);
          this.selectedObjectiveId = id;
          break;
        case 'keyResult':
          this.editForm = () => import('./ItemAdminKeyResult.vue');
          this.editObject = this.keyResults.find((obj) => obj.id === id);
          break;
        default:
          this.editForm = null;
          this.editObject = null;
      }
    },

    async setItems({ type, id }, update) {
      if (!type || !id) {
        if (this.objectives.length) this.$unbind('objectives');
        if (this.keyResults.length) this.$unbind('keyResults');
        this.selectedType = null;
      }

      if (!this.selectedType) {
        await this.bindPeriods();
      }

      if (type === 'period') {
        this.isLoadingPeriod = true;
        this.keyResults = [];
        await this.bindObjectives({ parentId: id });
        if (this.keyResults.length) this.$unbind('keyResults');
        this.isLoadingPeriod = false;
      } else if (type === 'objective') {
        this.isLoadingObjective = true;
        await this.bindKeyResults({ parentId: id });

        if (update) {
          const objective = await db
            .collection('objectives')
            .doc(id)
            .get()
            .then((snap) => snap.data());

          if (objective && objective.period) {
            await this.bindObjectives({ parentId: objective.period.id });
            if (this.selectedPeriodId !== objective.period.id) {
              this.selectedPeriodId = objective.period.id;
            }
          }
        }

        this.selectedObjectiveId = id;
        this.isLoadingObjective = false;
      } else if (type === 'keyResult' && update) {
        const keyRes = await db
          .collection('keyResults')
          .doc(id)
          .get()
          .then((snap) => snap.data());

        const objective = await db
          .collection('objectives')
          .doc(keyRes.objective.id)
          .get()
          .then((snap) => snap.data());

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

        this.$toasted.show(this.$t('toaster.add.period'));

        await this.$router.push({ query: { type: 'period', id } });
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.create', { document: this.$t('general.period') }));
        throw new Error(error);
      }
    },
    async createObjective() {
      try {
        const period = db.collection('periods').doc(this.selectedPeriodId);
        const { id } = await Objective.create({ name: 'placeholder', parent: this.activeItemRef, weight: 1, period });

        this.$toasted.show(this.$t('toaster.add.objective', { period: period.name }));

        await this.$router.push({ query: { type: 'objective', id } });
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.create', { document: this.$t('general.objective') }));
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

        this.$toasted.show(this.$t('toaster.add.keyResult'));

        await this.$router.push({ query: { type: 'keyResult', id } });
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.create', { document: this.$t('general.keyResult') }));
        throw new Error(error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
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
  box-shadow: 0 2px 4px rgba(var(--color-grey-400-rgb), 0.3);

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
  border-left: 2px solid var(--color-grey-100);

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
  color: var(--color-grey-600);
  border-bottom: 1px solid var(--color-grey-100);
}

.miller__link {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  color: var(--color-text);
  text-decoration: none;
  border-bottom: 1px solid var(--color-grey-100);

  &.selected {
    color: var(--color-text);
    font-weight: 500;
    background: var(--color-grey-50);
  }

  &.active {
    color: var(--color-text-secondary);
    font-weight: 500;
    background: var(--color-primary);
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
  border-top: 1px solid var(--color-grey-100);
}

.miller__icon {
  align-self: flex-start;
  margin-right: 0.35rem;
  padding-top: 0.2rem;
  opacity: 0.75;
}

.miller__archived {
  align-self: flex-start;
  margin-left: auto;
  padding-top: 0.2rem;
  padding-left: 0.5rem;
}

.details {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(var(--color-grey-400-rgb), 0.3);

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
