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
        <input class="form__field" type="number" min="1" v-model="objective.weight" />
      </label>

      <label class="form-group">
        <span class="form-label">Icon</span>
        <input class="form__field" type="text" v-model="objective.icon" />
      </label>

      <div class="form-group">
        <span class="form-label">Period</span>
        <v-select label="name" v-model="objective.period" :options="periods" :clearable="false">
          <template #option="option"> {{ option.name }} </template>
        </v-select>
      </div>
    </form>

    <div class="button-row">
      <button class="btn btn--icon btn--pri" @click="update">
        <span class="icon fa fa-fw fa-save"></span> Save changes
      </button>
      <button class="btn btn--icon btn--danger" @click="archive" v-if="!objective.archived">
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
    update() {},
    async archive() {
      try {
        await Objective.archive(this.objective.id);
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
