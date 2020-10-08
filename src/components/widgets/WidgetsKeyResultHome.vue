<template>
  <aside v-if="activeKeyResult" class="wrapper">
    <div class="keyresult">
      <div class="keyresult__body">
        <router-link :to="{ name: 'ItemAdminOKRs', query: { type: 'keyResult', id: activeKeyResult.id } }">
          <i class="fa fa-edit"></i>
          Endre nøkkelresultater
        </router-link>
      </div>
    </div>

    <div class="widgets">
      <widget-key-result-details v-if="activeKeyResult"></widget-key-result-details>
      <widget-key-result-notes v-if="activeKeyResult"></widget-key-result-notes>
    </div>
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
.wrapper {
  position: relative;
  width: span(12);
  margin-top: 0.5rem;

  @media screen and (min-width: bp(l)) {
    width: span(3, 0, span(10));
    margin-left: span(0, 1, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(3, 0, span(10));
    margin-left: span(1, 2, span(10));
  }
}
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
