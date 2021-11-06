<template>
  <div v-if="activeKeyResult" class="container">
    <widgets-left class="aside--left"></widgets-left>

    <div class="keyResult-home">
      <div class="keyResult">
        <h1 class="title-1" style="text-transform: uppercase; font-weight: 500">{{ $t('general.keyResult') }}</h1>
        <h2 class="title-4">Oppdater verdi for nøkkelresutlatet</h2>
        <p>{{ activeKeyResult.description }}</p>

        <div class="key-result-row">
          <div class="key-result-row__info">
            <h3 class="title-3">{{ activeKeyResult.name }}</h3>
            <span class="key-result-row__info--description">{{ activeKeyResult.description}}</span>
          </div>

          <div class="key-result-row__progress">
            <h3 class="key-result-row__progress--header">
              {{ $t('keyResult.registerProgression.value') }} ({{ activeKeyResult.unit }})
            </h3>
            <progress-bar-expanded class="key-result-row__progression" :key-result="activeKeyResult" />
          </div>

        </div>

        <div class="main-widgets__graph">
          <h3 class="main-widgets__title">
            {{ $t('objective.progression') }}
          </h3>

          <svg ref="graph" class="graph"></svg>
        </div>

        <div v-if="activeKeyResult.auto" class="auto">
          <div class="auto__icon fa fa-magic"></div>
          <div class="auto__text">
            {{ $t('keyResult.autoHelpText') }}
          </div>
        </div>

        <div v-if="activeKeyResult.auto && activeKeyResult.error" class="auto auto--invalid">
          <div class="auto__icon fa fa-exclamation-triangle"></div>
          <div class="auto__text">
            <p>{{ $t('keyResult.autoError') }}</p>
            <pre class="auto__errormsg">{{ activeKeyResult.error }}</pre>
          </div>
        </div>

        <widgets-key-result-home class="aside--middle"></widgets-key-result-home>

        <div class="keyResult__history">
          <h2 class="title-2">{{ $t('keyResultPage.history') }}</h2>
          <div class="main__table">
            <spinner v-if="isLoading" />
            <empty-state
              v-else-if="!progress.length || progress.length === 0"
              :icon="'history'"
              :heading="$t('empty.keyResultProgress.heading')"
              :body="$t('empty.keyResultProgress.body')"
            />
            <table v-else class="table">
              <thead>
                <tr>
                  <th>{{ $t('keyResultPage.value') }}</th>
                  <th>{{ $t('keyResultPage.date') }}</th>
                  <th>{{ $t('keyResultPage.registeredBy') }}</th>
                  <th>
                    <button v-if="hasComments" class="btn btn--ter" @click="showComments = !showComments">
                      <span
                        v-tooltip="showComments ? $t('keyResult.showComments') : $t('keyResult.hideComments')"
                        class="fa"
                        :class="!showComments ? 'fa-eye' : 'fa-eye-slash'"
                      ></span>
                    </button>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in progress" :key="p.id">
                  <td>{{ p.value }}</td>
                  <td>{{ dateTimeShort(p.timestamp.toDate()) }}</td>
                  <td>
                    <router-link
                      v-if="p.createdBy && p.createdBy.id"
                      :to="{ name: 'User', params: { id: p.createdBy.id } }"
                      class="user__link"
                    >
                      <img
                        :src="p.createdBy.photoURL || '/placeholder-user.svg'"
                        :alt="p.createdBy.photoURL"
                        aria-hidden="true"
                        class="user__image"
                      />
                      <span class="user__name">{{ p.createdBy.displayName || p.createdBy.id }}</span>
                    </router-link>
                    <span v-else>{{ p.createdBy }}</span>
                  </td>
                  <td style="max-width: 200px; padding: 0.25rem">
                    <span v-if="p.comment && !showComments">
                      {{ p.comment }}
                    </span>
                    <v-popover v-if="p.comment && showComments" placement="top">
                      <i v-tooltip="$t('keyResult.showComment')" class="fa fa-comment-alt comment-icon" />
                      <template slot="popover">
                        {{ p.comment }}
                      </template>
                    </v-popover>
                  </td>
                  <td v-if="hasEditPermissions" style="width: 1rem">
                    <v-popover offset="16" placement="top">
                      <button class="btn btn--ter">
                        {{ $t('btn.delete') }}
                      </button>

                      <template slot="popover">
                        <button class="btn btn--ter btn--negative" @click="remove(p.id)">
                          {{ $t('btn.confirmDeleteProgress') }}
                        </button>
                      </template>
                    </v-popover>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <widgets-key-result-home class="aside--right"></widgets-key-result-home>

    <modal v-if="isOpen" :key-result="activeKeyResult" @close="closeModal"></modal>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { VPopover } from 'v-tooltip';
import { db } from '@/config/firebaseConfig';
import Progress from '@/db/Progress';
import LineChart from '@/util/LineChart';
import { dateTimeShort, numberLocale } from '@/util';
import routerGuard from '@/router/router-guards/keyResultHome';

export default {
  name: 'KeyResultHome',

  components: {
    WidgetsKeyResultHome: () => import('@/components/widgets/WidgetsKeyResultHome.vue'),
    Modal: () => import('@/components/Modal.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
    VPopover,
    Spinner: () => import('@/components/Spinner.vue'),
    WidgetsLeft: () => import('@/components/widgets/WidgetsItemHomeLeft.vue'),
    ProgressBarExpanded: () => import('@/components/ProgressBarExpanded.vue'),
  },

  beforeRouteUpdate: routerGuard,

  async beforeRouteLeave(to, from, next) {
    try {
      await this.$store.dispatch('set_active_key_result', null);
      next();
    } catch (error) {
      console.error(error);
      next(false);
    }
  },

  data: () => ({
    progress: [],
    newValue: null,
    graph: null,
    isOpen: false,
    showComments: false,
    isLoading: false,
  }),

  computed: {
    ...mapState(['activeKeyResult', 'activePeriod', 'user', 'activeItem']),
    ...mapGetters(['hasEditRights']),

    hasComments() {
      const firstProgressWithComment = this.progress.find(({ comment }) => comment);
      return firstProgressWithComment !== undefined;
    },
  },

  watch: {
    activeKeyResult: {
      immediate: true,
      async handler(keyResult) {
        if (!keyResult) return;
        this.isLoading = true;
        await this.$bind('progress', db.collection(`keyResults/${keyResult.id}/progress`).orderBy('timestamp', 'desc'));
        this.isLoading = false;
        this.graph = new LineChart(this.$refs.graph);
        this.graph.render(this.activeKeyResult, this.activePeriod, this.progress);
      },
    },
    progress() {
      if (this.graph) {
        this.graph.render(this.activeKeyResult, this.activePeriod, this.progress);
      }
    },
  },

  mounted() {
    if (!this.$refs.graph) return;
    if (!this.activeKeyResult) return;

    this.graph = new LineChart(this.$refs.graph);
    this.graph.render(this.activeKeyResult, this.activePeriod, this.progress);
  },

  methods: {
    dateTimeShort,

    async remove(id) {
      try {
        await Progress.remove(this.activeKeyResult.id, id);
        this.$toasted.show(this.$t('toaster.delete.progression'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.deleteProgress'));
      }
    },

    hasEditPermissions() {
      return this.user.admin || this.activeItem.team.includes(this.user);
    },

    closeModal() {
      this.isOpen = false;
    },

    formatValue(value) {
      return numberLocale.format(',')(value);
    },
  },
};
</script>

<style lang="scss" scoped>
.keyResult {
  color: var(--color-text);
  background: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 40%);
  padding: 1.5rem 1.75rem;
}

.keyResult-home {
  width: span(12);

  @media screen and (min-width: bp(m)) {
    width: span(6);
    margin-right: span(0, 1);
    margin-left: span(0, 1);
  }
}

.keyResult__history {
  margin-top: 0.5rem;
  padding: 1.5rem 1.75rem;
  background: var(--color-white);
}

.main__table {
  width: 100%;
  overflow: auto;
}

.comment-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border-radius: 3px;

  &:hover {
    background: rgba(var(--color-grey-500-rgb), 0.1);
  }
}

.user__link {
  display: flex;
  align-items: center;
  color: var(--color-text);
  text-decoration: none;
}

.user__image {
  width: 1.75rem;
  height: 1.75rem;
  margin-right: 0.35rem;
  border-radius: 1rem;
}

.auto {
  display: flex;
  margin: 1.5rem 0;
  padding: 1rem;
  font-weight: 500;
  background: rgba(var(--color-yellow-rgb), 0.25);
  border: 1px solid var(--color-primary);
  border-radius: 3px;
}

.auto--invalid {
  background: rgba(var(--color-red-rgb), 0.25);
  border: 1px solid var(--color-red);
}

.auto__text {
  width: 100%;
}

.auto__icon {
  flex-shrink: 0;
  margin-top: 0.2rem;
  margin-right: 0.75rem;
}

.auto__errormsg {
  width: 100%;
  margin-top: 1.25rem;
  padding: 1rem;
  color: var(--color-white);
  font-family: monospace;
  background: rgba(black, 0.75);
  border-radius: 3px;
}

.key-result-row {
  display: grid;
  grid-row-gap: 0.5rem;
  grid-template-columns: 1fr span(3, span(7));
  background-color: var(--color-primary);
}

.key-result-row__info {
  grid-column: 1;
  padding: 1.5rem 1.75rem;
  color: var(--color-grey-800);
  text-decoration: none;
  background-color: var(--color-secondary-light);
}

.key-result-row__info--description {
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.key-result-row__progress {
  grid-column: 2;
  padding: 1.5rem 1.75rem 1.5rem 1.75rem;
  align-self: center;
}

.key-result-row__progress--header {
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-transform: uppercase;
}
</style>
