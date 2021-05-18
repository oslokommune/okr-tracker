<template>
  <div>
    <div v-if="!data.created" class="kpi kpi--empty">
      <div class="kpi__name">{{ kpi.label }}</div>
      <i class="kpi__icon far" :class="kpi.icon" />
    </div>

    <router-link
      v-else
      v-tooltip="kpi.label"
      :to="{ name: 'KpiHome', params: { kpiId: data.id } }"
      class="kpi"
      :class="{ disabled: data.error }"
    >
      <div class="kpi__name">{{ data.name }}</div>
      <div class="kpi__value">
        <span v-if="data.error || !data.valid">–––</span>
        <span v-else-if="type === 'users'"> {{ data.currentValue }}</span>
        <span v-else>{{ kpi.formatValue(data.currentValue) }}</span>
      </div>
      <i class="kpi__icon far" :class="kpi.icon" />
    </router-link>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      required: true,
    },
    kpi: {
      type: Object,
      required: true,
    },
    data: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/colors';

.kpi {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 8rem;
  padding: 1rem;
  overflow: hidden;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-decoration: none;
  background: var(--color-primary);

  &:hover {
    background: var(--color-primary-dark);
  }

  &.disabled {
    opacity: 0.6;
  }
}

.kpi--empty {
  color: rgba(colors.$color-purple, 0.25);
  background: rgba(colors.$color-grey-100, 0.5);

  &:hover {
    background: rgba(colors.$color-grey-100, 0.4);
  }

  & > .kpi__icon {
    opacity: 0.25;
  }
}

.kpi__value {
  font-weight: 900;
  font-size: 3rem;
  line-height: 1em;
}

.kpi__icon {
  position: absolute;
  right: -1rem;
  bottom: -1rem;
  font-size: 8rem;
  opacity: 0.15;
}
</style>
