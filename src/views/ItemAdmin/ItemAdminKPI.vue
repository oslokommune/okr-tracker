<template>
  <collapse-container
    :visible="visible"
    :class="[
      'form-card',
      'form-card--state-line',
      { [`form-card--${stateClass}`]: stateClass },
    ]"
    @toggle="$emit('toggle', $event, kpi)"
  >
    <template #collapse-header>
      <div class="kpi__header">
        <a :id="`${kpi.id}`" class="anchor" />
        <span class="kpi__header-label">{{ typeLabel }}</span>
        <h2>{{ kpi.name }}</h2>
      </div>
      <div class="kpi__header-value-container">
        <span class="kpi__header-label">Verdi</span>
        <span class="kpi__header-value">
          {{ formatKPIValue(kpi, kpi.currentValue) }}
        </span>
      </div>
    </template>

    <template #collapse-body>
      <hr class="ods-hr" />

      <kpi-admin-form
        :kpi="kpi"
        :loading="loading || state === 'loading'"
        @save="save"
        @delete="archive"
      />
    </template>

    <template #collapse-footer>
      <div
        :class="['kpi__footer', { [`kpi__footer--${stateClass}`]: stateClass }]"
      >
        <i
          :class="[
            'fa',
            `fa-${stateIcon}`,
            { 'fa-pulse': state === 'loading' },
          ]"
        />
        <span>{{ stateMessage }}</span>
      </div>
    </template>
  </collapse-container>
</template>

<script>
import { mapState } from 'vuex';
import { formatKPIValue, kpiFormats, kpiTypes } from '@/util/kpiHelpers';
import Kpi from '@/db/Kpi';
import { toastArchiveAndRevert } from '@/util';
import CollapseContainer from '@/components/generic/collapse/CollapseContainer.vue';
import KpiAdminForm from '@/components/forms/KpiAdminForm.vue';

export default {
  name: 'ItemAdminKPI',

  components: {
    CollapseContainer,
    KpiAdminForm,
  },

  props: {
    kpi: {
      required: true,
      type: Object,
    },
    visible: {
      required: false,
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    showAddKPIModal: false,
    formats: kpiFormats(),
    types: kpiTypes(),
    loading: false,
  }),

  computed: {
    ...mapState(['kpis']),
    state() {
      if (this.kpi.error) return 'error';
      if (this.kpi.valid) return 'valid';
      return 'loading';
    },
    stateClass() {
      switch (this.state) {
        case 'error':
          return 'danger';
        case 'valid':
          return 'success';
        default:
          return null;
      }
    },
    stateIcon() {
      switch (this.state) {
        case 'error':
          return 'exclamation-triangle';
        case 'valid':
          return 'check-circle';
        default:
          return 'spinner';
      }
    },
    stateMessage() {
      switch (this.state) {
        case 'error':
          return this.showError(this.kpi.error);
        case 'valid':
          return 'OK';
        default:
          return this.$t('general.loading');
      }
    },
    typeLabel() {
      const labels = Object.assign(
        {},
        ...this.types.map(({ id, label }) => ({ [id]: label }))
      );
      return labels[this.kpi.kpiType] || this.kpi.kpiType;
    },
  },

  watch: {
    kpi: {
      immediate: true,
      handler() {
        this.localKpi = {
          id: this.kpi.id,
          ...this.kpi,
        };
      },
    },
  },

  methods: {
    formatKPIValue,

    async save(kpi) {
      this.loading = true;
      kpi.error = false;
      kpi.valid = false;
      delete kpi.parent;

      try {
        await Kpi.update(kpi.id, kpi);
        this.$toasted.show(this.$t('toaster.savedChanges'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.save'));
      }
      this.loading = false;
    },

    async archive(kpi) {
      this.loading = true;
      try {
        await Kpi.archive(kpi.id);

        const restoreCallback = this.restore.bind(this, kpi);

        toastArchiveAndRevert({ name: kpi.name, callback: restoreCallback });
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.archive', { document: kpi.name })
        );
      }
      this.loading = false;
    },

    async restore(kpi) {
      this.loading = true;
      try {
        await Kpi.restore(kpi.id);
        this.$toasted.show(this.$t('toaster.restored'));
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.restore', { document: kpi.name })
        );
      }
      this.loading = false;
    },

    showError(msg) {
      if (msg === '403') return this.$t('error.403');
      if (msg === '404') return this.$t('error.404');

      if (msg.includes('Cannot find data in cell')) {
        const cell = msg.split('cell ')[1];
        return this.$t('error.noDataInCell', { cell });
      }
      return msg;
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.form-card {
  padding: 0;
}

::v-deep .collapse {
  &__header-content {
    display: flex;
    align-items: center;
  }
  &__header {
    padding: 1.5rem;
  }
  &__body {
    padding: 0 1.5rem 1.5rem 1.5rem;

    .ods-hr:first-child {
      margin-top: 0;
    }
  }
}

.kpi__header {
  flex-grow: 1;

  > a.anchor {
    // Position the anchor with an offset to account
    // for the fixed site header.
    display: block;
    position: relative;
    top: -8rem;
    visibility: hidden;
  }

  > h2 {
    font-weight: 500;
    font-size: typography.$font-size-2;
  }

  &-label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--color-grey-500);
    font-size: 0.75rem;
  }

  &-value-container {
    text-align: right;

    @media screen and (max-width: bp(s)) {
      display: none;
    }
  }

  &-value {
    display: block;
    font-size: typography.$font-size-2;
  }
}

.kpi__footer {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  font-size: typography.$font-size-2;
  background: var(--color-grey-50);
  border-bottom-right-radius: 3px;

  &--success {
    background: rgba(var(--color-green-rgb), 0.1);
  }
  &--warning {
    background: rgba(var(--color-yellow-rgb), 0.1);
  }
  &--danger {
    background: rgba(var(--color-red-rgb), 0.1);
  }
}

.collapse--collapsed {
  .kpi__footer {
    font-size: typography.$font-size-0;

    &--success {
      display: none;
    }
  }
}
</style>
