<script setup>
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import { useTrackerStore } from '@/store/tracker';
import { useActiveOrganizationStore } from '@/store/activeOrganization';
import BuildingsGraphic from '@/components/graphics/BuildingsGraphic.vue';
import OrganizationCard from '@/components/Navigation/header/OrganizationCard.vue';
import ItemLinkCard from '@/components/ItemLinkCard.vue';

const i18n = useI18n();

const { owner, organizations } = storeToRefs(useTrackerStore());
const activeOrganizationStore = useActiveOrganizationStore();
const { organization, organizationTree } = storeToRefs(activeOrganizationStore);

useHead({ title: () => organization.value?.name });

function sortByLocale(arr) {
  return arr.sort((a, b) =>
    a.name.trim().toUpperCase().localeCompare(b.name.trim().toUpperCase(), i18n.locale)
  );
}
</script>

<template>
  <PageLayout :breakpoint="organization ? 'tablet-big' : 'phablet'">
    <template v-if="organization" #header>
      <OrganizationCard />
    </template>

    <template #default>
      <div class="home-page">
        <template v-if="!organization">
          <div class="home-page__title">
            <h1>
              {{ $t('home.welcome', { appName: $t('general.appName') }) }}
            </h1>
            <span v-if="owner">{{ owner }}</span>
          </div>

          <div v-if="organizations.length" class="home-page__organizations">
            <ItemLinkCard
              v-for="item in sortByLocale(organizations)"
              :key="item.id"
              :title="item.name"
              :text="item.missionStatement"
              icon-name="organization"
              size="medium"
              @click="activeOrganizationStore.setOrganization(item.id)"
            />
          </div>
        </template>

        <template v-else>
          <div class="home-page__organization">
            <ItemLinkCard
              :route="{ name: 'ItemHome', params: { slug: organization.slug } }"
              :title="organization.name"
              size="large"
              centered
            />
            <p>{{ organization.missionStatement }}</p>
          </div>

          <div
            v-if="organizationTree && organizationTree.children.length"
            class="pkt-grid"
          >
            <div
              v-for="department in sortByLocale(organizationTree.children)"
              :key="department.id"
              :class="[
                'pkt-cell',
                'pkt-cell--span12',
                'pkt-cell--span6-phablet-up',
                'pkt-cell--span4-laptop-up',
              ]"
            >
              <div>
                <ItemLinkCard
                  :route="{ name: 'ItemHome', params: { slug: department.slug } }"
                  :title="department.name"
                  size="medium"
                />

                <div
                  v-if="department.children.length"
                  class="py-size-8 px-size-16--tablet-up"
                >
                  <ItemLinkCard
                    v-for="product in sortByLocale(department.children)"
                    :key="product.id"
                    :route="{ name: 'ItemHome', params: { slug: product.slug } }"
                    :title="product.name"
                    transparent
                  />
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>

    <template #footer>
      <BuildingsGraphic class="home-page__graphic" skin="info" />
    </template>
  </PageLayout>
</template>

<style lang="scss" scoped>
@use 'sass:map';
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;
@use '@oslokommune/punkt-css/dist/scss/abstracts/variables';

.page {
  background-color: var(--color-blue-light);

  :deep(.page__header) {
    padding-bottom: 0;
  }

  :deep(.page__container) {
    padding: 1.5rem 1rem;

    @include bp('tablet-up') {
      padding: 3rem;
    }
  }
}

.home-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;

  @include bp('tablet-up') {
    gap: 2rem;
  }

  &__title {
    text-align: center;

    h1 {
      margin-bottom: 0.5rem;

      @include get-text('pkt-txt-20-medium');

      @include bp('phablet-up') {
        @include get-text('pkt-txt-28-medium');
      }

      @include bp('tablet-up') {
        @include get-text('pkt-txt-30-medium');
      }
    }

    span {
      @include get-text('pkt-txt-16');

      @include bp('phablet-up') {
        @include get-text('pkt-txt-20');
      }
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

  &__organization {
    @include bp('phablet-up') {
      width: 80%;
      margin-bottom: 1rem;
    }

    @include bp('tablet-up') {
      width: 60%;
    }

    p {
      @include get-text('pkt-txt-14');
      margin-top: 1rem;
      text-align: center;

      @include bp('phablet-up') {
        @include get-text('pkt-txt-16');
      }
    }
  }
}

.organization-card {
  margin: -0.5rem -0.45rem 0 -0.45rem;
  background-color: var(--pkt-color-surface-subtle-light-blue);

  @include bp('phablet-up') {
    width: 20rem;
  }
}
</style>
