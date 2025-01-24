<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useActiveItemStore } from '@/store/activeItem';
import { PktCheckbox, PktTag } from '@oslokommune/punkt-vue';
import { useObjective } from '@/composables/objective';
import ProgressBar from '@/components/ProgressBar.vue';
import ItemTag from '@/components/ItemTag.vue';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  objectiveId: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  dashed: {
    type: Boolean,
    default: false,
  },
  dimmed: {
    type: Boolean,
    default: false,
  },
  checked: {
    type: Boolean,
    default: false,
  },
  checkable: {
    type: Boolean,
    default: false,
  },
  beforeNavigate: {
    type: Function,
    default: null,
  },
});

const { item } = storeToRefs(useActiveItemStore());
const {
  objective,
  objectivePromise,
  objectiveOwner,
  externalContributors,
  isInheritedObjective,
  hasOwnKeyResult,
} = useObjective(props.objectiveId);

async function activate(event, rootHandler) {
  if (props.beforeNavigate) {
    await props.beforeNavigate(event);
  }
  await rootHandler(event);
}

const card = ref(null);
const isGhost = computed(
  () => objective.value.archived || (isInheritedObjective.value && !hasOwnKeyResult.value)
);

const commonTagProps = {
  size: 'small',
  textStyle: 'normal-text',
  iconName: 'bullseye',
};

defineExpose({ ref: card, isGhost });

await objectivePromise.value;
</script>

<template>
  <RouterLink
    v-if="objective"
    v-slot="{ href, navigate, isExactActive }"
    :to="{ name: 'ObjectiveHome', params: { objectiveId: objective.id } }"
    custom
  >
    <a
      ref="card"
      :class="[
        'objective-link-card',
        {
          'objective-link-card--active': isExactActive || active,
          'objective-link-card--checked': checked,
          'objective-link-card--dashed': props.dashed || isGhost,
          'objective-link-card--dimmed': dimmed,
        },
      ]"
      :href="href"
      v-bind="$attrs"
      @click="activate($event, navigate)"
    >
      <div class="objective-link-card__inner">
        <div class="objective-link-card__heading">
          <PktCheckbox
            v-if="checkable"
            :id="`check_${objective.id}`"
            class="objective-link-card__checkbox"
            :default-checked="checked"
            @click.stop="$emit('toggle', $event.target.checked)"
          />
          <div class="objective-link-card__title">
            <PktTag v-if="isInheritedObjective" v-bind="commonTagProps" skin="blue-light">
              {{ $t('general.objectiveBy', { owner: objectiveOwner.name }) }}
            </PktTag>
            <PktTag
              v-else
              v-bind="commonTagProps"
              :skin="isExactActive || active ? 'blue-light' : 'grey'"
            >
              {{ $t('general.objective') }}
            </PktTag>
          </div>
        </div>

        <span class="objective-link-card__name pkt-txt-14">
          {{ objective.name }}
        </span>

        <div class="objective-link-card__footer">
          <ProgressBar :progression="objective.progression" compact />

          <div class="objective-link-card__tags pkt-txt-12-light">
            <template v-if="externalContributors.length">
              <ItemTag v-if="hasOwnKeyResult" :item="item" />
              <ItemTag v-for="c in externalContributors" :key="c.id" :item="c" />
            </template>
          </div>
        </div>
      </div>
    </a>
  </RouterLink>
</template>

<style lang="scss" scoped>
.objective-link-card {
  display: block;
  color: var(--color-text);
  text-decoration: none;
  background-color: var(--color-white);
  border: 2px solid rgba(42, 40, 89, 0.25); // blue-dark, 25%
  cursor: pointer;

  &:hover {
    color: var(--color-hover);
  }

  &__inner {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    height: 100%;
    padding: 0.75rem 1rem;
  }

  &__heading {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    height: 1.25rem;
    white-space: nowrap;

    :deep(.pkt-input-check__input-checkbox) {
      width: 1.25rem;
      height: 1.25rem;
    }
  }

  &__title {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    color: var(--color-grayscale-60);
    line-height: 0.75rem;
    --fg-color: var(--color-grayscale-60);

    :deep(.pkt-tag) {
      font-size: 0.75rem;
    }
    :deep(.pkt-tag__icon) {
      margin-right: 0.25rem;
    }
  }

  &__name {
    text-wrap: balance;
  }

  &__footer {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    white-space: nowrap;
  }

  &--active,
  &--checked {
    color: var(--color-hover);
    border: 2px solid var(--color-hover);
    transition: all 0.15s ease-in;
  }
  &--active {
    background-color: var(--color-blue-5);
  }
  &--dashed {
    border-style: dashed;
  }
  &--dimmed {
    border-color: rgba(42, 40, 89, 0.15); // blue-dark, 15%;

    > * {
      opacity: 0.5;
    }
  }
}

.objective-link-card__tags {
  display: flex;
  gap: 0.75rem;
  height: 0.75rem;
  margin-left: auto;
  line-height: 0.75rem;
}
</style>
