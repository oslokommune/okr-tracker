<template>
  <div v-if="activeKeyResult" class="container">
    <div class="widgets--left">
      <router-link
        class="btn widget__back-button"
        :to="previousUrl ? previousUrl : { name: 'ItemHome', params: { slug: activeKeyResult.parent.slug } }"
      >
        {{ $t('general.back') }}
        <i class="fa fa-chevron-left"></i>
      </router-link>

      <widgets-left class="aside--left"></widgets-left>
    </div>

    <div class="main">
      <div class="main__item">
        <h1 class="title-1" style="font-weight: 500; text-transform: uppercase">{{ $t('general.keyResult') }}</h1>
        <h2 class="title-4">{{ $t('keyResult.updateKeyRes') }}</h2>

        <div class="key-result-row">
          <div class="key-result-row__progress">
            <h3 class="key-result-row__progress--header">
              {{ $t('keyResult.registerProgression.value') }} ({{ activeKeyResult.unit }})
            </h3>
            <div class="progression__done progression__done--keyResultHome">
              {{ $t('progress.done', { progress: percentage(activeKeyResult.progression) }) }}
            </div>
            <div class="progression__remaining progression__remaining--keyResultHome">
              {{ remainingKeyResultProgress(activeKeyResult) }}
            </div>
            <div class="progression__total">
              <span class="progression__total--current">
                {{ activeKeyResult.currentValue ? format('.1~f')(activeKeyResult.currentValue) : 0 }}
              </span>
              <span class="progression__total--target">
                {{ $t('progress.remainingOf', { progress: activeKeyResult.targetValue }) }}
              </span>
            </div>
            <div class="progress-bar__container progress-bar__container--keyResultHome">
              <div class="progress-bar" :style="{ width: percentage(activeKeyResult.progression) }"></div>
            </div>
          </div>

          <div class="key-result-row__info">
            <h3 class="title-3">{{ activeKeyResult.name }}</h3>
            <span class="key-result-row__info--description">{{ activeKeyResult.description }}</span>
          </div>

          <div class="key-result__value">
            <div>
              <h3 class="title-2">{{ $t('keyResult.newValue') }}</h3>

              <validation-observer v-slot="{ handleSubmit }">
              <form id="modal" @submit.prevent="handleSubmit(saveProgress)">
                <label>
                  <span class="title-4">{{ $t('keyResult.addComment') }}</span>
                  <textarea
                    v-model="progressNote"
                    style="margin-top: 0.5rem"
                    rows="3"
                    :placeholder="$t('keyResult.commentPlaceholder')"
                    :disabled="!allowedToEditPeriod"
                    @input="edit"
                  />
                </label>

                <div>
                  <validation-provider v-slot="{ errors }" name="value" rules="required">
                    <label class="form-group">
                      <span class="form-label">{{ $t('keyResult.newValue') }}</span>
                      <input
                        v-model="value"
                        style="margin-top: 0.25rem"
                        type="number"
                        step="any"
                        :disabled="!allowedToEditPeriod"
                        @input="edit"
                      />
                      <span class="form-field--error">{{ errors[0] }}</span>
                    </label>
                  </validation-provider>

                </div>
              </form>
            </validation-observer>
            </div>

            <button v-if="allowedToEditPeriod" form="modal" :disabled="isSaving || !changes" class="btn btn--ods key-result__value--button">
              {{ $t('btn.save') }}
            </button>
          </div>

          <div class="key-result__graph">
            <h3 class="key-result__graph--title">
              {{ $t('objective.progression') }}
            </h3>

            <svg ref="graph" class="graph"></svg>
          </div>
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

        <widgets-key-result-mobile class="aside--bottom"></widgets-key-result-mobile>

        <div class="widget__history">
          <h2 class="title-2">{{ $t('keyResultPage.history') }}</h2>
          <div class="main__table">
            <v-spinner v-if="isLoading" />
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
                  <td v-if="hasEditRights" style="width: 1rem">
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

    <widgets-right class="aside--right" />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { VPopover } from 'v-tooltip';
import { format } from 'd3-format';
import { db } from '@/config/firebaseConfig';
import Progress from '@/db/Progress';
import LineChart from '@/util/LineChart';
import { dateTimeShort, numberLocale, remainingKeyResultProgress } from '@/util';
import routerGuard from '@/router/router-guards/keyResultHome';
import WidgetsKeyResultMobile from '@/components/widgets/WidgetsKeyResultMobile.vue';

export default {
  name: 'KeyResultHome',

  components: {
    WidgetsRight: () => import('@/components/widgets/WidgetsKeyResultHome.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
    WidgetsLeft: () => import('@/components/widgets/WidgetsItemHomeLeft.vue'),
    VPopover,
    WidgetsKeyResultMobile,
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
    showComments: false,
    isLoading: false,
    changes: false,
    progressNote: '',
    isSaving: false,
    value: null,
  }),

  computed: {
    ...mapState(['activeKeyResult', 'activePeriod', 'user', 'activeItem', 'previousUrl']),
    ...mapGetters(['hasEditRights', 'allowedToEditPeriod']),

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
        this.value = keyResult.currentValue || keyResult.startValue || 0;
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
    format,
    remainingKeyResultProgress,

    async remove(id) {
      try {
        await Progress.remove(this.activeKeyResult.id, id);
        this.$toasted.show(this.$t('toaster.delete.progression'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.deleteProgress'));
      }
    },

    formatValue(value) {
      return numberLocale.format(',')(value);
    },

    percentage(value) {
      return format('.0%')(value);
    },

    async saveProgress() {
      if (!this.allowedToEditPeriod) return;

      this.isSaving = true;
      try {
        await Progress.create(this.activeKeyResult.id, {
          value: +this.value,
          comment: this.progressNote,
          timestamp: new Date(),
        });
        this.$toasted.show(this.$t('toaster.add.progression'));
      } catch (e) {
        console.log(e);
        this.$toasted.error(this.$t('toaster.error.progression'));
      } finally {
        this.isSaving = false;
        this.changes = false;
      }
    },

    edit() {
      this.changes = true;
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';
@use '@/styles/progressbar';

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
  display: flex;
  flex-direction: column;

  @media screen and (min-width: bp(s)) {
    display: grid;
    grid-row-gap: 2px;
    grid-column-gap: 2px;
    grid-template-rows: repeat(3, auto);
    grid-template-columns: 1fr span(3, span(8));
    margin-bottom: 0.5rem;
    background-color: var(--color-black);
  }
}

.key-result-row__info {
  grid-area: 2 / 1 / 3 / 2;
  padding: 1.5rem 1.75rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  background-color: var(--color-primary);
}

.key-result-row__info--description {
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.key-result-row__progress {
  display: grid;
  grid-area: 1 / 1 / 2 / 2;
  grid-column-gap: 2px;
  grid-template-rows: repeat(5, auto);
  grid-template-columns: 1fr;
  align-self: center;
  width: 100%;
  height: 100%;
  padding: 1.5rem 1.75rem 1.5rem 1.75rem;
  color: var(--color-text-secondary);
  background-color: var(--color-primary);
}

.key-result-row__progress--header {
  grid-area: 1 / 1 / 2 / 2;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-transform: uppercase;
}

.progress-bar__container--keyResultHome {
  grid-area: 5 / 1 / 6 / 2;
}

.progression__done--keyResultHome {
  grid-area: 3 / 1 / 4 / 2;
  align-self: end;
}

.progression__remaining--keyResultHome {
  grid-area: 4 / 1 / 5 / 2;
  align-self: end;
  font-weight: 500;
}

.progression__total {
  display: grid;
  grid-area: 2 / 1 / 3 / 2;
  grid-template-rows: repeat(2, auto);
  grid-template-columns: 1fr;
  justify-self: start;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.progression__total--current {
  align-self: center;
  justify-self: center;
  padding: 1rem 2rem;
  color: var(--color-text);
  font-weight: 700;
  font-size: typography.$font-size-5;
  background-color: var(--color-grey-50);
}

.progression__total--target {
  align-self: end;
  justify-self: end;
  padding: 0.5rem 0.5rem;
  color: var(--color-text-secondary);
  font-size: typography.$font-size-0;
}

.key-result__graph {
  grid-area: 3 / 1 / 4 / 3;
  padding: 1.5rem 1.75rem 0 1.75rem;
  background-color: var(--color-white);
}

.key-result__value {
  display: flex;
  flex-direction: column;
  grid-area: 1 / 2 / 3 / 3;
  justify-content: space-between;
  padding: 1.5rem 1.75rem 1.5rem 1.75rem;
  color: var(--color-text-secondary);
  background-color: var(--color-primary);
}

.key-result__value--button {
  align-self: end;
}
</style>
