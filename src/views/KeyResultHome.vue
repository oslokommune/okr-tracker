<template>
  <div v-if="activeKeyResult" class="flex-container">
    <div class="main">
      <h1 class="title-1">{{ activeKeyResult.name }}</h1>
      <p>{{ activeKeyResult.description }}</p>

      <div class="main-widgets">
        <div class="main-widgets__current main-widgets__current--children">
          <h3 class="main-widgets__title">
            <i class="fas fa-chart-line" />
            {{ $t('keyres.registerProgression.value') }}
          </h3>
          <div class="main-widgets__current--value">
            {{
              typeof activeKeyResult.currentValue === 'undefined'
                ? formatValue(activeKeyResult.startValue)
                : formatValue(activeKeyResult.currentValue)
            }}
          </div>

          <div class="main-widgets__current--unit">
            {{ activeKeyResult.unit }}
          </div>

          <button v-if="!activeKeyResult.auto || hasEditRights" class="btn btn--ter" @click="isOpen = true">
            {{ $t('keyres.updateValue') }}
          </button>
        </div>

        <div class="main-widgets__graph">
          <h3 class="main-widgets__title">
            <i class="fas fa-chart-line" />
            {{ $t('objective.progression') }}
          </h3>

          <svg ref="graph" class="graph"></svg>
        </div>
      </div>

      <div v-if="activeKeyResult.auto" class="auto">
        <div class="auto__icon fa fa-magic"></div>
        <div class="auto__text">
          {{ $t('keyres.autoHelpText') }}
        </div>
      </div>

      <div v-if="activeKeyResult.auto && activeKeyResult.error" class="auto auto--invalid">
        <div class="auto__icon fa fa-exclamation-triangle"></div>
        <div class="auto__text">
          <p>{{ $t('keyres.autoError') }}</p>
          <pre class="auto__errormsg">{{ activeKeyResult.error }}</pre>
        </div>
      </div>

      <widgets-key-result-home class="aside--middle"></widgets-key-result-home>

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
                    v-tooltip="!showComments ? $t('keyres.showComments') : $t('keyres.hideComments')"
                    class="fa"
                    :class="showComments ? 'fa-eye' : 'fa-eye-slash'"
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
                <span v-if="p.comment && showComments">
                  {{ p.comment }}
                </span>
                <v-popover v-if="p.comment && !showComments" placement="top">
                  <i v-tooltip="$t('keyres.showComment')" class="fa fa-comment-alt comment-icon" />
                  <template slot="popover">
                    {{ p.comment }}
                  </template>
                </v-popover>
              </td>
              <td v-if="hasEditPermissions" style="width: 1rem">
                <v-popover offset="16" placement="top">
                  <button class="btn btn--ter btn--icon btn--icon-pri">
                    <i class="icon far fa-trash-alt" />
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

    <widgets-key-result-home class="aside--right"></widgets-key-result-home>

    <modal v-if="isOpen" :keyres="activeKeyResult" @close="closeModal"></modal>
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
@import '@/styles/typography.scss';

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
  color: white;
  font-family: monospace;
  background: rgba(black, 0.75);
  border-radius: 3px;
}
</style>
