<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useFuse } from '@vueuse/integrations/useFuse';
import { useAuthStore } from '@/store/auth';
import { useAdminStore } from '@/store/admin';
import ArchivedItemModal from './ArchivedItemModal.vue';

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

const { isSuperAdmin } = storeToRefs(useAuthStore());
const { organizations, departments, products } = storeToRefs(useAdminStore());

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

const items = computed(() => {
  let _items = [];
  if (props.collection === 'organizations') {
    _items = organizations.value;
  } else if (props.collection === 'departments') {
    _items = departments.value;
  } else if (props.collection === 'products') {
    _items = products.value;
  }
  return _items.filter(
    (i) => i.slug && [false, props.includeArchived].includes(i.archived)
  );
});

const selectedItem = ref(null);
const itemQuery = ref('');

const { results: searchResults } = useFuse(itemQuery, items, {
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

const canCreateItem = computed(
  () => isSuperAdmin.value || props.collection !== 'organizations'
);

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
      <div v-if="items.length > 3" class="search">
        <input
          v-model="itemQuery"
          class="pkt-input pkt-input--fullwidth"
          type="text"
          :placeholder="$t(templateConfig.queryPlaceholder, { count: items.length })"
        />
      </div>

      <div class="col__body">
        <div v-for="{ item } in searchResults" :key="item.id" class="col__row">
          <RouterLink
            v-if="!item.archived"
            class="col__link pkt-txt-16-medium"
            :to="itemRoute(item.slug)"
          >
            <PktIcon class="icon" :name="templateConfig.itemIcon" />
            <span class="col__text">{{ item.name }}</span>
            <PktIcon class="icon" name="chevron-right" />
          </RouterLink>

          <div v-else class="col__link pkt-txt-16-medium" @click="selectedItem = item">
            <PktIcon class="icon" :name="templateConfig.itemIcon" />
            <span class="col__text">{{ item.name }}</span>
            <PktIcon class="icon" name="archive" />
          </div>
        </div>
      </div>

      <div v-if="canCreateItem" class="col__footer">
        <RouterLink
          class="pkt-btn pkt-btn--secondary pkt-btn--icon-left"
          :to="templateConfig.createRoute"
        >
          <PktIcon name="plus-sign" class="pkt-btn__icon pkt-show-tablet-big-up" />
          <span class="pkt-btn__text">{{ $t(templateConfig.createLabel) }}</span>
        </RouterLink>
      </div>
    </div>

    <ArchivedItemModal
      v-if="!!selectedItem"
      :item="selectedItem"
      @close="selectedItem = null"
    />
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
  cursor: pointer;

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
