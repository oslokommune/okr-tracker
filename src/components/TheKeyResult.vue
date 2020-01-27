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
    <update-keyres v-if="edit" :keyres-id="keyres.id"></update-keyres>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import UpdateKeyres from './KeyRes/updateKeyres.vue';
import ProgressBar from './ProgressBar.vue';

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
    UpdateKeyres,
    ProgressBar,
  },

  computed: {
    ...mapGetters(['getObjectById']),

    keyres() {
      return this.getObjectById(this.id);
    },
    objective() {
      return this.getObjectById(this.keyres.objective_id);
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
