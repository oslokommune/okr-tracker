<template>
  <main class="centered-container">
    <section class="item-info">
      <div
        v-if="activeItem.missionStatement || activeItem.targetAudience"
        class="item-info__group"
      >
        <h4 class="title-4">{{ aboutItemTitle }}</h4>

        <div class="item-info__content">
          <div v-if="activeItem.missionStatement" class="item-info__box">
            <h3 class="title-2"><icon-hands-globe />{{ $t('document.mission') }}</h3>
            <HTML-output :html="activeItem.missionStatement" />
          </div>

          <div v-if="activeItem.targetAudience" class="item-info__box">
            <h3 class="title-2">
              <icon-two-people-dancing />{{ $t('dashboard.targetAudience') }}
            </h3>
            <HTML-output :html="activeItem.targetAudience" />
          </div>
        </div>
      </div>

      <div class="item-info__group">
        <h4 class="title-4">{{ childrenTitle }}</h4>

        <div class="item-info__content item-info__content--grid">
          <div
            v-for="child in children"
            :key="child.id"
            class="item-info__box item-info__box--link"
          >
            <h3 class="title-2">{{ child.name }}</h3>
            <HTML-output :html="child.missionStatement" />
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import { mapState } from 'vuex';
import IconTwoPeopleDancing from '@/components/IconTwoPeopleDancing.vue';
import IconHandsGlobe from '@/components/IconHandsGlobe.vue';
import HTMLOutput from '@/components/HTMLOutput.vue';
import getActiveItemType from '@/util/getActiveItemType';

export default {
  name: 'ItemAbout',

  components: {
    IconHandsGlobe,
    IconTwoPeopleDancing,
    HTMLOutput,
  },

  data: () => ({
    aboutItemTitle: null,
    childrenTitle: null,
    children: [],
  }),

  computed: {
    ...mapState(['activeItem', 'departments', 'products']),
  },

  watch: {
    activeItem: {
      immediate: true,
      handler(item) {
        const itemType = getActiveItemType(item);

        if (itemType === 'organization') {
          this.aboutItemTitle = this.$t('about.aboutOrganization');
          this.childrenTitle = this.$t('general.departments');
          this.children = this.departments.filter(
            (department) => department.organization.id === this.activeItem.id
          );
        } else if (itemType === 'department') {
          this.aboutItemTitle = this.$t('about.aboutDepartment');
          this.childrenTitle = this.$t('general.products');
          this.children = this.products.filter(
            (product) => product.department.id === this.activeItem.id
          );
        } else if (itemType === 'product') {
          this.aboutItemTitle = this.$t('about.aboutProduct');
          this.childrenTitle = null;
          this.children = null;
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.item-info {
  overflow: auto;
  background-color: var(--color-white);
  padding: 2rem 1rem;

  &__group {
    &:not(:first-of-type) {
      margin-top: 4rem;
    }

    .title-4 {
      padding: 0 0.5rem;
      margin-bottom: 1rem;
      color: var(--color-grayscale-40);
    }
  }

  &__content {
    display: flex;
    gap: 2rem;
    flex-direction: column;

    @media screen and (min-width: bp(m)) {
      flex-direction: row;

      &--grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }

  &__box {
    flex: 1 1 0px;
    font-size: typography.$font-size-2;
    line-height: 1.5rem;
    padding: 0.5rem;

    .title-2 {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      color: var(--color-blue-dark);

      svg {
        margin-right: 0.75rem;
      }
    }
  }
}
</style>
