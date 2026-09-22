<script setup>
import { useLocalStorage } from '@vueuse/core';
import '@oslokommune/punkt-elements/dist/pkt-checkbox.js';
import ItemList from './ItemList.vue';

const showArchived = useLocalStorage('admin-show-archived-items', false);
</script>

<template>
  <div>
    <div class="pkt-grid pkt-grid--full">
      <ItemList
        class="pkt-cell pkt-cell--span12 pkt-cell--span4-tablet-up"
        collection="organizations"
        :include-archived="showArchived"
      />

      <ItemList
        class="pkt-cell pkt-cell--span12 pkt-cell--span4-tablet-up"
        collection="departments"
        :include-archived="showArchived"
      />

      <ItemList
        class="pkt-cell pkt-cell--span12 pkt-cell--span4-tablet-up"
        collection="products"
        :include-archived="showArchived"
      />
    </div>

    <div class="my-size-24">
      <pkt-checkbox
        id="showArchived"
        isSwitch
        :checked="showArchived"
        :label="$t('admin.objects.showArchived')"
        @value-change="showArchived = $event.detail"
      />
    </div>
  </div>
</template>
