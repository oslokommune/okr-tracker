<template>
  <div class="container container--sidebar">
    <aside class="content--sidebar">
      <div class="add">
        <button class="btn btn--ghost" @click="expand = true" :disabled="expand">+ Legg til nytt mål</button>
        <add-objective
          v-if="expand"
          @close-menu="expand = false"
          :productref="docref"
          :selected-quarter="selectedQuarter"
        ></add-objective>
      </div>
    </aside>
    <main class="content--main content--padding section">
      <h2 class="title-2">Administrer mål</h2>

      <div class="objective">
        <div class="form-row">
          <v-select
            class="form-group objective__select"
            label="name"
            v-model="selectedQuarter"
            :options="quarters"
          ></v-select>
        </div>
      </div>

      <div class="content">
        <transition-group name="grid-animation" tag="div" class="grid-3">
          <edit-objective
            v-for="ref in objectiveRefs"
            :key="ref.id"
            :objective-ref="ref"
            class="grid-animation-item"
          ></edit-objective>
        </transition-group>
      </div>
    </main>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import AddObjective from '@/components/Objective/addObjective.vue';
import EditObjective from '@/components/Objective/editObjective.vue';

export default {
  components: {
    AddObjective,
    EditObjective,
  },

  data: () => ({
    expand: false,
    objectiveRefs: [],
    selectedQuarter: null,
  }),

  computed: {
    ...mapState(['quarters']),
  },

  watch: {
    selectedQuarter(quarter) {
      this.docref
        .collection('objectives')
        .where('quarter', '==', quarter.name)
        .onSnapshot(snapshot => {
          this.objectiveRefs = snapshot.docs;
        });
    },
  },

  mounted() {
    const [firstQuarter] = this.quarters;
    this.selectedQuarter = firstQuarter;
  },

  props: {
    docref: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.objective {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;

  &__select {
    min-width: 200px;
    margin-right: 1rem;
    transform: translateY(-3px);
  }
}

.add {
  position: relative;

  .btn {
    width: 100%;
  }
}

.grid-animation-item {
  display: inline-block;
  margin-right: 10px;
  transform: scaleX(1);
  transition: all 0.5s;
}
.grid-animation-enter, .grid-animation-leave-to
/* .list-complete-leave-active below version 2.1.8 */ {
  transform: scaleX(0);
  opacity: 0;
}
.grid-animation-leave-active {
  position: absolute;
}
</style>
