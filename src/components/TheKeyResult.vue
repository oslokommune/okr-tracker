<template>
  <div class="wrapper">
    <div class="card" v-if="!edit" @click="edit = true">
      <div class="text">
        <p class="pill">{{ objective.objective_title }}</p>
        <p>{{ keyres.key_result }}</p>
      </div>

      <progress-bar class="progressbar" :keyres="keyres"></progress-bar>
    </div>

    <button v-if="edit" class="close" @click="edit = false">X</button>
    <edit-keyres v-if="edit" :id="keyres.id"></edit-keyres>
  </div>
</template>

<script>
import EditKeyres from '@/components/editKeyres.vue';
import ProgressBar from '@/components/ProgressBar.vue';

export default {
  data: () => ({
    edit: false,
  }),

  props: {
    id: {
      type: String,
      required: true,
    },
  },

  components: {
    EditKeyres,
    ProgressBar,
  },

  computed: {
    keyres() {
      return this.$store.getters.getObjectById(this.id);
    },
    objective() {
      return this.$store.getters.getObjectById(this.keyres.objective_id);
    },
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
}

.card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.close {
  position: absolute;
  top: 1px;
  right: 1px;
  z-index: 2;

  width: 2.5rem;
  height: 2.5rem;

  background: #eeeeee;

  border: 1px solid transparent;
}

.text {
  margin-bottom: 2.5rem;
}

.progressbar {
  margin-top: auto;
}
</style>
