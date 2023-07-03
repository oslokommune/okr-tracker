<template>
  <page-layout :breakpoint="activeOrganization ? 'tablet-big' : 'phablet'">
    <template v-if="activeOrganization" #header>
      <pkt-button
        size="small"
        skin="secondary"
        variant="icon-left"
        icon-name="chevron-left"
        :text="$t('home.changeOrganization')"
        @onClick="setActiveOrganization(null)"
      />
    </template>

    <template #default>
      <div
        :class="[
          'home-page',
          activeOrganization ? null : ['mt-size-32', 'mt-size-64--tablet-up'],
        ]"
      >
        <template v-if="!activeOrganization">
          <div>
            <h1 class="home-page__title">
              {{ $t('home.welcome', { appName: $t('general.appName') }) }}
            </h1>
            <span class="pkt-txt-20">{{ appOwner }}</span>
          </div>

          <div v-if="organizations.length" class="home-page__organizations">
            <pkt-linkcard
              v-for="organization in sortItemsByName(organizations)"
              :key="organization.id"
              href="#"
              :title="organization.name"
              skin="normal"
              icon-name="organization"
              @click.native="setActiveOrganization(organization.id)"
            >
              {{ organization.missionStatement }}
            </pkt-linkcard>
          </div>
        </template>

        <template v-else>
          <router-link
            :to="{ name: 'ItemHome', params: { slug: activeOrganization.slug } }"
            class="home-page__title pkt-link"
          >
            <pkt-icon name="chevron-right" class="pkt-link__icon" />
            {{ activeOrganization.name }}
          </router-link>
          <p
            v-if="activeOrganization.missionStatement"
            :class="[
              'home-page__text',
              'mb-size-16',
              'mx-size-0',
              'mx-size-104--tablet-big-up',
            ]"
          >
            {{ activeOrganization.missionStatement }}
          </p>

          <div class="home-page__departments pkt-grid">
            <div
              v-for="department in sortItemsByName(organizationChildren)"
              :key="department.id"
              :class="[
                'pkt-cell',
                'pkt-cell--span12',
                'pkt-cell--span6-phablet-up',
                'pkt-cell--span4-laptop-up',
              ]"
            >
              <div>
                <router-link
                  v-slot="{ href }"
                  :to="{ name: 'ItemHome', params: { slug: department.slug } }"
                  custom
                >
                  <pkt-linkcard
                    :href="href"
                    :title="department.name"
                    skin="normal"
                    icon-name="chevron-right"
                  />
                </router-link>
                <div
                  v-if="department.children.length"
                  class="home-page__products py-size-20 px-size-32"
                >
                  <router-link
                    v-for="product in sortItemsByName(department.children)"
                    :key="product.id"
                    :to="{ name: 'ItemHome', params: { slug: product.slug } }"
                    class="pkt-link"
                  >
                    <pkt-icon class="pkt-link__icon" name="chevron-right" />
                    {{ product.name }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>

    <template #footer>
      <buildings-graphic class="home-page__graphic" skin="success" />
    </template>
  </page-layout>
</template>

<script>
import i18n from '@/locale/i18n';
import { mapGetters, mapState, mapActions } from 'vuex';
import { PktButton, PktLinkcard } from '@oslokommune/punkt-vue2';
import BuildingsGraphic from '@/components/graphics/BuildingsGraphic.vue';

export default {
  name: 'Home',

  components: {
    BuildingsGraphic,
    PktButton,
    PktLinkcard,
  },

  computed: {
    ...mapState(['organizations']),
    ...mapGetters(['tree', 'activeOrganization']),

    appOwner() {
      return import.meta.env.VITE_ORGANIZATION;
    },

    organizationChildren() {
      return (
        this.tree.find((org) => org.id === this.activeOrganization.id)?.children || []
      );
    },
  },

  methods: {
    ...mapActions(['setActiveOrganization']),

    sortItemsByName(items) {
      return items.slice().sort((a, b) => a.name.localeCompare(b.name, i18n.locale));
    },
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;
@use '@oslokommune/punkt-css/dist/scss/abstracts/variables';

.page {
  background-color: var(--color-blue-light);

  ::v-deep .page__container {
    // Use same padding for the container as Punkt grid gap.
    // https://github.com/oslokommune/punkt/blob/main/packages/css/src/scss/base/_grid.scss
    padding: 1rem;

    @include bp('tablet-up') {
      padding: 0 2rem;
    }
  }
}

.home-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  text-align: center;

  @include bp('tablet-up') {
    gap: 1.5rem;
  }

  &__title {
    @include get-text('pkt-txt-28-medium');

    @include bp('tablet-up') {
      @include get-text('pkt-txt-30-medium');
    }

    @include bp('laptop-up') {
      @include get-text('pkt-txt-36-medium');
    }
  }

  &__text {
    @include get-text('pkt-txt-16');

    @include bp('tablet-up') {
      @include get-text('pkt-txt-18');
    }
  }

  &__organizations {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  &__departments {
    ::v-deep .pkt-linkcard {
      height: 100%;
    }
  }

  &__products {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .pkt-link {
      @include get-text('pkt-txt-18-medium');

      .pkt-link__icon {
        width: 1.125rem;
        height: 1.125rem;
      }
    }
  }

  &__graphic {
    display: block;
  }
}

.pkt-link {
  text-decoration: none;

  &.pkt-txt-40-medium {
    .pkt-link__icon {
      width: 2.5rem;
      height: 2.5rem;
    }
  }
}

::v-deep .pkt-linkcard {
  width: 100%;
  padding: map.get(variables.$spacing, 'size-16');
  background-color: var(--color-white);

  &__title {
    @include get-text('pkt-txt-18-medium');
    margin-bottom: 0;

    @include bp('laptop-up') {
      @include get-text('pkt-txt-20-medium');
    }
  }

  &__text:not(:empty) {
    margin-top: 0.5rem;
  }

  .pkt-link__icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}
</style>
