<script setup>
import { computed, ref } from 'vue';
import { useCollection } from 'vuefire';
import { collection, orderBy, query, where } from 'firebase/firestore';
import { storeToRefs } from 'pinia';
import { useFuse } from '@vueuse/integrations/useFuse';
import { db } from '@/config/firebaseConfig';
import { useAuthStore } from '@/store/auth';

const props = defineProps({
  collection: {
    type: String,
    required: true,
    validator: (value) => ['organizations', 'departments', 'products'].includes(value),
  },
  includeArchived: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const { user, isSuperAdmin } = storeToRefs(useAuthStore());

const templateConfig = {
  organizations: {
    title: 'general.organizations',
    queryPlaceholder: 'admin.organization.search',
    createLabel: 'btn.addOrganization',
    itemIcon: 'organization',
    createRoute: { name: 'CreateOrganization' },
  },
  departments: {
    title: 'general.departments',
    queryPlaceholder: 'admin.department.search',
    createLabel: 'btn.addDepartment',
    itemIcon: 'district',
    createRoute: { name: 'CreateDepartment' },
  },
  products: {
    title: 'general.products',
    queryPlaceholder: 'admin.product.search',
    createLabel: 'btn.addProduct',
    itemIcon: 'house-heart',
    createRoute: { name: 'CreateProduct' },
  },
}[props.collection];

const items = useCollection(
  computed(() =>
    query(
      collection(db, props.collection),
      where('archived', 'in', [false, props.includeArchived]),
      orderBy('slug')
    )
  ),
  { ssrKey: `items_${props.collection}` }
);

const filteredItems = computed(() =>
  isSuperAdmin.value
    ? items.value
    : items.value.filter((o) => user.value.admin.includes(o.id))
);

const itemQuery = ref('');

const { results: searchResults } = useFuse(itemQuery, filteredItems, {
  fuseOptions: {
    threshold: 0.5,
    keys: [
      {
        name: 'slug',
        weight: 0.25,
      },
      {
        name: 'name',
        weight: 0.5,
      },
    ],
  },
  matchAllWhenSearchEmpty: true,
});

const itemRoute = (slug) => ({
  name: 'ItemAbout',
  params: { slug },
  query: { edit: true },
});
</script>

<template>
  <div>
    <h2 class="title-2">{{ $t(templateConfig.title) }}</h2>

    <div class="col">
      <div v-if="filteredItems.length > 3" class="search">
        <input
          v-model="itemQuery"
          class="pkt-input pkt-input--fullwidth"
          type="text"
          :placeholder="
            $t(templateConfig.queryPlaceholder, { count: filteredItems.length })
          "
        />
      </div>

      <div class="col__body">
        <div v-for="{ item } in searchResults" :key="item.id" class="col__row">
          <RouterLink class="col__link pkt-txt-16-medium" :to="itemRoute(item.slug)">
            <PktIcon class="icon" :name="templateConfig.itemIcon" />
            <span class="col__text">{{ item.name }}</span>
            <PktIcon v-if="item.archived" class="icon" name="archive" />
          </RouterLink>
        </div>
      </div>

      <div v-if="isSuperAdmin" class="col__footer">
        <RouterLink
          class="pkt-btn pkt-btn--secondary pkt-btn--icon-left"
          :to="templateConfig.createRoute"
        >
          <PktIcon name="plus-sign" class="pkt-btn__icon pkt-show-tablet-big-up" />
          <span class="pkt-btn__text">{{ $t(templateConfig.createLabel) }}</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.col {
  display: flex;
  flex-direction: column;
  height: 32rem;
  background: var(--color-gray-light);
}

.col__body {
  flex: 1;
  overflow: auto;
}

.col__header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: var(--color-grayscale-10);
}

.col__footer {
  margin-top: auto;
  padding: 1rem;

  .pkt-btn {
    justify-content: center;
    width: 100%;
  }
}

.col__link {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem 1rem;
  color: var(--color-text);
  text-decoration: none;
  border-bottom: 2px solid var(--color-border);

  &:hover {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.3em;
  }
}

.col__text {
  flex: 1 0 auto;
}

.icon {
  height: 1rem;
}
</style>
