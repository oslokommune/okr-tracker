<template>
  <aside v-if="activeKeyResult" class="wrapper">
    <div v-if="hasEditRights" class="keyresult">
      <router-link
        class="btn btn--ter btn--icon"
        :to="{ name: 'ItemAdminOKRs', query: { type: 'keyResult', id: activeKeyResult.id } }"
      >
        <i class="icon fa fa-edit"></i>
        {{ $t('keyResultPage.change') }}
      </router-link>
    </div>

    <button v-if="activeKeyResult.auto" @click="update">Oppdater automatisk verdi</button>

    <div v-if="activeKeyResult" class="widgets">
      <widget-key-result-details widget-id="keyResultHome.details"></widget-key-result-details>
      <widget-key-result-notes widget-id="keyResultHome.notes"></widget-key-result-notes>
      <widget-key-result-weights widget-id="keyResultHome.weights"></widget-key-result-weights>
    </div>
  </aside>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'WidgetsKeyResultHome',

  components: {
    WidgetKeyResultDetails: () => import('./WidgetKeyResultDetails.vue'),
    WidgetKeyResultNotes: () => import('./WidgetKeyResultNotes.vue'),
    WidgetKeyResultWeights: () => import('./WidgetKeyResultWeights.vue'),
  },

  computed: {
    ...mapState(['activeKeyResult', 'user']),
    ...mapGetters(['hasEditRights']),
  },

  methods: {
    update() {
      // const myCall = functions.httpsCallable('triggerScheduledFunction');
      console.log(this.activeKeyResult);
    },
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
  display: flex;
  width: 100%;
  margin: 1.75rem 0 1rem;

  & > .btn {
    width: 100%;
  }
}
</style>
