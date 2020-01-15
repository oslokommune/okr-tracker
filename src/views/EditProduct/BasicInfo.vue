<template>
  <div class="container container--sidebar">
    <div class="content--main content--padding">
      <AdminProduct v-if="type === 'products'" :docref="docref" />
      <AdminDepartment v-if="type === 'departments'" :docref="docref" />
    </div>
  </div>
</template>

<script>
import AdminProduct from '@/components/admin/AdminProduct.vue';
import AdminDepartment from '@/components/admin/AdminDepartment.vue';

export default {
  components: {
    AdminProduct,
    AdminDepartment,
  },

  props: {
    docref: {
      type: Object,
      required: true,
    },
  },

  computed: {
    type() {
      return this.docref.parent.id;
    },
  },
};
</script>
