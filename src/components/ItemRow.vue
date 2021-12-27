<template>
  <div style="display: flex; align-items: center; padding: 0 1rem">
    <router-link
      :to="{ name: 'ItemHome', params: { slug: data.slug } }"
      style="width: 100%"
      class="item"
      :class="{ 'item--organization': type === 'organization', 'item--department': type === 'department' }"
    >
      <span v-if="type === 'product'" class="indent" />
      <i v-if="type !== 'organization'" class="item__icon fas fa-fw" :class="`fa-${icon}`" />

      <span class="item__name" :class="`item__font--${type}`">
        {{ data.name }}
        <i v-if="isMember" v-tooltip="$t('tooltip.isMember')" class="item__user-icon fa fa-user-circle" />
      </span>

      <div class="item__kpis">
        <div
          v-for="(kpi, id) in kpiTypes"
          :key="id"
          v-tooltip="`${kpi.label}:<br> ${getKpiName(id)}`"
          class="item__kpi"
          :class="{ disabled: getKpiValue(id) === '–––' }"
        >
          <i class="item__kpi-icon far" :class="kpi.icon" />
          <span class="item__kpi-value">{{ getKpiValue(id) }}</span>
        </div>
      </div>

      <progress-bar v-tooltip="`${Math.round(progression * 100)}%`" class="progress-bar" :progression="progression" />

      <i class="item__chevron fas fa-chevron-right" />
    </router-link>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';
import kpiTypes from '@/config/kpiTypes';

export default {
  name: 'ItemRow',

  components: {
    ProgressBar: () => import('@/components/ProgressBar.vue'),
  },

  props: {
    data: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: false,
      default: '',
    },
  },

  data: () => ({
    progression: null,
    kpis: [],
    kpiTypes,
  }),

  computed: {
    ...mapState(['user']),
    isMember() {
      return !!this.data.team && this.data.team.find(({ id }) => id === this.user.id);
    },

    icon() {
      switch (this.type) {
        case 'product':
          return 'cube';
        case 'department':
          return 'cubes';
        default:
          return '';
      }
    },

    hasChildren() {
      if (this.data.children) {
        return this.data.children.length > 0;
      }
      return false;
    },
  },

  watch: {
    data: {
      immediate: true,
      async handler(data) {
        const ref = db.doc(data.path);
        this.$bind('kpis', db.collection('kpis').where('parent', '==', ref));

        data.onProgressionSnapshot(({ docs }) => {
          if (docs.length) {
            this.progression = docs[0].data().progression;
          }
        });
      },
    },
  },

  methods: {
    ...mapActions(['update_preferences']),
    getKpiValue(type) {
      try {
        return kpiTypes[type].formatValue(this.kpis.find((obj) => obj.type === type).currentValue);
      } catch {
        return '–––';
      }
    },

    getKpiName(type) {
      try {
        return this.kpis.find((obj) => obj.type === type).name;
      } catch {
        return '';
      }
    },

    toggle(type, slug) {
      if (this.user.preferences.home === undefined) {
        this.user.preferences.home = {
          collapse: {
            organization: {},
            department: {},
          },
        };
      }

      if (this.user.preferences.home.collapse[type][slug] === undefined) {
        this.user.preferences.home.collapse[type][slug] = this.user.preferences.home.collapse[type][slug] === undefined;
      } else {
        this.user.preferences.home.collapse[type][slug] = !this.user.preferences.home.collapse[type][slug];
      }
      this.update_preferences();
    },

    getCollapse(type, slug) {
      if (this.user.preferences.home === undefined || this.user.preferences.home.collapse[type][slug] === undefined) {
        return false;
      }
      return this.user.preferences.home.collapse[type][slug];
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';
@use '@/styles/griddle/mixins' as *;

.item {
  display: flex;
  align-items: center;
  margin: 0 auto 0 0;
  padding: 0.5rem span(0, 1);
  color: var(--color-text);
  text-decoration: none;

  &:hover &__chevron {
    transform: translateX(0);
    opacity: 1;
  }
}

.item__name {
  display: flex;
  flex: 1 1 100%;
  align-items: center;
  margin-right: auto;
  padding-right: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item__icon {
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 0.15rem;
  margin-right: 0.5rem;
}

.item__chevron {
  color: var(--color-grey-500);
  transform: translateX(-0.5rem);
  opacity: 0;
  transition: all 0.1s ease-in;
}

.progress-bar {
  flex-shrink: 0;
  width: span(1, 0, span(6)) !important;

  @media screen and (min-width: bp(l)) {
    width: span(2, 0, span(6));
  }
}

.item__kpis {
  display: none;
  margin-right: 1rem;

  @media screen and (min-width: bp(s)) {
    display: flex;
  }
}

.item__kpi {
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  border-right: 1px solid var(--color-grey-100);

  &.disabled {
    opacity: 0.4;
  }
}

.item__kpi-value {
  width: 2rem;
  color: #686876;
  font-weight: 500;
  font-size: 0.7rem;
  text-align: right;
}

.item__kpi-icon {
  margin-right: 0.25rem;
  color: var(--color-text);
}

.item__user-icon {
  display: inline-block;
  margin-left: auto;
  padding: 0 0.5rem;
  color: var(--color-text);
  text-align: center;
}

.indent {
  flex-shrink: 0;
  width: 1.5rem;
}

.widget__toggle {
  width: auto;
  margin-left: auto;
  padding: 0.5rem 0.25rem 0.5rem 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
}

.item__font--organization {
  font-weight: 500;
  font-size: typography.$font-size-3;
  text-transform: uppercase;
}

.item__font--department {
  font-weight: 500;
  font-size: typography.$font-size-3;
}
</style>
