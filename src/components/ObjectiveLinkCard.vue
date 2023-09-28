<template>
  <router-link v-slot="{ href, navigate, isExactActive }" :to="route" custom>
    <a
      :class="[
        'objective-link-card',
        {
          'objective-link-card--active': isExactActive || active,
          'objective-link-card--checked': checked,
          'objective-link-card--compact': compact,
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
            text-style="normal-text"
            skin="yellow"
            size="small"
            class="objective-link-card__owner"
          >
            <template v-if="keyResult">
              {{ keyResult.parent.name }}
            </template>
            <template v-else>
              {{ activeItem.name }}
            </template>
          </pkt-tag>

          <ul class="objective-link-card__tags">
            <li
              v-for="c in contributors"
              :key="c.id"
              v-tooltip="c.name"
              :class="[
                'objective-link-card__tag',
                'pkt-txt-12-medium',
                `objective-link-card__tag--${contributorTagMode(c.name)}`,
              ]"
              :style="{ background: contributorTagColor(c.name) }"
            >
              <span>{{ c.name[0] }}</span>
            </li>
          </ul>
        </div>

        <span class="objective-link-card__title pkt-txt-14">
          {{ title }}
        </span>

        <progress-bar :progression="progression" :compact="compact" />
      </div>
    </a>
  </router-link>
</template>

<script>
import { mapState } from 'vuex';
import { PktTag } from '@oslokommune/punkt-vue2';
import CONTRIBUTOR_TAG_COLORS from '@/config/colors';
import ProgressBar from '@/components/ProgressBar.vue';
import simpleHash from '@/util/hash';
import { db } from '@/config/firebaseConfig';
import { uniqueBy } from '@/util';

export default {
  name: 'ObjectiveLinkCard',

  components: {
    ProgressBar,
    PktTag,
  },

  props: {
    route: {
      type: Object,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    progression: {
      type: Number,
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
    compact: {
      type: Boolean,
      default: false,
    },
    beforeNavigate: {
      type: Function,
      default: null,
    },
    afterNavigate: {
      type: Function,
      default: null,
    },
    objectiveId: {
      type: String,
      required: false,
      default: null,
    },
    keyResult: {
      type: Object,
      required: false,
      default: null,
    },
  },

  data: () => ({
    keyResults: [],
  }),

  computed: {
    ...mapState(['activeItem']),

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
    if (this.objectiveId !== null) {
      const objectiveRef = await db.doc(`objectives/${this.objectiveId}`);
      const keyResults = await db
        .collection('keyResults')
        .where('archived', '==', false)
        .where('objective', '==', objectiveRef)
        .orderBy('name');

      this.$bind('keyResults', keyResults);
    }
  },

  methods: {
    async activate(event, rootHandler) {
      if (this.beforeNavigate) {
        await this.beforeNavigate(event);
      }

      await rootHandler(event);

      if (this.afterNavigate) {
        await this.afterNavigate(event);
      }
    },

    /**
     * Return the color to use for the contributor tag of the
     * organization/department/product called `name`.
     */
    contributorTagColor(name) {
      const c = CONTRIBUTOR_TAG_COLORS[simpleHash(name) % CONTRIBUTOR_TAG_COLORS.length];
      return `var(--${c.name})`;
    },

    /**
     * Return the color mode to use for the contributor tag of the
     * organization/department/product called `name`.
     */
    contributorTagMode(name) {
      const c = CONTRIBUTOR_TAG_COLORS[simpleHash(name) % CONTRIBUTOR_TAG_COLORS.length];
      return c.mode;
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

  &__header {
    display: flex;
    gap: 0.5rem;
    align-items: center;
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

.objective-link-card__heading {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
}

.objective-link-card__tags {
  display: flex;
  gap: 0.25rem;
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
