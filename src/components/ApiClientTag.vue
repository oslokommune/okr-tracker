<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { format, formatDistanceStrict } from 'date-fns';
import { dateTimeShort } from '@/util';

const props = defineProps({
  icon: {
    type: String,
    required: false,
    default: null,
  },
  i18nKey: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Object,
    required: false,
    default: null,
  },
  user: {
    type: [Object, String],
    required: false,
    default: null,
  },
  timeAsDistance: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const i18n = useI18n();

const timerId = ref(null);
const now = ref(null);

const userName = computed(
  () => props.user?.displayName || props.user?.id || i18n.t('general.unknown')
);

const datetime = computed(() => {
  if (!props.timestamp) {
    return i18n.t('general.unknown');
  }
  if (props.timeAsDistance && now.value) {
    return formatDistanceStrict(props.timestamp.toDate(), now.value, {
      addSuffix: true,
    });
  }
  return dateTimeShort(props.timestamp.toDate());
});

const formattedTagText = computed(() =>
  i18n.t(props.i18nKey, { when: datetime.value, name: userName.value })
);

const tooltip = computed(() =>
  props.timestamp && props.timeAsDistance
    ? format(props.timestamp.toDate(), 'P - ppp')
    : false
);

onMounted(() => {
  if (props.timeAsDistance) {
    now.value = new Date();
    timerId.value = setInterval(() => {
      now.value = new Date();
    }, 1000);
  }
});

onBeforeUnmount(() => {
  clearInterval(timerId.value);
});
</script>

<template>
  <span v-tooltip="tooltip" class="api-client-tag">
    <PktIcon v-if="icon" :name="icon" />
    <span>{{ formattedTagText }}</span>
  </span>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.api-client-tag {
  display: flex;
  gap: 0.25em;
  align-items: center;
  color: var(--color-grayscale-60);
  @include get-text('pkt-txt-14');

  .pkt-icon {
    --fg-color: var(--color-grayscale-60);
    min-width: 1em;
    min-height: 1em;
    margin-top: -0.1rem;
  }
}
</style>
