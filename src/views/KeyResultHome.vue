<template>
  <div v-if="activeKeyResult" class="container">
    <div class="widgets--left">
      <router-link
        class="btn btn--ter btn--icon widget__back-button"
        :to="previousUrl ? previousUrl : { name: 'ItemHome', params: { slug: activeKeyResult.parent.slug } }"
      >
        Back
        <i class="fas fa-angle-left"></i>
      </router-link>

      <widgets-left class="aside--left"></widgets-left>
    </div>

    <div class="keyResult-home">
      <div class="keyResult">
        <h1 class="title-1" style=" font-weight: 500;text-transform: uppercase">{{ $t('general.keyResult') }}</h1>
        <h2 class="title-4">Oppdater verdi for nøkkelresutlatet</h2>
        <p>{{ activeKeyResult.description }}</p>

        <div class="key-result-row">
          <div class="key-result-row__info">
            <h3 class="title-3">{{ activeKeyResult.name }}</h3>
            <span class="key-result-row__info--description">{{ activeKeyResult.description }}</span>
          </div>

          <div class="key-result-row__progress">
            <h3 class="key-result-row__progress--header">
              {{ $t('keyResult.registerProgression.value') }} ({{ activeKeyResult.unit }})
            </h3>
            <div class="progression__done progression__done--keyResultHome">
              {{ percentage(activeKeyResult.progression) }} fullført
            </div>
            <div class="progression__remaining progression__remaining--keyResultHome">
              {{ remaining(activeKeyResult) }} gjenstår
            </div>
            <div class="progression__total progression__total--keyResultHome">
              <span class="progression__total--current progression__total--current--keyResultHome">{{
                activeKeyResult.currentValue || 0
              }}</span>
              <span class="progression__total--target progression__total--target--keyResultHome"
                >av {{ activeKeyResult.targetValue }}</span
              >
            </div>
            <div class="progress-bar__container progress-bar__container--keyResultHome">
              <div class="progress-bar" :style="{ width: percentage(activeKeyResult.progression) }"></div>
            </div>
          </div>

          <div class="key-result__graph">
            <h3 class="key-result__graph--title">
              {{ $t('objective.progression') }}
            </h3>

            <svg ref="graph" class="graph"></svg>
          </div>

          <div class="key-result__value">
            <h3 class="title-2">Ny Verdi</h3>

            <validation-observer v-slot="{ handleSubmit }">
              <form id="modal" @submit.prevent="handleSubmit(saveProgress)">
                <label>
                  <span class="title-4">{{ $t('keyResult.addComment') }}</span>
                  <textarea
                    v-model="progressNote"
                    class="modal__textarea"
                    style="margin-top: 0.5rem"
                    rows="3"
                    @input="edit"
                    placeholder="Dette er en kommentar.."
                  />
                </label>

                <div>
                  <validation-provider v-slot="{ errors }" name="value" rules="required">
                    <label class="form-group modal__main--input-label">
                      <span class="form-label">{{ $t('keyResult.newValue') }}</span>
                      <input
                        v-model="value"
                        class="form__field modal__main--input-value"
                        style="margin-top: 0.25rem"
                        type="number"
                        step="any"
                        @input="edit"
                      />
                      <span class="form-field--error">{{ errors[0] }}</span>
                    </label>
                  </validation-provider>

                  <button class="btn btn--ter modal__main--btn" @click.prevent="date = new Date()">
                    {{ $t('keyResultPage.add.today') }}
                  </button>
                </div>
              </form>
            </validation-observer>
            <button form="modal" :disabled="isSaving || !changes" class="btn btn--sec">
              {{ $t('btn.save') }}
            </button>
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

        <widgets-key-result-home class="aside--middle"></widgets-key-result-home>
        <widgets-left class="aside--bottom"></widgets-left>

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
import { format } from 'd3-format';
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
    changes: false,
    progressNote: '',
    isSaving: false,
    value: null,
  }),

  computed: {
    ...mapState(['activeKeyResult', 'activePeriod', 'user', 'activeItem', 'previousUrl']),
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

    percentage(value) {
      return format('.0%')(value);
    },

    remaining(keyRes) {
      if (keyRes.targetValue < keyRes.startValue) {
        if (!keyRes.currentValue) {
          return keyRes.startValue;
        }
        return keyRes.startValue - keyRes.currentValue;
      }
      if (!keyRes.currentValue) {
        return keyRes.targetValue;
      }
      return keyRes.targetValue - keyRes.currentValue;
    },

    async saveProgress() {
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

.keyResult {
  padding: 1rem 1rem 3rem 1rem;
  color: var(--color-text);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0) 60%,
    rgba(255, 255, 255, 0) 100%
  );
}

.keyResult-home {
  width: span(12);

  @media screen and (min-width: bp(m)) {
    width: span(8);
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
  display: flex;
  flex-direction: column;
  @media screen and (min-width: bp(s)) {
    display: grid;
    grid-row-gap: 0.5rem;
    grid-template-rows: repeat(2, auto);
    grid-template-columns: 1fr span(3, span(8));
    margin-bottom: 0.5rem;
  }
}

.key-result-row__info {
  grid-area: 1 / 1 / 2 / 2;
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
  display: grid;
  grid-area: 1 / 2 / 2 / 3;
  grid-template-rows: repeat(4, auto);
  grid-template-columns: 1fr auto;
  align-self: center;
  width: 100%;
  padding: 1.5rem 1.75rem 1.5rem 1.75rem;
  color: var(--color-text-secondary);
  background-color: var(--color-primary);
}

.key-result-row__progress--header {
  grid-area: 1 / 1 / 2 / 2;
  margin-bottom: 0.5rem;
  padding-bottom: 2rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-transform: uppercase;
}

.widget__back-button {
  display: flex;
  justify-content: space-between;
  width: span(12);
  margin-bottom: 0.5rem;
  padding: 2rem 1.5rem;
  color: var(--color-text);
  font-weight: 500;
  text-transform: uppercase;
  background-color: var(--color-white);

  @media screen and (min-width: bp(m)) {
    width: span(12);
  }
}

.aside--left {
  display: none;

  @media screen and (min-width: bp(m)) {
    display: block;
    width: span(2, span(2));
  }
}

.widgets--left {
  width: span(12);

  @media screen and (min-width: bp(m)) {
    width: span(2);
  }
}

.progress-bar__container--keyResultHome {
  grid-area: 4 / 1 / 5 / 3;
}

.progression__done--keyResultHome {
  grid-area: 2 / 1 / 3 / 2;
}

.progression__remaining--keyResultHome {
  grid-area: 3 / 1 / 4 / 2;
  font-weight: 500;
}

.progression__total--keyResultHome {

  display: grid;
  grid-area: 1 / 2 / 4 / 3;
  grid-template-rows: repeat(2, auto);
  grid-template-columns: 1fr;
  color: var(--color-text);
}

.progression__total--current--keyResultHome {
  align-self: center;
  justify-self: center;
  padding: 0.5rem 2rem;
  font-size: typography.$font-size-5;
}

.progression__total--target--keyResultHome {
  align-self: end;
  justify-self: end;
  padding: 0.5rem 0.5rem;
  font-size: typography.$font-size-0;
}

.key-result__graph {
  grid-area: 2 / 1 / 3 / 2;
  padding: 1.5rem 1.75rem 0 1.75rem;
  background-color: var(--color-white);
}

.key-result__value {
  grid-area: 2 / 2 / 3 / 3;
  padding: 1.5rem 1.75rem 1.5rem 1.75rem;
  color: var(--color-text-secondary);
  background-color: var(--color-primary);
}
</style>
