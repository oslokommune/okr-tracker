<template>
  <div v-if="objective">
    <validation-observer v-slot="{ handleSubmit }">
      <form id="update-objective" @submit.prevent="handleSubmit(update)">
        <form-component
          input-type="input"
          name="name"
          :label="$t('fields.name')"
          rules="required"
          v-model="objective.name"
          type="text"
        />

        <label class="form-group">
          <span class="form-label">{{ $t('fields.description') }}</span>
          <input class="form__field" type="text" v-model="objective.description" />
        </label>

        <form-component
          input-type="input"
          name="weight"
          :label="$t('fields.weight')"
          rules="required|numeric"
          v-model.number="objective.weight"
          type="number"
        />

        <label class="form-group">
          <span class="form-label">{{ $t('fields.icon') }}</span>
          <v-select class="form-field" :options="icons" v-model="objective.icon" @input="dirty = true">
            <template #selected-option="{ label }">
              <span class="selected-icon fa fa-fw" :class="`fa-${label}`"></span>
              {{ label }}
            </template>
            <template #option="option">
              <i :class="`fas fa-fw fa-${option.label}`"></i>&nbsp;
              <span>{{ option.label }}</span>
            </template>
            <template #no-options="{}">{{ $t('select.noIcons') }}</template>
          </v-select>
        </label>

        <validation-provider rules="required" name="period" v-slot="{ errors }">
          <label class="form-group">
            <span class="form-label">{{ $t('fields.period') }}</span>
            <v-select
              label="name"
              v-model="objective.period"
              :options="periods"
              :clearable="false"
              @input="changedPeriod = true"
            >
              <template #option="option"> {{ option.name }} </template>
            </v-select>
            <span v-if="errors[0]" class="form-field--error">{{ errors[0] }}</span>
          </label>
        </validation-provider>
      </form>
    </validation-observer>

    <div class="button-row">
      <button class="btn btn--icon btn--pri" form="update-objective" :disabled="loading">
        <span class="icon fa fa-fw fa-save"></span> {{ $t('btn.saveChanges') }}
      </button>
      <button class="btn btn--icon btn--danger" @click="archive" :disabled="loading" v-if="!objective.archived">
        <span class="icon fa fa-fw fa-trash"></span> {{ $t('btn.archive') }}
      </button>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import Objective from '@/db/Objective';
import icons from '@/config/icons';
import * as Toast from '@/util/toasts';

export default {
  components: { FormComponent: () => import('@/components/FormComponent.vue') },
  data: () => ({
    objective: null,
    periods: [],
    changedPeriod: false,
    loading: false,
    icons,
  }),
  props: {
    data: {
      type: Object,
      required: true,
    },
  },

  watch: {
    data: {
      immediate: true,
      async handler() {
        const parent = await db
          .collection('slugs')
          .doc(this.data.parent.slug)
          .get()
          .then(snapshot => snapshot.data().reference);
        this.$bind('periods', db.collection('periods').where('parent', '==', parent));
        this.objective = { ...this.data, id: this.data.id };
      },
    },
  },

  methods: {
    async update() {
      this.loading = true;
      try {
        const { id, name, description, weight, icon, period } = this.objective;
        const data = {
          name,
          icon: icon || '',
          description: description || '',
          weight: weight || 1,
          period: db.collection('periods').doc(period.id),
        };

        await Objective.update(id, data);

        if (this.changedPeriod) {
          await this.$router.push({ query: {} });
          await this.$router.push({ query: { type: 'objective', id } });
        }

        Toast.savedChanges();
      } catch (error) {
        console.log(error);
        Toast.showError('Could not save changes');
      }

      this.loading = false;
    },
    async archive() {
      this.loading = true;
      try {
        await Objective.archive(this.objective.id);
        const restoreCallback = await Objective.restore.bind(null, this.activeItem.id);
        await this.$router.push({ query: {} });

        Toast.deletedRegret({ name: this.activeItem.name, callback: restoreCallback });
      } catch (error) {
        console.log(error);
        Toast.showError('Could not archive product');
      }

      this.loading = false;
    },
  },
};
</script>

<style lang="scss">
.button-row {
  display: flex;
  flex-wrap: wrap;
  margin: 2.5rem -0.25rem -0.25rem;

  > .btn {
    margin: 0.25rem;
  }
}

.selected-icon {
  display: inline-block;
  margin-right: 0.5rem;
}
</style>
