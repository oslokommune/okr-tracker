<script setup>
import { computed, inject } from 'vue';

const props = defineProps({
  organizations: {
    type: Array,
    required: false,
    default: () => [],
  },
  departments: {
    type: Array,
    required: false,
    default: () => [],
  },
  products: {
    type: Array,
    required: false,
    default: () => [],
  },
});

const membershipGroups = computed(() =>
  [
    {
      id: 'organizations',
      items: props.organizations,
    },
    {
      id: 'departments',
      items: props.departments,
    },
    {
      id: 'products',
      items: props.products,
    },
  ].filter((g) => g.items.length > 0)
);

function sortItems(items) {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

function icon(type) {
  switch (type) {
    case 'products':
      return 'house-heart';
    case 'departments':
      return 'district';
    default:
      return 'organization';
  }
}

const closeParent = inject('closeNavMenuDropdown', false);

function wrapNavigate(handler, event) {
  if (closeParent) {
    closeParent();
  }
  handler(event);
}
</script>

<template>
  <div class="user-memberships">
    <div
      v-for="group in membershipGroups"
      :key="group.id"
      class="user-memberships__group"
    >
      <h3 class="title-3">{{ $t(`general.${group.id}`) }}</h3>
      <ul>
        <li v-for="{ id, slug, name } in sortItems(group.items)" :key="id">
          <RouterLink
            v-slot="{ href, navigate }"
            :to="{ name: 'ItemHome', params: { slug } }"
            custom
          >
            <a
              :href="href"
              class="pkt-link pkt-link--icon-left"
              tabindex="0"
              @click="wrapNavigate(navigate, $event)"
            >
              <PktIcon class="pkt-link__icon" :name="icon(group.id)" />
              {{ name }}
            </a>
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.user-memberships {
  display: flex;
  flex-direction: column;
  @include get-text('pkt-txt-14');

  &__group {
    margin-bottom: 1.5rem;

    li {
      padding: 0.15rem;
    }
  }

  .pkt-link__icon {
    width: 0.5rem;
    height: 0.5rem;
  }
}
</style>
