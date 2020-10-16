<template>
  <div v-if="objective">
    <form>
      <label class="form-group">
        <span class="form-label">Name</span>
        <input class="form__field" type="text" v-model="objective.name" />
      </label>

      <label class="form-group">
        <span class="form-label">Description</span>
        <input class="form__field" type="text" v-model="objective.description" />
      </label>

      <label class="form-group">
        <span class="form-label">Weight</span>
        <input class="form__field" type="number" min="1" v-model.number="objective.weight" />
      </label>

      <label class="form-group">
        <span class="form-label">Icon</span>
        <input class="form__field" type="text" v-model="objective.icon" />
      </label>

      <div class="form-group">
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
      </div>
    </form>

    <div class="button-row">
      <button class="btn btn--icon btn--pri" @click="update" :disabled="loading">
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

export default {
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
