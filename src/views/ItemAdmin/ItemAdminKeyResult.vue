<template>
  <div v-if="keyResult">
    <form>
      <label class="form-group">
        <span class="form-label">Name</span>
        <input class="form__field" type="text" v-model="keyResult.name" />
      </label>

      <label class="form-group">
        <span class="form-label">Description</span>
        <input class="form__field" type="text" v-model="keyResult.description" />
      </label>

      <div class="form-group">
        <span class="form-label">Objective</span>
        <v-select
          label="name"
          v-model="keyResult.objective"
          :options="objectives"
          :clearable="false"
          @input="changedObjective = true"
        >
          <template #option="option">
            {{ option.name }}
            <span v-if="option.period && option.period.name"> ({{ option.period.name }}) </span>
          </template>
        </v-select>
      </div>

      <label class="form-group">
        <span class="form-label">Unit</span>
        <input class="form__field" type="text" v-model="keyResult.unit" />
      </label>

      <div class="form-row">
        <label class="form-group">
          <span class="form-label">Start value</span>
          <input class="form__field" type="number" v-model.number="keyResult.startValue" />
        </label>

        <label class="form-group">
          <span class="form-label">Target value</span>
          <input class="form__field" type="number" v-model.number="keyResult.targetValue" />
        </label>

        <label class="form-group">
          <span class="form-label">Weight</span>
          <input class="form__field" type="number" min="1" v-model.number="keyResult.weight" />
        </label>
      </div>
    </form>

    <div class="button-row">
      <button class="btn btn--icon btn--pri" @click="update">
        <span class="icon fa fa-fw fa-save"></span> Save changes
      </button>
      <button class="btn btn--icon btn--danger" @click="archive" v-if="!keyResult.archived">
        <span class="icon fa fa-fw fa-trash"></span> Archive key result
      </button>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import KeyResult from '@/db/KeyResult';

export default {
  data: () => ({
    keyResult: null,
    objectives: [],
    changedObjective: false,
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
        this.$bind('objectives', db.collection('objectives').where('parent', '==', parent));
        this.keyResult = { ...this.data, id: this.data.id };
      },
    },
  },

  methods: {
    async update() {
      try {
        const { id, name, weight, description, objective, auto, unit, startValue, targetValue } = this.keyResult;

        const data = {
          name: name || '',
          weight: weight || 1,
          description: description || '',
          objective: db.collection('objectives').doc(objective.id),
          auto: auto || false,
          unit: unit || '',
          startValue: startValue || 0,
          targetValue: targetValue || 100,
        };

        await KeyResult.update(id, data);

        if (this.changedObjective) {
          await this.$router.push({ query: {} });
          await this.$router.push({ query: { type: 'keyResult', id } });
        }

        this.$toasted.show('Successfully saved changes');
      } catch (error) {
        console.log(error);
        this.$toasted.show('Could not save changes');
      }
    },
    async archive() {
      try {
        await KeyResult.archive(this.keyResult.id);
        this.$router.push({ query: {} });
        this.$toasted.show('Archived');
      } catch (error) {
        console.log(error);
        this.$toasted.show('Could not archive product');
      }
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
