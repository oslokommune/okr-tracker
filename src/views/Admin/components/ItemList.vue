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
  <div class="item-list">
    <h2 class="item-list__title">{{ $t(templateConfig.title) }}</h2>

    <div class="item-list__body">
      <div v-if="items.length > 10">
        <input
          v-model="itemQuery"
          class="pkt-input pkt-input--fullwidth"
          type="text"
          :placeholder="$t(templateConfig.queryPlaceholder, { count: items.length })"
        />
      </div>

      <div class="item-list__list">
        <template v-for="{ item } in searchResults" :key="item.id">
          <RouterLink
            v-if="!item.archived"
            class="item-list__link pkt-txt-16-medium"
            :to="itemRoute(item.slug)"
          >
            <PktIcon :name="templateConfig.itemIcon" />
            <span>{{ item.name }}</span>
            <PktIcon name="chevron-right" />
          </RouterLink>

          <div
            v-else
            class="item-list__link pkt-txt-16-medium"
            @click="selectedItem = item"
          >
            <PktIcon :name="templateConfig.itemIcon" />
            <span>{{ item.name }}</span>
            <PktIcon name="archive" />
          </div>
        </template>
      </div>

      <div v-if="canCreateItem" class="item-list__footer">
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
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.item-list {
  &__title {
    @include get-text('pkt-txt-18-medium');
    margin-bottom: 0.75rem;

    @include bp('tablet-up') {
      @include get-text('pkt-txt-20-medium');
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    height: 32rem;
    background: var(--color-gray-light);
  }

  &__list {
    flex: 1;
    overflow: auto;
  }

  &__link {
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

    .pkt-icon {
      height: 1rem;
    }

    span {
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  &__footer {
    margin-top: auto;
    padding: 1rem;

    .pkt-btn {
      justify-content: center;
      width: 100%;
    }
  }
}
</style>
