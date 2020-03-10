<template>
  <div class="container container--sidebar">
    <div class="content--main content--padding">
      <AdminProduct v-if="type === 'products'" :docref="docref" />
      <AdminDepartment v-if="type === 'departments'" :docref="docref" />
      <AdminOrganization v-if="type === 'orgs'" :docref="docref" />
    </div>
  </div>
</template>

<script>
import AdminProduct from '@/views/Admin/components/AdminProduct.vue';
import AdminDepartment from '@/views/Admin/components/AdminDepartment.vue';
import AdminOrganization from '@/views/Admin/components/AdminOrganization.vue';

export default {
  name: 'EditProductDetails',

  components: {
    AdminProduct,
    AdminDepartment,
    AdminOrganization,
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
