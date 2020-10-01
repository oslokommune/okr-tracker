<template>
  <aside v-if="activeKeyResult" class="widgets">
    <div class="keyresult">
      <div class="keyresult__body">
        <i class="fa fa-edit"></i>
        Endre nøkkelresultater
      </div>
    </div>
    <widget-key-result-details v-if="activeKeyResult"></widget-key-result-details>
    <widget-key-result-notes v-if="activeKeyResult"></widget-key-result-notes>
  </aside>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'WidgetsKeyResultHome',

  computed: {
    ...mapState(['activeKeyResult']),
  },
  components: {
    WidgetKeyResultDetails: () => import('./WidgetKeyResultDetails.vue'),
    WidgetKeyResultNotes: () => import('./WidgetKeyResultNotes.vue'),
  },
};
</script>

<style lang="scss" scoped>
.keyresult {
  width: 100%;
  margin: 1rem 0 1rem 0;
}

.keyresult__body {
  padding: 0.5rem;

  @media screen and (min-width: bp(m)) {
    padding: 1;
  }
}
</style>
