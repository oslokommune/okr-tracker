<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  possibleDevelopers,
  possibleAdm,
  possibleDesigners,
  displayOrder,
} from '@/config/jobPositions';
import { useActiveOrganizationStore } from '@/store/activeOrganization';
import { useActiveItemStore } from '@/store/activeItem';
import { useAuthStore } from '@/store/auth';
import { PktButton } from '@oslokommune/punkt-vue';
import HTMLOutput from '@/components/HTMLOutput.vue';
import ItemDrawer from '@/components/drawers/ItemDrawer.vue';
import ProfileModal from '@/components/modals/ProfileModal.vue';
import RoleMembers from '@/components/RoleMembers.vue';

const router = useRouter();
const route = useRoute();
const i18n = useI18n();

const { organizationTree } = storeToRefs(useActiveOrganizationStore());
const { item, isDepartment, isOrganization } = storeToRefs(useActiveItemStore());
const { hasEditRights, isMemberOfCurrentItemOrganization } = storeToRefs(useAuthStore());

const showItemDrawer = ref(false);
const chosenProfileId = ref(null);

const childrenTitle = computed(() => {
  /**
   * Return a fitting title for the list of sub-items under the current item.
   */

  if (isOrganization.value) {
    return i18n.t('about.organizationChildren');
  }
  if (isDepartment.value) {
    return i18n.t('about.departmentChildren');
  }

  return null;
});

const children = computed(() => {
  if (isOrganization.value) {
    return organizationTree.value?.children || [];
  }

  if (isDepartment) {
    return (
      organizationTree.value?.children.find((d) => d.slug === item.value.slug)
        ?.children || []
    );
  }

  return [];
});

const teamMembers = computed(() => {
  const members = {};

  item.value.team.forEach((employee) => {
    if (!employee.position) {
      if (!members.others) {
        members.others = [];
      }
      members.others.push(employee);
    } else if (possibleDevelopers.includes(employee.position)) {
      if (!members.developers) {
        members.developers = [];
      }
      members.developers.push(employee);
    } else if (possibleDesigners.includes(employee.position)) {
      if (!members.designers) {
        members.designers = [];
      }
      members.designers.push(employee);
    } else if (possibleAdm.includes(employee.position)) {
      if (!members.administration) {
        members.administration = [];
      }
      members.administration.push(employee);
    } else {
      if (!members[employee.position]) {
        members[employee.position] = [];
      }
      members[employee.position].push(employee);
    }
  });

  return members;
});

watch(showItemDrawer, (show) => {
  if (!show && route.query.edit) {
    router.replace({ query: null });
  }
});

onMounted(() => {
  showItemDrawer.value = String(route.query.edit).toLowerCase() === 'true';
});

function sortByDisplayOrder(roles) {
  return displayOrder.filter((role) => roles.includes(role));
}
</script>

<template>
  <PageLayout breakpoint="tablet-big" class="about-page">
    <header class="about-page__header">
      <h1 class="pkt-txt-54">{{ item.name }}</h1>
      <PktButton
        v-if="hasEditRights"
        v-tooltip="$t('admin.item.change', { name: item.name })"
        skin="tertiary"
        size="small"
        variant="icon-only"
        icon-name="edit"
        @on-click="showItemDrawer = true"
      />
    </header>

    <section>
      <HTMLOutput class="pkt-txt-24-light" :html="item.missionStatement" />
    </section>

    <section v-if="item.targetAudience">
      <h2 class="pkt-txt-30">{{ $t('dashboard.targetAudience') }}</h2>
      <HTMLOutput class="pkt-txt-18" :html="item.targetAudience" />
    </section>

    <section v-if="children.length">
      <h2 class="pkt-txt-30">{{ childrenTitle }}</h2>
      <div
        v-for="child in children"
        :key="child.id"
        class="item-info__box item-info__box--link"
      >
        <h3 class="pkt-txt-24">{{ child.name }}</h3>
        <HTMLOutput class="pkt-txt-18" :html="child.missionStatement" />
      </div>
    </section>

    <template v-if="hasEditRights || isMemberOfCurrentItemOrganization">
      <h2 class="pkt-txt-30">{{ $t('about.members') }}</h2>
      <RoleMembers
        v-for="role in sortByDisplayOrder(Object.keys(teamMembers))"
        :key="role"
        :role="role"
        :members-with-role="teamMembers[role]"
        @open-modal="chosenProfileId = $event"
      />
    </template>

    <ItemDrawer v-if="hasEditRights && showItemDrawer" @close="showItemDrawer = false" />

    <ProfileModal
      v-if="!!chosenProfileId"
      :user-id="chosenProfileId"
      @close="chosenProfileId = null"
    />
  </PageLayout>
</template>

<style lang="scss" scoped>
.about-page {
  padding: 2rem;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

section {
  margin: 2.75rem 0 3.625rem 0;

  .item-info__box:first-of-type h3 {
    margin-top: 1.5rem;
  }
}

h2 {
  margin: 1.25rem 0;
}

h3 {
  margin: 2rem 0 0.5rem;
}
</style>
