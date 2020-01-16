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

    <div class="toggle__wrapper">
      <span class="toggle__label">Vis arkiverte objekter</span>
      <label class="toggle">
        <input class="toggle__input" type="checkbox" v-model="showArchived" />
        <span class="toggle__switch"></span>
      </label>
    </div>

    <div class="miller">
      <div class="miller__col" :class="{ active: selection.type === 'organisation' }">
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

      <div class="miller__col" :class="{ active: selection.type === 'department' }">
        <h3 class="miller__col__header">Velg produktområde</h3>
        <div
          class="miller__col__item"
          v-for="dept in depts"
          :key="dept.id"
          @click="selectDept(dept.id)"
          :class="{ active: selectedDeptId === dept.id }"
        >
          {{ dept.name }}
          <i v-if="dept.archived" class="fa fas fa-history"></i>
        </div>
        <div v-if="selectedOrgId" class="miller__col__item miller__col__add" @click="addDepartment">+ Legg til</div>
      </div>

      <div class="miller__col" :class="{ active: selection.type === 'product' }">
        <h3 class="miller__col__header">Velg produkt</h3>
        <div
          class="miller__col__item"
          v-for="product in products"
          :key="product.id"
          @click="selectProduct(product.id)"
          :class="{ active: selectedProductId === product.id }"
        >
          {{ product.name }}

          <i v-if="product.archived" class="fa fas fa-history"></i>
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
import AdminProduct from './components/AdminProduct.vue';
import AdminDepartment from './components/AdminDepartment.vue';
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
    showArchived: false,
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
      getDepartments.call(this, this.selectedOrgId, this.showArchived);
    },

    selectDept(val) {
      this.selectedDeptId = val;
      this.selectedProductId = null;
      getProducts.call(this, this.selectedOrgId, this.selectedDeptId, this.showArchived);
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
    getOrgs.call(this, this.showArchived);
  },

  watch: {
    showArchived(value) {
      this.selectedOrgId = null;
      this.selectedDeptId = null;
      this.products = [];
      this.depts = [];

      getOrgs.call(this, value);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_miller';
</style>
