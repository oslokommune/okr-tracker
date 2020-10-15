<template>
  <div>
    <div class="columns">
      <div>
        <h2 class="title-2">Organizations</h2>

        <div class="col">
          <div class="col__body">
            <div class="col__row" v-for="organization in organizations" :key="organization.id">
              <router-link class="col__link" :to="{ name: 'ItemAdmin', params: { slug: organization.slug } }">
                <span class="col__icon fa fa-industry"></span>
                {{ organization.name }}</router-link
              >
            </div>
          </div>
          <div class="col__footer">
            <router-link class="btn btn--fw" :to="{ name: 'CreateOrganization' }">+ Add organization</router-link>
          </div>
        </div>
      </div>

      <div>
        <h2 class="title-2">Departments</h2>
        <div class="col">
          <div class="col__body">
            <div class="col__row" v-for="department in departments" :key="department.id">
              <router-link class="col__link" :to="{ name: 'ItemAdmin', params: { slug: department.slug } }">
                <span class="col__icon fa fa-cubes"></span>
                {{ department.name }}</router-link
              >
            </div>
          </div>
          <div class="col__footer">
            <router-link class="btn btn--fw" :to="{ name: 'CreateDepartment' }">+ Add department</router-link>
          </div>
        </div>
      </div>

      <div>
        <h2 class="title-2">Products</h2>
        <div class="col">
          <div class="col__body">
            <div class="col__row" v-for="product in products" :key="product.id">
              <router-link class="col__link" :to="{ name: 'ItemAdmin', params: { slug: product.slug } }">
                <span class="col__icon fa fa-cube"></span>
                {{ product.name }}</router-link
              >
            </div>
          </div>
          <div class="col__footer">
            <router-link class="btn btn--fw" :to="{ name: 'CreateProduct' }">+ Add product</router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="actions">
      <label class="form-group--checkbox">
        <input type="checkbox" class="form__checkbox" v-model="showArchived" />
        <span class="form-label">Show archived</span>
      </label>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';

export default {
  data: () => ({
    showArchived: false,
    organizations: [],
    departments: [],
    products: [],
  }),

  watch: {
    showArchived: {
      immediate: true,
      handler() {
        this.$bind('organizations', db.collection('organizations').where('archived', 'in', [false, this.showArchived]));
        this.$bind('departments', db.collection('departments').where('archived', 'in', [false, this.showArchived]));
        this.$bind('products', db.collection('products').where('archived', 'in', [false, this.showArchived]));
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.columns {
  display: grid;
  grid-gap: span(0, 1, span(12));
  grid-template-rows: repeat(auto-fill, auto);
  grid-template-columns: repeat(1, fr);

  @media screen and (min-width: bp(s)) {
    grid-gap: span(0, 1, span(6));
    grid-template-columns: repeat(1, 1fr);
  }

  @media screen and (min-width: bp(m)) {
    grid-gap: span(0, 1, span(6));
    grid-template-columns: repeat(3, 1fr);
  }

  @media screen and (min-width: bp(l)) {
    grid-gap: span(0, 1, span(7));
    width: span(6, 0, span(7));
  }
}

.col {
  display: flex;
  flex-direction: column;
  height: 32rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba($color-grey-400, 0.3);
}

.col__body {
  overflow: auto;
}

.col__header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: $color-grey-100;
}

.col__footer {
  margin-top: auto;
  padding: 1rem;
}

.col__icon {
  margin-right: 0.25rem;
}

.col__link {
  display: block;
  padding: 0.5rem 1rem;
  color: $color-purple;
  font-weight: 500;
  font-size: 1rem;
  text-decoration: none;
  border-bottom: 1px solid $color-grey-100;
}
</style>
