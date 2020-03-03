<template>
  <div>
    <PageHeader :data="key_result || {}"></PageHeader>

    <div class="container container--sidebar">
      <aside class="content--sidebar">
        <nav v-if="hasEditPermissions" class="sidebar-nav">
          <router-link
            v-if="editRoute"
            :to="editRoute"
            class="sidebar-nav__item"
            v-tooltip.right="`Endre detaljer for nøkkelresultatet`"
            ><i class="fas fa fa-fw fa-edit"></i>Endre nøkkelresultat</router-link
          >
        </nav>
        <div class="edited edited--mt">Endret {{ edited }}</div>
      </aside>

      <div class="content--main content--padding">
        <div class="section">
          <h1 class="title-1" v-if="key_result">{{ key_result.description }}</h1>
        </div>

        <hr />

        <div class="columns">
          <div class="column--left">
            <h3 class="title-3" v-if="period">Progresjon gjennom {{ period.name }}</h3>
            <svg class="graph" ref="graph"></svg>

            <hr />

            <section class="section" v-if="key_result && key_result.auto">
              <div class="callout">
                <div class="callout__message">
                  Dette er et automatisk nøkkelresultat.
                </div>

                <div class="callout__actions">
                  <button
                    class="btn btn--borderless"
                    v-if="key_result && key_result.auto"
                    @click="triggerScheduledFunction"
                  >
                    <i v-if="!loading" class="fa fa-fw fa-sync"></i>
                    <i v-else class="fa fa-spinner fa-pulse fa-fw"></i>
                    Hent data nå
                  </button>
                </div>
              </div>
            </section>

            <section v-if="hasEditPermissions && key_result && !key_result.auto" class="section">
              <h2 class="title-2">Legg til nytt målepunkt</h2>

              <form @submit.prevent="addValue" class="form-group">
                <div class="form-row">
                  <label class="form-field">
                    <span class="form-label">Verdi</span>
                    <input
                      type="number"
                      v-model="value"
                      v-tooltip="{ content: `Skriv inn ny måleverdi`, trigger: `hover`, delay: 100 }"
                    />
                  </label>
                  <label class="form-field">
                    <span class="form-label">Dato</span>
                    <div
                      class="date-input"
                      v-tooltip.top="{
                        content: `Hvilket tidspunkt gjelder måleverdien for`,
                        trigger: `hover`,
                        delay: 100,
                      }"
                    >
                      <flat-pickr
                        v-model="date"
                        :config="flatPickerConfig"
                        class="form-control"
                        name="date"
                        placeholder="Velg dato og tid"
                      ></flat-pickr>
                      <button class="btn btn--borderless" @click.prevent="date = new Date()">I dag</button>
                    </div>
                  </label>
                </div>
                <div class="form-field">
                  <button
                    class="btn"
                    v-tooltip.right="{ content: `Lagre nytt målepunkt`, delay: 400 }"
                    :disabled="!this.date"
                  >
                    Legg til
                  </button>
                </div>
              </form>
              <hr />
            </section>

            <section class="section" v-if="key_result">
              <h2 class="title-2">
                Registrerte målepunkter
              </h2>

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
                    <td>{{ prog.createdBy.id }}</td>
                    <td v-if="hasEditPermissions" style="width: 1rem;">
                      <button
                        class="btn btn--borderless"
                        @click="deleteValue(prog)"
                        v-tooltip.left="{ content: `Slett målepunkt`, delay: { show: 400, hide: 10 } }"
                      >
                        <i class="fas fa-fw fa-trash"></i>Slett
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>

          <div class="column--right" v-if="hasEditPermissions && key_result">
            <h3 class="title-3">
              <i class="fa fa-pen"></i>
              Notater
              <button @click="editNotes = !editNotes" class="btn btn--borderless">
                <i class="fa fa-edit"></i>Endre
              </button>
            </h3>

            <template v-if="!editNotes">
              <div class="md notes" v-if="markdown" v-html="markdown"></div>
              <em v-else>Her kan du skrive notater som bare teamet ditt kan se.</em>
            </template>

            <template v-if="editNotes">
              <textarea rows="20" @input="dirty = true" v-model="key_result.notes"></textarea>
              <p>
                <strong>Tips!</strong> Her kan du skrive markdown.
                <router-link :to="{ name: 'help' }" target="_blank" rel="noopener noreferrer">Les mer</router-link>.
              </p>
              <button @click="saveNotes" class="btn" :disabled="!dirty">Lagre notater</button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { format, formatDistanceToNow } from 'date-fns';
import dateLocale from 'date-fns/locale/nb';
import flatPickr from 'vue-flatpickr-component';
import locale from 'flatpickr/dist/l10n/no';
import marked from 'marked';
import { sanitize } from 'dompurify';
import { serializeDocument, serializeList, isTeamMemberOfProduct } from '@/db/db';
import PageHeader from '@/components/PageHeader.vue';
import Linechart from '@/util/linechart';
import { deleteProgress, addProgress } from '@/db/progressHandler';
import keyResHandler from '@/db/keyresultHandler';
import 'flatpickr/dist/flatpickr.css';
import { functions } from '@/config/firebaseConfig';

marked.setOptions({
  smartypants: true,
});

export default {
  name: 'KeyResultPage',

  data: () => ({
    graph: null,
    doc: null,
    value: 0,
    date: null,
    objective: null,
    period: null,
    dirty: false,
    loading: false,
    editNotes: false,
    unsubscribe: {
      doc: null,
      collection: null,
    },
    progressions: [],
    hasEditPermissions: false,
    flatPickerConfig: {
      altInput: true,
      altFormat: 'd.m.Y H:i',
      minDate: null,
      maxDate: null,
      dateFormat: 'Z',
      time_24hr: true,
      enableTime: true,
      locale: locale.no,
    },
  }),

  computed: {
    ...mapState(['user', 'key_result', 'nest']),

    markdown() {
      if (!this.key_result || !this.key_result.notes) return '';
      return sanitize(marked(this.key_result.notes));
    },

    editRoute() {
      let name;
      if (!this.key_result) return;
      const parent = this.key_result.ref.parent.parent.parent.parent.parent.id;
      if (parent === 'products') {
        name = 'edit-product-keyres';
      } else if (parent === 'departments') {
        name = 'edit-department-keyres';
      } else {
        return;
      }

      return {
        name,
        params: { slug: this.$route.params.slug, keyres: this.key_result, objective: this.objective },
      };
    },

    list() {
      if (!this.progressions || !this.progressions.length) return;
      return this.progressions
        .map(d => {
          d.date = d.timestamp.toDate();
          return d;
        })
        .sort((a, b) => b.date - a.date);
    },

    id() {
      return this.$route.params.keyresid;
    },

    edited() {
      if (!this.key_result) return;
      const timestamp = this.key_result.edited || this.key_result.created;
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, dateLocale });
    },
  },

  async created() {
    this.watchData();

    this.hasEditPermissions = await isTeamMemberOfProduct(this.$route.params.slug);
  },

  async mounted() {
    if (!this.$refs.graph) return;
    if (!this.key_result) return;
    if (!this.list) return;

    this.graph = new Linechart(this.$refs.graph);
  },

  watch: {
    list(newVal) {
      if (!newVal) return;

      if (!this.graph && this.$refs.graph) {
        this.graph = new Linechart(this.$refs.graph);
      }

      if (!this.period) return;
      this.graph.render(this.key_result, this.period, this.list);
    },

    id() {
      this.watchData();
    },

    async key_result(obj) {
      this.value = obj.currentValue || obj.startValue || 0;

      const objectiveRef = obj.ref.parent.parent;
      this.objective = await objectiveRef
        .get()
        .then(serializeDocument)
        .catch(err => {
          this.$errorHandler('get_objective_error', err);
        });

      this.period = await this.objective.period.get().then(snapshot => snapshot.data());
      if (!this.period) return;

      const { startDate, endDate } = this.period;
      this.flatPickerConfig.minDate = startDate.toDate();
      this.flatPickerConfig.maxDate = endDate.toDate();

      this.graph.render(obj, this.period, this.list);
    },
  },

  filters: {
    formatDate(date) {
      return format(date, 'dd.MM.yyyy HH:mm');
    },
  },

  components: {
    PageHeader,
    flatPickr,
  },

  methods: {
    ...mapActions(['watchKeyResult']),

    deleteValue(doc) {
      deleteProgress(doc, this.key_result);
    },

    addValue() {
      addProgress(this.key_result, +this.value, this.date);
    },

    saveNotes() {
      keyResHandler.update(this.key_result.ref, this.key_result);
      this.dirty = false;
      this.editNotes = false;
    },

    async triggerScheduledFunction() {
      this.loading = true;

      const myCall = await functions.httpsCallable('triggerScheduledFunction');
      await myCall(this.key_result.ref.path).catch(err => {
        throw new Error(err);
      });

      this.loading = false;
    },

    async watchData() {
      if (this.unsubscribe.doc) this.unsubscribe.doc();
      if (this.unsubscribe.collection) this.unsubscribe.collection();

      const results = await this.watchKeyResult(this.id);
      this.unsubscribe.doc = results.unsubscribe;
      this.doc = results.doc;

      this.unsubscribe.collection = this.doc.collection('progress').onSnapshot(snapshot => {
        if (!snapshot.docs.length) return;
        this.progressions = serializeList(snapshot).sort((a, b) => b.date - a.date);
      });
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

.date-input {
  display: flex;
}

.columns {
  display: grid;
  grid-gap: 2rem;
  grid-template-columns: 2fr 1fr;
}

.column--right {
  & > .title-3 {
    display: flex;
    align-items: center;

    & > .btn {
      margin-left: auto;
    }

    & > .fa {
      margin-right: 0.5rem;
    }
  }
}

.notes {
  padding: 1rem;
  font-size: 0.9rem;
  background: $color-grey-50;
}
</style>
