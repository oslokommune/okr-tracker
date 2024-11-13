<script setup>
import { computed, ref, watch, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/store/auth';
import { useActiveItemStore } from '@/store/activeItem';
import { useKpisStore } from '@/store/kpis';
import { useActiveKpiStore } from '@/store/activeKpi';
import { PktButton } from '@oslokommune/punkt-vue';
import EmptyPage from '@/components/pages/EmptyPage.vue';
import KpiDetails from '@/components/KpiDetails.vue';
import KpiDrawer from '@/components/drawers/KpiDrawer.vue';
import KpiWidgetGroup from '@/components/KpiWidgetGroup.vue';
import NotFoundPage from '@/components/pages/NotFoundPage.vue';
import FadeTransition from '@/components/generic/transitions/FadeTransition.vue';

const router = useRouter();
const route = useRoute();
const i18n = useI18n();

const { hasEditRights } = storeToRefs(useAuthStore());
const { item } = storeToRefs(useActiveItemStore());
const { kpis, isLoading } = storeToRefs(useKpisStore());
const { kpiId, kpi, isLoading: kpiIsLoading } = storeToRefs(useActiveKpiStore());

const page = ref(null);
const hasInitialLoad = ref(false);
const showKpiDetails = computed(
  () => !!kpiId.value && route.query?.view !== 'list' && hasInitialLoad.value
);
const showKpiDrawer = ref(false);
const drawerEditMode = ref(false);

watchEffect(() => {
  // Ensure that an initial KPI has started loading before showing details
  if (kpiIsLoading.value && !hasInitialLoad.value) {
    hasInitialLoad.value = true;
  }
});

watch(route, () => {
  page.value.scrollIntoView();
});

const kpiGroups = computed(() => {
  return [
    {
      title: i18n.t('general.resultIndicator'),
      kpis: kpis.value.filter(({ kpiType }) => kpiType === 'ri'),
    },
    {
      title: i18n.t('general.keyFigures'),
      kpis: kpis.value.filter(({ kpiType }) => kpiType === 'keyfig'),
    },
    {
      title: i18n.t('general.otherMeasurements'),
      kpis: kpis.value.filter(({ kpiType }) => !kpiType || kpiType === 'plain'),
    },
  ];
});

function openKpiDrawer(edit) {
  drawerEditMode.value = edit;
  showKpiDrawer.value = true;
}

function kpiCreated(newKpi) {
  const { params, query } = router.currentRoute.value;
  router.push({
    name: 'ItemMeasurements',
    params: { ...params, kpiId: newKpi.id },
    query,
  });
}
</script>

<template>
  <div ref="page" class="measurements-page">
    <div v-if="kpis.length" class="measurements-page__header">
      <h1 class="pkt-txt-16-medium pkt-hide-phablet-up">
        {{ $t('general.KPIs') }}
      </h1>
      <h1 class="pkt-txt-18-medium pkt-show-phablet-up pkt-hide-tablet-up">
        {{ $t('general.KPIs') }}
      </h1>
      <h1 class="pkt-txt-18-medium pkt-show-tablet-up">
        {{ $t('general.KPIsLong', { name: item.name }) }}
      </h1>
    </div>

    <div v-if="hasEditRights && kpis.length" class="measurements-page__actions">
      <PktButton
        :text="$t('general.KPI')"
        :aria-label="$t('admin.measurement.new')"
        skin="primary"
        size="small"
        variant="icon-left"
        icon-name="plus-sign"
        @on-click="openKpiDrawer(false)"
      />
    </div>

    <PageLayout
      v-if="kpis.length"
      :breakpoint="showKpiDetails ? 'desktop' : 'tablet-big'"
      sidebar-position="left"
      :sidebar-cols="showKpiDetails ? 3 : 12"
      :sidebar-grid="showKpiDetails"
    >
      <template #sidebar>
        <template v-for="(group, index) in kpiGroups">
          <KpiWidgetGroup
            v-if="group.kpis.length > 0"
            v-bind="group"
            :key="`kpi-group-${index}`"
            :compact="showKpiDetails"
          />
        </template>
      </template>

      <template v-if="showKpiDetails" #default>
        <div class="measurements-page__details">
          <FadeTransition>
            <KpiDetails v-if="kpi" @edit-kpi="openKpiDrawer(true)" />
            <NotFoundPage
              v-else-if="!kpiIsLoading && !kpi"
              :heading="$t('notFound.measurementHeading')"
              :body="$t('notFound.measurementBody')"
            />
          </FadeTransition>
        </div>
      </template>
    </PageLayout>

    <EmptyPage
      v-else-if="!isLoading"
      :heading="$t('empty.noKPIs.heading')"
      :body="$t(hasEditRights ? 'empty.noKPIs.adminBody' : 'empty.noKPIs.body')"
    >
      <div v-if="hasEditRights" data-mode="dark">
        <PktButton
          :text="$t('empty.noKPIs.buttonText')"
          skin="primary"
          variant="icon-left"
          icon-name="plus-sign"
          @on-click="openKpiDrawer(false)"
        />
      </div>
    </EmptyPage>

    <KpiDrawer
      v-if="hasEditRights && showKpiDrawer"
      :kpi-id="drawerEditMode ? kpi.id : null"
      @create="kpiCreated"
      @close="showKpiDrawer = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.measurements-page {
  position: relative;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;

  &__header {
    padding: 0 1.5rem;

    h1 {
      line-height: 4.25rem;
    }
  }

  &__actions {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    gap: 0.5rem;
  }

  &__details {
    @include bp('laptop-up') {
      margin-left: 3rem;
    }
  }
}
</style>
