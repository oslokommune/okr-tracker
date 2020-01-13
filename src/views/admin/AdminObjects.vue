<template>
  <div>
    <div class="miller">
      <div class="miller__col">
        <h3 class="miller__col__header">Organisasjon</h3>
        <div
          class="miller__col__item"
          v-for="org in orgs"
          :key="org.id"
          @click="selectOrg(org.id)"
          :class="{ active: selectedOrgId === org.id }"
        >
          {{ org.name }}
        </div>
      </div>

      <div class="miller__col">
        <h3 class="miller__col__header">Produktområde</h3>
        <div
          class="miller__col__item"
          v-for="dept in depts"
          :key="dept.id"
          @click="selectDept(dept.id)"
          :class="{ active: selectedDeptId === dept.id }"
        >
          {{ dept.name }}
        </div>
        <div v-if="selectedOrgId" class="miller__col__item miller__col__add" @click="addDepartment">+ Legg til</div>
      </div>

      <div class="miller__col">
        <h3 class="miller__col__header">Produkt</h3>
        <div
          class="miller__col__item"
          v-for="product in products"
          :key="product.id"
          @click="selectProduct(product.id)"
          :class="{ active: selectedProductId === product.id }"
        >
          {{ product.name }}
        </div>
        <div v-if="selectedDeptId" class="miller__col__item miller__col__add" @click="addProduct">+ Legg til</div>
      </div>

      <main class="miller__main">
        <AdminProduct v-if="selection.type === 'product'" :docref="selection.docRef"></AdminProduct>
        <AdminDepartment v-if="selection.type === 'department'" :docref="selection.docRef"></AdminDepartment>
      </main>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import { getOrgs, getDepartments, getProducts } from '@/util/db';
import AdminProduct from '@/components/admin/AdminProduct.vue';
import AdminDepartment from '@/components/admin/AdminDepartment.vue';

export default {
  name: 'Admin',

  components: { AdminProduct, AdminDepartment },

  data: () => ({
    orgs: [],
    products: [],
    depts: [],
    selectedOrgId: null,
    selectedDeptId: null,
    selectedProductId: null,
  }),

  computed: {
    selection() {
      if (this.selectedProductId) {
        const docRef = db
          .collection(`orgs/${this.selectedOrgId}/departments/${this.selectedDeptId}/products`)
          .doc(this.selectedProductId);
        return { type: 'product', docRef };
      }

      if (this.selectedDeptId) {
        const docRef = db.collection(`orgs/${this.selectedOrgId}/departments`).doc(this.selectedDeptId);
        return { type: 'department', docRef };
      }

      if (this.selectedOrgId) {
        const docRef = '';
        return { type: 'organisation', docRef };
      }

      return false;
    },
  },

  methods: {
    selectOrg(val) {
      this.selectedOrgId = val;
      this.selectedDeptId = null;
      this.depts = [];
      this.products = [];
      this.selectedProductId = null;
      getDepartments.call(this, this.selectedOrgId);
    },

    selectDept(val) {
      this.selectedDeptId = val;
      this.selectedProductId = null;
      getProducts.call(this, this.selectedOrgId, this.selectedDeptId);
    },

    selectProduct(val) {
      this.selectedProductId = val;
    },

    addProduct() {
      const deptRef = db.collection(`orgs/${this.selectedOrgId}/departments/${this.selectedDeptId}/products`);

      deptRef.add({ name: 'Nytt produkt', archived: false }).then(doc => {
        this.selectedProductId = doc.id;
      });
    },

    addDepartment() {
      const deptRef = db.collection(`orgs/${this.selectedOrgId}/departments/`);

      deptRef.add({ name: 'Nytt produktområde', archived: false }).then(doc => {
        this.selectedProductId = null;
        this.products = [];
        this.selectedDeptId = doc.id;
      });
    },
  },

  mounted() {
    getOrgs.call(this);
  },
};
</script>

<style lang="scss" scoped>
.miller {
  display: flex;
  min-height: 600px;
  margin: 2rem 0;
  color: black;
  background: #fafafa;

  &__col {
    display: flex;
    flex-direction: column;
    width: auto;
    min-width: 160px;
    margin-right: -1px;
    border: 1px solid #dddddd;

    &__header {
      padding: 1rem 1rem;
      font-weight: 500;
      line-height: 1rem;
      background: #eeeeee;
      border-bottom: 1px solid #dddddd;
    }

    &__item {
      display: block;
      width: 100%;
      padding: 0.5rem 3rem 0.5rem 1rem;
      user-select: none;

      &:hover:not(.active) {
        background: rgba(black, 0.03);
        cursor: pointer;
      }

      &.active {
        background: #dddddd;
      }
    }

    &__add {
      // margin-top: auto;
      margin-bottom: -1px;
      color: #666666;
      border-top: 1px solid #dddddd;
      border-bottom: 1px solid #dddddd;
    }
  }

  &__main {
    flex-grow: 1;
    padding: 2rem;
    background: white;
    border: 1px solid #dddddd;
  }

  &--list {
    padding: 0;
    list-style-type: none;
  }
}
</style>
