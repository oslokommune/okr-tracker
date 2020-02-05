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
        <admin-product v-if="selection.type === 'product'" :docref="selection.docRef"></admin-product>
        <admin-department v-if="selection.type === 'department'" :docref="selection.docRef"></admin-department>
      </main>
    </div>

    <hr />

    <div class="title-2"><i class="fa fa-exclamation-triangle"></i> Danger Zone</div>

    <h3 class="title-3">
      Migrere data fra gammel løsning (Google Sheets)
    </h3>

    <div class="form-group">
      <form @submit.prevent="importData()">
        <div class="callout">
          <div class="callout__message">
            <p>
              For å migrere data fra gammel løsning, må følgende steg følges:

              <ol class="ol">
                <li>«Audit»- og «Orgs»-samlingene i Firestore må tømmes.</li>
                <li>Følgende filer må lastes ned fra Google Sheets:
                  <ol class="ol">
                    <li>OKR-tracker-data - Depts.csv</li>
                    <li>OKR-tracker-data - Orgs.csv</li>
                    <li>OKR-tracker-data - Objectives.csv</li>
                    <li>OKR-tracker-data - Products.csv</li>
                    <li>OKR-tracker-data - KeyRes.csv</li>
                    <li>OKR-tracker-data - KeyResTracker.csv</li>
                  </ol>
                  For å laste ned filer:
                  <ol class="ol">
                    <li>Velg riktig fane i Google Sheets-dokumentet</li>
                    <li>Klikk «File»</li>
                    <li>Velg «Download»</li>
                    <li>Velg «Comma-separated values (.csv, current sheet)»</li>
                  </ol>
                </li>
                <li>Last opp filene her (alle 6 filene samtidig) og trykk «Start migrering»</li>
              </ol>
            </p>
            <hr />

            <input type="file" @input="previewFiles" multiple />
          </div>
          <div class="callout__actions">
            <button class="btn btn--borderless">Start migrering</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { db } from '../../config/firebaseConfig';
import { getOrgs, getDepartments, getProducts } from '../../db/db';
import AdminProduct from './components/AdminProduct.vue';
import AdminDepartment from './components/AdminDepartment.vue';
import * as Toast from '@/util/toasts';
import Audit from '../../db/audit';
import fileImporter from '../../migration/fileImporter';

export default {
  name: 'AdminObjects',

  components: { AdminProduct, AdminDepartment },

  data: () => ({
    files: null,
    orgs: [],
    products: [],
    depts: [],
    selectedOrgId: null,
    selectedDeptId: null,
    selectedProductId: null,
    showArchived: false,
  }),

  computed: {
    ...mapState(['user']),

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
    previewFiles(event) {
      this.files = event.target.files;
    },

    importData() {
      if (!this.files || this.files.length === 0) {
        Toast.showError('You need to upload some files first');
        return;
      }
      fileImporter(this.files);
    },

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

      const defaultProduct = {
        name: 'Nytt produkt',
        slug: 'nytt-produkt',
        archived: false,
        team: [],
        created: new Date(),
        createdBy: this.user.ref,
      };

      deptRef
        .add(defaultProduct)
        .then(doc => {
          this.selectedProductId = doc.id;
          Audit.createProduct(doc, deptRef.parent)
          return doc
        })
        .then(Toast.addedProduct)
        .catch(this.$errorHandler);
    },

    addDepartment() {
      if (!this.user) return;

      const deptRef = db.collection(`orgs/${this.selectedOrgId}/departments/`);

      const defaultDepartment = {
        name: 'Nytt produktområde',
        slug: 'nytt-produktomrade',
        archived: false,
        created: new Date(),
        createdBy: this.user.ref,
      };

      deptRef
        .add(defaultDepartment)
        .then(doc => {
          this.selectedProductId = null;
          this.products = [];
          this.selectedDeptId = doc.id;
          return doc;
        })
        .then(Toast.addedDepartment)
        .catch(this.$errorHandler);
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
@import '../../styles/_miller';
</style>
