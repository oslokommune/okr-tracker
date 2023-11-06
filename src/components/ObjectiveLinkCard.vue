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
          <div v-if="checkable" class="pkt-input-check">
            <div class="pkt-input-check__input">
              <input
                type="checkbox"
                class="pkt-input-check__input-checkbox"
                :checked="checked"
                @click.stop="$emit('toggle', $event.target.checked)"
              />
            </div>
          </div>
          <div class="objective-link-card__title pkt-txt-12">
            <pkt-icon name="bullseye" />
            <span v-if="objectiveOwner">
              {{
                $t(isInheritedObjective ? 'general.objectiveBy' : 'general.objective', {
                  owner: objectiveOwner.name,
                })
              }}
            </span>
          </div>
        </div>

        <span class="objective-link-card__name pkt-txt-14">
          {{ objective.name }}
        </span>

        <div class="objective-link-card__footer">
          <progress-bar :progression="objective.progression" compact />

          <div class="objective-link-card__tags pkt-txt-12-light">
            <template v-if="externalContributors.length">
              <template v-if="hasOwnKeyResult">
                <item-tag :item="activeItem" />
                <pkt-icon
                  v-if="hasOwnKeyResult && externalContributors.length"
                  name="plus-sign"
                />
              </template>
              <item-tag v-for="c in externalContributors" :key="c.id" :item="c" />
            </template>
          </div>
        </div>
      </div>
    </a>
  </router-link>
</template>

<script>
import { mapState } from 'vuex';
import getActiveItemType from '@/util/getActiveItemType';
import ProgressBar from '@/components/ProgressBar.vue';
import ItemTag from '@/components/ItemTag.vue';
import { db } from '@/config/firebaseConfig';
import { uniqueBy } from '@/util';

export default {
  name: 'ObjectiveLinkCard',

  components: {
    ProgressBar,
    ItemTag,
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

    /**
     * Return a list of contributors that does not include the current item.
     */
    externalContributors() {
      return this.contributors.filter(({ id }) => id !== this.activeItem.id);
    },

    /**
     * Return `true` if the current objective has another parent than
     * `this.activeItem`.
     */
    isInheritedObjective() {
      return this.objectiveOwner && this.objectiveOwner.id !== this.activeItem.id;
    },

    /**
     * Return true if `this.activeItem` has own key result attached to this
     * objective.
     */
    hasOwnKeyResult() {
      return this.contributors.map((c) => c.id).includes(this.activeItem.id);
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
    padding: 0.75rem 1rem;
  }

  &__heading {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    height: 1.25rem;
    white-space: nowrap;

    .pkt-input-check__input-checkbox {
      width: 1.25rem;
      height: 1.25rem;
    }
  }

  &__title {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    color: var(--color-grayscale-60);
    --fg-color: var(--color-grayscale-60);
    line-height: 0.75rem;
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
  }
  &--active {
    background-color: var(--color-blue-5);
  }
}

.objective-link-card__tags {
  display: flex;
  gap: 0.75rem;
  height: 0.75rem;
  margin-left: auto;
  line-height: 0.75rem;

  .pkt-icon {
    width: 0.75rem;
    height: 0.75rem;
    --fg-color: var(--color-grayscale-60);

    &,
    ::v-deep > svg {
      min-width: auto;
      min-height: auto;
    }
  }
}
</style>
