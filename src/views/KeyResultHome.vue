<template>
  <div v-if="activeKeyResult" class="keyres">
    <div class="main">
      <h1 class="title-1">{{ activeKeyResult.name }}</h1>
      <p>{{ activeKeyResult.description }}</p>

      <div class="main-widgets">
        <div class="main-widgets__current main-widgets__current__children">
          <h3 class="main-widgets__title">
            <i class="fas fa-chart-line" />
            {{ $t('keyres.registerProgression.value') }}
          </h3>
          <div class="main-widgets__current__value">
            {{
              typeof activeKeyResult.currentValue === 'undefined'
                ? activeKeyResult.startValue
                : activeKeyResult.currentValue
            }}
          </div>

          <div class="main-widgets__current__unit">
            {{ activeKeyResult.unit }}
          </div>

          <button v-if="!activeKeyResult.auto" class="btn btn--ter" @click="isOpen = true">
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

      <h2 class="title-2">{{ $t('keyResultPage.history') }}</h2>
      <div class="main__table">
        <empty-state
          v-if="!progress.length"
          :icon="'history'"
          :heading="$t('empty.keyResultProgress.heading')"
          :body="$t('empty.keyResultProgress.body')"
        />
        <table v-if="progress.length" class="table">
          <thead>
            <tr>
              <th>{{ $t('keyResultPage.value') }}</th>
              <th>{{ $t('keyResultPage.date') }}</th>
              <th>{{ $t('keyResultPage.registeredBy') }}</th>
              <th></th>
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
              </td>
              <td>
                <v-popover
                  v-if="p.comment"
                  x-placement="bottom"
                  :open="isFirstProgressWithComment(p)"
                  :auto-hide="true"
                >
                  <i v-tooltip="$t('keyres.showComment')" class="fa fa-comment-alt comment-icon" />
                  <template slot="popover">
                    {{ p.comment }}
                  </template>
                </v-popover>
              </td>
              <td v-if="hasEditPermissions" style="width: 1rem">
                <v-popover offset="16" placement="top" show="true">
                  <button class="btn btn--ter btn--icon">
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

    <widgets-key-result-home class="aside"></widgets-key-result-home>

    <modal v-if="isOpen" :keyres="activeKeyResult" @close="closeModal"></modal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { VPopover } from 'v-tooltip';
import { db } from '@/config/firebaseConfig';
import Progress from '@/db/Progress';
import LineChart from '@/util/LineChart';
import { dateTimeShort } from '@/util/formatDate';
import routerGuard from '@/router/router-guards/keyResultHome';

export default {
  name: 'KeyResultHome',

  components: {
    WidgetsKeyResultHome: () => import('@/components/widgets/WidgetsKeyResultHome.vue'),
    Modal: () => import('@/components/Modal.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
    VPopover,
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
  }),

  computed: {
    ...mapState(['activeKeyResult', 'activePeriod', 'user', 'activeItem']),
  },

  watch: {
    activeKeyResult: {
      immediate: true,
      async handler(keyresult) {
        if (!keyresult) return;
        await this.$bind('progress', db.collection(`keyResults/${keyresult.id}/progress`).orderBy('timestamp', 'desc'));

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

    isFirstProgressWithComment({ id }) {
      const firstProgressWithComment = this.progress.find(({ comment }) => comment);
      return id === firstProgressWithComment.id;
    },

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
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';
@import '@/styles/typography.scss';

.keyres {
  display: flex;
  flex-wrap: wrap;
}

.main-widgets {
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-top: 1.5rem;
  margin-bottom: 2rem;

  @media screen and (max-width: bp(s)) {
    flex-direction: column;
  }

  &__title {
    margin-bottom: 0.5rem;
    color: $color-grey-400;
    font-weight: 500;
    font-size: $font-size-0;
    text-transform: uppercase;
  }

  &__current {
    align-self: flex-start;
    width: span(3);
    margin-bottom: 0.5rem;

    padding: 1rem;
    background: white;
    box-shadow: 0 2px 3px rgba(black, 0.1);

    @media screen and (max-width: bp(s)) {
      width: span(9);
    }

    @media screen and (min-width: bp(m)) {
      width: span(2, 0, span(9));
    }

    @media screen and (min-width: bp(l)) {
      width: span(2, 0, span(7));
    }

    @media screen and (min-width: bp(xl)) {
      width: span(2, 0, span(6));
    }

    &__value {
      color: $color-yellow;
      font-weight: 700;
      font-size: 50px;
    }

    &__unit {
      margin-top: -0.5rem;
      margin-bottom: 0.5rem;
      font-weight: 500;
      text-transform: capitalize;
    }

    &__children {
      display: flex;
      flex-direction: column;
    }
  }

  &__graph {
    width: span(9);

    margin-left: span(0, 1);
    padding: 1rem;
    background: white;
    box-shadow: 0 2px 3px rgba(black, 0.1);

    @media screen and (max-width: bp(s)) {
      margin-left: span(0);
    }

    @media screen and (min-width: bp(m)) {
      width: span(7, 0, span(9));
      margin-left: span(0, 1, span(9));
    }

    @media screen and (min-width: bp(l)) {
      width: span(5, 0, span(7));
      margin-left: span(0, 1, span(7));
    }

    @media screen and (min-width: bp(xl)) {
      width: span(4, 0, span(6));
      margin-left: span(0, 1, span(6));
    }
  }
}

.main__table {
  width: 100%;
  overflow: auto;
}

.group {
  margin-bottom: 1rem;
  background: white;
  box-shadow: 0 2px 2px rgba(black, 0.06);
}

.comment-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border-radius: 3px;

  &:hover {
    background: rgba($color-grey-500, 0.1);
  }
}

.user__link {
  display: flex;
  align-items: center;
  color: $color-purple;
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
  background: rgba($color-yellow, 0.25);
  border: 1px solid $color-yellow;
  border-radius: 3px;

  &--invalid {
    background: rgba($color-red, 0.25);
    border: 1px solid $color-red;
  }
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
