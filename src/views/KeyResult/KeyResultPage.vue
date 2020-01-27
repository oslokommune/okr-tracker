<template>
  <div>
    <PageHeader :data="key_result || {}"></PageHeader>

    <div class="container container--sidebar">
      <aside class="content--sidebar">
        <nav v-if="hasEditPermissions" class="sidebar-nav">
          <router-link
            :to="{ name: 'edit-product-keyres', params: { keyres: key_result, objective: objective } }"
            class="sidebar-nav__item"
            ><i class="fas fa fa-fw fa-edit"></i>Endre nøkkelresultat</router-link
          >
        </nav>
        <div class="edited edited--mt">Endret {{ edited }}</div>
      </aside>

      <div class="content--main content--padding">
        <div class="section">
          <h1 class="title-1" v-if="key_result">{{ key_result.key_result }}</h1>
        </div>

        <hr />

        <svg class="graph" ref="graph"></svg>

        <hr />

        <section v-if="hasEditPermissions" class="section">
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
          <hr />
        </section>

        <section class="section" v-if="key_result">
          <h2 class="title-2">Registrerte målepunkter</h2>

          <div v-if="!progressions">Det er ingen registrerte målepunkter</div>

          <table v-if="progressions" class="table">
            <thead>
              <tr>
                <th>Verdi</th>
                <th>Dato</th>
                <th>Registrert av</th>
                <th v-if="hasEditPermissions"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prog in list" :key="prog.id">
                <td>{{ prog.value }}</td>
                <td>{{ prog.date | formatDate }}</td>
                <td>{{ prog.created_by.id }}</td>
                <td v-if="hasEditPermissions" style="width: 1rem;">
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
import { format, parseISO } from 'date-fns';
import { serializeDocument, isTeamMemberOfProduct } from '../../util/db';
import PageHeader from '../../components/PageHeader.vue';
import * as Toast from '../../util/toasts';
import Linechart from '../../util/linechart';
import { getProductFromSlug, timeFromNow } from '../../util/utils';
import Audit from '../../util/audit/audit';

export default {
  name: 'KeyResultPage',

  data: () => ({
    graph: null,
    doc: null,
    value: 0,
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    objective: null,
    unsubscribe: {
      doc: null,
      collection: null,
    },
    progressions: [],
    hasEditPermissions: false,
  }),

  computed: {
    ...mapState(['user', 'key_result', 'nest']),

    list() {
      return this.progressions
        .map(d => {
          d.date = d.date.toDate();
          return d;
        })
        .sort((a, b) => b.date - a.date);
    },

    id() {
      return this.$route.params.keyresid;
    },

    obj() {
      return {
        date: parseISO(this.date),
        value: +this.value,
        archived: false,
        created: new Date(),
        created_by: this.user.ref,
      };
    },

    edited() {
      const timestamp = this.key_result.edited || this.key_result.timestamp;
      return timeFromNow(timestamp.toDate());
    },
  },

  async created() {
    this.watchData();

    this.hasEditPermissions = await isTeamMemberOfProduct(this.$route.params.slug);
  },

  async mounted() {
    if (!this.$refs.graph) return;
    if (!this.key_result) return;

    this.graph = new Linechart(this.$refs.graph);

    this.objective = await this.key_result.ref.parent.parent
      .get()
      .then(serializeDocument)
      .catch(this.$errorHandler);

    const { quarter } = this.objective;

    this.graph.render(this.key_result, quarter, this.list);
  },

  watch: {
    async list(newVal) {
      if (!newVal) return;

      if (!this.graph) {
        this.graph = new Linechart(this.$refs.graph);
      }

      const quarter = await this.key_result.ref.parent.parent
        .get()
        .then(d => d.data().quarter)
        .catch(this.$errorHandler);

      this.graph.render(this.key_result, quarter, newVal);
    },

    id() {
      this.watchData();
    },
  },

  filters: {
    formatDate(date) {
      return format(date, 'dd.MM.yyyy HH:mm');
    },
  },

  components: {
    PageHeader,
  },

  methods: {
    ...mapActions(['watchKeyResult']),

    deleteValue(doc) {
      if (!this.hasEditPermissions) return;

      doc.ref
        .delete()
        .then(Toast.deleted)
        .then(this.updateCurrentValue)
        .catch(this.$errorHandler);
    },

    async addValue() {
      await this.key_result.ref
        .collection('progression')
        .add(this.obj)
        .then(this.updateCurrentValue)
        .then(Toast.addedProgression)
        .catch(this.$errorHandler);

      this.value = 0;
    },

    async watchData() {
      if (this.unsubscribe.doc) this.unsubscribe.doc();
      if (this.unsubscribe.collection) this.unsubscribe.collection();

      const results = await this.watchKeyResult(this.id);
      this.unsubscribe.doc = results.unsubscribe;
      this.doc = results.doc;

      this.unsubscribe.collection = this.doc.collection('progression').onSnapshot(snapshot => {
        this.progressions = snapshot.docs.map(serializeDocument).sort((a, b) => b.date - a.date);
      });
    },

    // Finds the most recent registered value and saves it to the `keyres` object in db
    async updateCurrentValue() {
      const oldValue = await this.doc.get().then(d => d.data().currentValue);
      const newValue = this.list[0].value;

      if (oldValue !== newValue) {
        return this.doc
          .update({ currentValue: newValue, edited: new Date(), edited_by: this.user.ref })
          .then(async () => {
            const product = await getProductFromSlug(this.nest, this.$route.params.slug);
            return Audit.keyResUpdateProgress(this.key_result.ref, product.ref, oldValue, newValue);
          })
          .then(Toast.savedChanges)
          .catch(this.$errorHandler);
      }
      return true;
    },
  },

  beforeDestroy() {
    if (this.unsubscribe.doc) this.unsubscribe.doc();
    if (this.unsubscribe.collection) this.unsubscribe.collection();
  },
};
</script>

<style lang="scss" scoped>
@import '../../styles/_colors.scss';

.content--sidebar {
  padding-top: 3rem;
}
</style>
