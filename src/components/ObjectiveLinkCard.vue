<template>
  <router-link
    v-slot="{ href, navigate, isExactActive }"
    :to="{ name: 'ObjectiveHome', params: { objectiveId: objective.id } }"
    custom
  >
    <a
      :class="[
        'objective-link-card',
        {
          'objective-link-card--active': isExactActive || active,
          'objective-link-card--checked': checked,
        },
      ]"
      :href="href"
      @click="activate($event, navigate)"
    >
      <div class="objective-link-card__inner">
        <div class="objective-link-card__heading">
          <input
            v-if="checkable"
            type="checkbox"
            class="pkt-form-check-input"
            :checked="checked"
            @click.stop="$emit('toggle', $event.target.checked)"
          />
          <pkt-tag
            v-if="objectiveOwner"
            text-style="normal-text"
            skin="yellow"
            size="small"
            class="objective-link-card__owner"
          >
            {{ objectiveOwner.name }}
          </pkt-tag>

          <ul class="objective-link-card__tags">
            <li
              v-for="c in contributors"
              :key="c.id"
              v-tooltip="c.name"
              :class="[
                'objective-link-card__tag',
                'pkt-txt-12-bold',
                `objective-link-card__tag--${contributorTagMode(c.name)}`,
              ]"
              :style="{ background: contributorTagColor(c.name) }"
            >
              <span>{{ c.name[0] }}</span>
            </li>
          </ul>
        </div>

        <span class="objective-link-card__title pkt-txt-14">
          {{ objective.name }}
        </span>

        <progress-bar :progression="objective.progression" />
      </div>
    </a>
  </router-link>
</template>

<script>
import getActiveItemType from '@/util/getActiveItemType';
import { PktTag } from '@oslokommune/punkt-vue2';
import ProgressBar from '@/components/ProgressBar.vue';
import { contributorTagColor, contributorTagMode } from '@/util/okr';
import { db } from '@/config/firebaseConfig';
import { uniqueBy } from '@/util';

export default {
  name: 'ObjectiveLinkCard',

  components: {
    ProgressBar,
    PktTag,
  },

  props: {
    objective: {
      type: Object,
      required: true,
    },
    active: {
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
  },

  data: () => ({
    keyResults: [],
    objectiveOwner: null,
  }),

  computed: {
    /**
     * Return a list of unique contributors to the key results in
     * `this.keyResults`.
     */
    contributors() {
      return uniqueBy(
        this.keyResults.map((kr) => kr.parent).filter((item) => item.name),
        'id'
      );
    },
  },

  async created() {
    if (this.objective === null) {
      return;
    }

    const objectiveRef = await db.doc(`objectives/${this.objective.id}`);
    const keyResults = await db
      .collection('keyResults')
      .where('archived', '==', false)
      .where('objective', '==', objectiveRef)
      .orderBy('name');
    this.$bind('keyResults', keyResults);

    if (typeof this.objective.parent === 'string') {
      this.$bind('objectiveOwner', db.doc(this.objective.parent));
    } else {
      const parentType = getActiveItemType(this.objective.parent);
      this.$bind(
        'objectiveOwner',
        db.collection(`${parentType}s`).doc(this.objective.parent.id)
      );
    }
  },

  methods: {
    contributorTagColor,
    contributorTagMode,

    async activate(event, rootHandler) {
      if (this.beforeNavigate) {
        await this.beforeNavigate(event);
      }

      await rootHandler(event);
    },
  },
};
</script>

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
    padding: 1rem;
  }

  &__heading {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: space-between;
    white-space: nowrap;
  }

  &__title {
    text-wrap: balance;
  }

  &--active,
  &--checked {
    color: var(--color-hover);
    border: 2px solid var(--color-hover);
  }
  &--active {
    background-color: var(--color-blue-5);
  }
}

.objective-link-card__tags {
  display: flex;
  flex: 1 0 auto;
  gap: 0.25rem;
  justify-content: flex-end;
}

.objective-link-card__tag {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
}

.objective-link-card__tag--light {
  color: rgba(0, 0, 0, 0.6);
}

.objective-link-card__tag--dark {
  color: var(--color-white);
}
</style>
