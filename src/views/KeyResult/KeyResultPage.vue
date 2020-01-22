<template>
  <div>
    <PageHeader :data="key_result || {}"></PageHeader>

    <div class="container container--sidebar">
      <div class="content--main content--padding">
        <div class="section">
          <h1 class="title-1" v-if="key_result">{{ key_result.key_result }}</h1>
        </div>

        <hr />

        <svg class="graph" ref="graph"></svg>

        <hr />

        <section class="section">
          <h2 class="title-2">Legg til nytt målepunkt</h2>

          <form @submit.prevent="addValue" class="form-group">
            <div class="form-row">
              <label class="form-field">
                <span class="form-label">Verdi</span>
                <input type="number" v-model="value" />
              </label>
              <label class="form-field">
                <span class="form-label">Dato</span>
                <input type="datetime-local" v-model="date" />
              </label>
            </div>
            <div class="form-field">
              <button class="btn">Legg til</button>
            </div>
          </form>
        </section>

        <hr />

        <section class="section" v-if="key_result">
          <h2 class="title-2">Registrerte målepunkter</h2>

          <div v-if="!progressions">Det er ingen registrerte målepunkter</div>

          <table v-if="progressions" class="table">
            <thead>
              <tr>
                <th>Verdi</th>
                <th>Dato</th>
                <th>Registrert av</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prog in list" :key="prog.id">
                <td>{{ prog.value }}</td>
                <td>{{ prog.date | formatDate }}</td>
                <td>{{ prog.created_by.id }}</td>
                <td style="width: 1rem;">
                  <button class="btn btn--borderless" @click="deleteValue(prog)">
                    <i class="fas fa-fw fa-trash"></i>Slett
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import moment from 'moment';
import { serializeDocument } from '../../util/db';
import PageHeader from '@/components/PageHeader.vue';
import * as Toast from '@/util/toasts';
import Linechart from '@/util/linechart';

export default {
  data: () => ({
    graph: null,
    doc: null,
    value: 0,
    date: moment().format('YYYY-MM-DDTHH:00'),
    unsubscribe: {
      doc: null,
      collection: null,
    },
    progressions: [],
  }),

  computed: {
    ...mapState(['user', 'key_result']),

    list() {
      return this.progressions
        .map(d => {
          d.date = d.date.toDate();
          return d;
        })
        .sort((a, b) => b.date - a.date);
    },

    obj() {
      return {
        date: moment(this.date).toDate(),
        value: +this.value,
        archived: false,
        created: new Date(),
        created_by: this.user.ref,
      };
    },
  },

  async created() {
    this.doc = await this.watchKeyResult(this.$route.params.keyresid);

    this.doc.collection('progression').onSnapshot(snapshot => {
      this.progressions = snapshot.docs.map(serializeDocument).sort((a, b) => b.date - a.date);
    });
  },

  async mounted() {
    if (!this.$refs.graph) return;
    if (!this.key_result) return;

    this.graph = new Linechart(this.$refs.graph);
    const quarter = await this.key_result.ref.parent.parent.get().then(d => d.data().quarter);
    this.graph.render(this.key_result, quarter, this.list);
  },

  watch: {
    async list(newVal) {
      if (!newVal) return;

      if (!this.graph) {
        this.graph = new Linechart(this.$refs.graph);
      }

      const quarter = await this.key_result.ref.parent.parent.get().then(d => d.data().quarter);
      this.graph.render(this.key_result, quarter, newVal);
    },
  },

  filters: {
    formatDate(date) {
      return moment(date).format('DD.MM.YYYY HH:mm');
    },
  },

  components: {
    PageHeader,
  },

  methods: {
    ...mapActions(['watchKeyResult']),

    deleteValue(doc) {
      doc.ref
        .delete()
        .then(Toast.deleted)
        .then(this.updateCurrentValue)
        .catch(Toast.error);
    },

    async addValue() {
      await this.key_result.ref
        .collection('progression')
        .add(this.obj)
        .then(Toast.addedProgression)
        .then(this.updateCurrentValue)
        .catch(Toast.error);

      this.value = 0;
    },

    // Finds the most recent registered value and saves it to the `keyres` object in db
    async updateCurrentValue() {
      const currentValue = this.list[0].value;
      return this.doc
        .update({ currentValue })
        .then(Toast.savedChanges)
        .catch(Toast.error);
    },
  },

  beforeDestroy() {
    if (this.unsubscribe.doc) this.unsubscribe.doc();
    if (this.unsubscribe.collection) this.unsubscribe.collection();
  },
};
</script>
