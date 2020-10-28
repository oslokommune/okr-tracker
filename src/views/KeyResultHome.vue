<template>
  <div class="keyres" v-if="activeKeyResult">
    <div class="main">
      <h1 class="title-1">{{ activeKeyResult.name }}</h1>
      <p>{{ activeKeyResult.description }}</p>

      <div class="main-widgets">
        <div class="main-widgets__current main-widgets__current__children">
          <h3 class="main-widgets__title">
            <i class="fas fa-chart-line"></i>
            {{ $t('keyres.registerProgression.value') }}
          </h3>
          <div class="main-widgets__current__value">
            {{ activeKeyResult.currentValue }}
          </div>

          <div class="main-widgets__current__unit">
            {{ activeKeyResult.unit }}
          </div>

          <button v-if="!activeKeyResult.auto" @click="isOpen = true" class="btn btn--ter">
            {{ $t('keyres.updateValue') }}
          </button>
        </div>

        <div class="main-widgets__graph">
          <h3 class="main-widgets__title">
            <i class="fas fa-chart-line"></i>
            {{ $t('objective.progression') }}
          </h3>

          <svg class="graph" ref="graph"></svg>
        </div>
      </div>

      <div v-if="activeKeyResult.auto" class="auto">
        <div class="auto__icon fa fa-magic"></div>
        <div class="auto__text">
          {{ $t('keyres.autoHelpText') }}
        </div>
      </div>

      <h2 class="title-2">{{ $t('keyResultPage.history') }}</h2>
      <div class="main__table">
        <empty-state
          v-if="!progress.length"
          :icon="'history'"
          :heading="$t('empty.keyResultProgress.heading')"
          :body="$t('empty.keyResultProgress.body')"
        ></empty-state>
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
                <v-popover placement="top" v-if="p.comment">
                  <i class="fa fa-comment-alt comment-icon" v-tooltip="$t('keyres.showComment')"></i>

                  <template slot="popover">
                    {{ p.comment }}
                  </template>
                </v-popover>
              </td>
              <td v-if="hasEditPermissions" style="width: 1rem">
                <v-popover offset="16" placement="top" show="true">
                  <button class="btn btn--ter btn--icon">
                    <i class="icon far fa-trash-alt"></i>
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

    <modal v-if="isOpen" @close="closeModal" :keyres="activeKeyResult"></modal>
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
import * as Toast from '@/util/toasts';

export default {
  name: 'KeyResultHome',

  components: {
    WidgetsKeyResultHome: () => import('@/components/widgets/WidgetsKeyResultHome.vue'),
    Modal: () => import('@/components/Modal.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
    VPopover,
  },
  data: () => ({
    progress: [],
    newValue: null,
    graph: null,
    isOpen: false,
  }),

  beforeRouteUpdate: routerGuard,

  async beforeRouteLeave(to, from, next) {
    try {
      await this.$store.dispatch('set_active_key_result', null);
      return next();
    } catch (error) {
      console.error(error);
      next(false);
    }
  },

  computed: {
    ...mapState(['activeKeyResult', 'activePeriod', 'user', 'activeItem']),
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
        Toast.show(this.$t('toaster.delete.progression'));
      } catch {
        Toast.error(this.$t('toaster.error.deleteProgress'));
      }
    },

    hasEditPermissions() {
      return this.user.admin || this.activeItem.team.includes(this.user);
    },

    closeModal() {
      this.isOpen = false;
    },
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
  width: 100%;
  margin-top: 1.5rem;
  margin-bottom: 2rem;

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

    @media screen and (min-width: bp(m)) {
      width: span(2, 0, span(9));
    }

    @media screen and (min-width: bp(l)) {
      width: span(2, 0, span(7));
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

    @media screen and (min-width: bp(m)) {
      width: span(7, 0, span(9));
      margin-left: span(0, 1, span(9));
    }

    @media screen and (min-width: bp(l)) {
      width: span(5, 0, span(7));
      margin-left: span(0, 1, span(7));
    }

    @media screen and (min-width: bp(xl)) {
      width: span(5, 0, span(7));
      margin-left: span(0, 1, span(7));
    }
  }
}

.main {
  width: span(12);
  padding-top: 1.5rem;

  @media screen and (min-width: bp(m)) {
    width: span(9, 0, span(9));
  }

  @media screen and (min-width: bp(l)) {
    width: span(7, 0, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(6, 0, span(10));
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
}

.auto__icon {
  flex-shrink: 0;
  margin-top: 0.2rem;
  margin-right: 0.75rem;
}
</style>
