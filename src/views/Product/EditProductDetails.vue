<template>
  <div class="container container--sidebar">
    <div class="content--main content--padding">
      <AdminProduct :docref="docref"></AdminProduct>
    </div>
  </div>
</template>

<script>
import AdminProduct from '@/views/Admin/components/AdminProduct.vue';

export default {
  components: {
    AdminProduct,
  },

  props: {
    docref: {
      type: Object,
      required: true,
    },
  },
};
</script>
