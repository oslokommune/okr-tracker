<template>
  <div v-if="objective">
    <validation-observer v-slot="{ handleSubmit }">
      <form id="update-objective" @submit.prevent="handleSubmit(update)">
        <form-component
          input-type="input"
          name="name"
          label="Name"
          rules="required"
          v-model="objective.name"
          type="text"
        />

        <label class="form-group">
          <span class="form-label">Description</span>
          <input class="form__field" type="text" v-model="objective.description" />
        </label>

        <form-component
          input-type="input"
          name="weight"
          label="Weight"
          rules="required|numeric"
          v-model="objective.weight"
          type="number"
        />

        <label class="form-group">
          <span class="form-label">Icon</span>
          <input class="form__field" type="text" v-model="objective.icon" />
        </label>

        <validation-provider rules="required" name="period" v-slot="{ errors }">
          <label class="form-group">
            <span class="form-label">Period</span>
            <v-select
              label="name"
              v-model="objective.period"
              :options="periods"
              :clearable="false"
              @input="changedPeriod = true"
            >
              <template #option="option"> {{ option.name }} </template>
            </v-select>
          </label>
          <div v-if="errors[0]" class="form-field--error">{{ errors[0] }}</div>
        </validation-provider>
      </form>
    </validation-observer>

    <div class="button-row">
      <button class="btn btn--icon btn--pri" form="update-objective" :disabled="loading">
        <span class="icon fa fa-fw fa-save"></span> Save changes
      </button>
      <button class="btn btn--icon btn--danger" @click="archive" :disabled="loading" v-if="!objective.archived">
        <span class="icon fa fa-fw fa-trash"></span> Archive objective
      </button>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import Objective from '@/db/Objective';
import { extend } from 'vee-validate';
import { required, numeric } from 'vee-validate/dist/rules';

extend('required', required);
extend('numeric', numeric);

export default {
  components: { FormComponent: () => import('@/components/FormComponent.vue') },
  data: () => ({
    objective: null,
    periods: [],
    changedPeriod: false,
    loading: false,
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

        this.$toasted.show('Successfully saved changes');
      } catch (error) {
        console.log(error);
        this.$toasted.show('Could not save changes');
      }

      this.loading = false;
    },
    async archive() {
      this.loading = true;
      try {
        await Objective.archive(this.objective.id);
        this.$router.push({ query: {} });
        this.$toasted.show('Archived');
      } catch (error) {
        console.log(error);
        this.$toasted.show('Could not archive product');
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
</style>
