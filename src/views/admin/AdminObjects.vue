<template>
  <div>
    <section class="section">
      <h2 class="title-2">Administrer produkter og produktområder</h2>
      <p>
        Legg til, endre eller slett produkter og produktområder. Utover admin-brukere har kun team-medlemmer av et
        produkt mulighet til å redigere mål og nøkkelresultater.
      </p>
    </section>
    <hr />
    <div class="miller">
      <div class="miller__col">
        <h3 class="miller__col__header">Velg organisasjon</h3>
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
        <h3 class="miller__col__header">Velg produktområde</h3>
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
        <h3 class="miller__col__header">Velg produkt</h3>
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
import * as Toast from '@/util/toasts';

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

      deptRef
        .add({ name: 'Nytt produkt', archived: false, team: [] })
        .then(doc => {
          this.selectedProductId = doc.id;
        })
        .then(Toast.addedProduct)
        .catch(Toast.error);
    },

    addDepartment() {
      const deptRef = db.collection(`orgs/${this.selectedOrgId}/departments/`);

      deptRef
        .add({ name: 'Nytt produktområde', archived: false })
        .then(doc => {
          this.selectedProductId = null;
          this.products = [];
          this.selectedDeptId = doc.id;
          return doc;
        })
        .then(Toast.addedDepartment)
        .catch(Toast.error);
    },
  },

  mounted() {
    getOrgs.call(this);
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors';

.miller {
  display: flex;
  min-height: 600px;
  margin: 2rem 0;
  overflow-x: scroll;
  color: black;
  background: rgba($color-border, 0.075);

  &__col {
    display: flex;
    flex-direction: column;
    width: 260px;
    margin-right: -1px;
    border: 1px solid $color-border;

    &__header {
      padding: 1rem 1rem;
      font-weight: 500;
      line-height: 1rem;
      background: #eeeeee;
      border-bottom: 1px solid $color-border;
    }

    &__item {
      display: block;
      width: 100%;
      padding: 0.5rem 3rem 0.5rem 1rem;
      border-bottom: 1px solid transparent;
      user-select: none;

      &:hover:not(.active) {
        background: rgba(black, 0.03);
        cursor: pointer;
      }

      &.active {
        position: relative;
        font-weight: 500;
        background: rgba($color-blue, 0.3);

        &::before {
          position: absolute;
          top: 0;
          bottom: 0;
          left: -1px;
          width: 3px;
          background: $color-purple;
          content: '';
        }
      }
    }

    &__add {
      margin-bottom: -1px;
      color: #666666;
      font-style: italic;
      border-top: 1px solid $color-border;
      border-bottom: 1px solid $color-border;
    }
  }

  &__main {
    flex-grow: 1;
    min-width: 340px;
    margin-left: -1px;
    padding: 2rem;
    background: white;
    border: 1px solid $color-border;
  }

  &--list {
    padding: 0;
    list-style-type: none;
  }
}
</style>
