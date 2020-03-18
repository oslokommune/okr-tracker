<template>
  <div>
    <section class="section">
      <h2 class="title-2">{{ $t('admin.objects.title') }}</h2>
      <p>
        {{ $t('admin.objects.subtitle') }}
      </p>
    </section>
    <hr />

    <div class="toggle__wrapper">
      <span class="toggle__label">{{ $t('admin.objects.showArchived') }}</span>
      <label class="toggle">
        <input class="toggle__input" type="checkbox" v-model="showArchived" />
        <span class="toggle__switch"></span>
      </label>
    </div>

    <div class="miller__container">
      <div class="miller">
        <div class="miller__col" :class="{ active: selection.type === 'organization' }">
          <h3 class="miller__col__header">{{ $t('admin.objects.organization') }}</h3>
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
          <h3 class="miller__col__header">{{ $t('admin.objects.department') }}</h3>
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
          <div v-if="selectedOrgId" class="miller__col__item miller__col__add" @click="addDepartment">
            {{ $t('admin.objects.add') }}
          </div>
        </div>

        <div class="miller__col" :class="{ active: selection.type === 'product' }">
          <h3 class="miller__col__header">{{ $t('admin.objects.product') }}</h3>
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
          <div v-if="selectedDeptId" class="miller__col__item miller__col__add" @click="addProduct">
            {{ $t('admin.objects.add') }}
          </div>
        </div>

        <main class="miller__main">
          <admin-organization v-if="selection.type === 'organization'" :docref="selection.docRef"></admin-organization>
          <admin-department v-if="selection.type === 'department'" :docref="selection.docRef"></admin-department>
          <admin-product v-if="selection.type === 'product'" :docref="selection.docRef"></admin-product>
        </main>
      </div>
    </div>

    <hr />

    <!-- <h3 class="title-3">Konverter kvartaler til dynamiske perioder</h3> -->
    <!-- <button class="btn" @click="convertQuartersToPeriods">Start konvertering</button> -->
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';
import { getOrgs, getDepartments, getProducts } from '@/db/db';
import AdminProduct from '@/views/Admin/components/AdminProduct.vue';
import AdminDepartment from '@/views/Admin/components/AdminDepartment.vue';
import AdminOrganization from '@/views/Admin/components/AdminOrganization.vue';
import * as Toast from '@/util/toasts';
import Audit from '@/db/audit';
import fileImporter from '@/migration/fileImporter';
import convertQuartersToPeriods from '@/migration/convertQuartersToPeriods';
import i18n from '@/locale/i18n';

export default {
  name: 'AdminObjects',

  components: { AdminProduct, AdminDepartment, AdminOrganization },

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
        const docRef = db.collection('orgs').doc(this.selectedOrgId);
        return { type: 'organization', docRef };
      }

      return false;
    },
  },

  methods: {
    convertQuartersToPeriods,

    // DEPRECATED
    previewFiles(event) {
      this.files = event.target.files;
    },

    // DEPRECATED
    importData() {
      if (!this.files || this.files.length === 0) {
        Toast.showError(i18n.t('tooltip.uploadRequired'));
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
        name: i18n.t('admin.product.defaultName'),
        slug: i18n.t('admin.product.defaultSlug'),
        archived: false,
        team: [],
        created: new Date(),
        createdBy: this.user.ref,
      };

      deptRef
        .add(defaultProduct)
        .then(doc => {
          this.selectedProductId = doc.id;
          Audit.createProduct(doc, deptRef.parent);
          return doc;
        })
        .then(Toast.addedProduct)
        .catch(err => {
          this.$errorHandler('add_product_error', err);
        });
    },

    addDepartment() {
      if (!this.user) return;

      const deptRef = db.collection(`orgs/${this.selectedOrgId}/departments/`);

      const defaultDepartment = {
        name: i18n.t('admin.department.defaultName'),
        slug: i18n.t('admin.department.defaultSlug'),
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
        .catch(err => {
          this.$errorHandler('add_department_error', err);
        });
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
