<template>
  <div>
    <div class="columns">
      <div>
        <h2 class="title-2">Organizations</h2>

        <div class="col">
          <div class="col__header">
            <div class="col__icon fa fa-industry"></div>
            <div class="col__title">Organizations</div>
          </div>
          <div class="col__body">
            <div class="col__row" v-for="organization in organizations" :key="organization.id">
              <router-link class="col__link" :to="{ name: 'ItemAdmin', params: { slug: organization.slug } }">{{
                organization.name
              }}</router-link>
            </div>
          </div>
          <div class="col__footer">
            <button class="btn btn--fw">+ Add organisation</button>
          </div>
        </div>
      </div>

      <div>
        <h2 class="title-2">Departments</h2>
        <div class="col">
          <div class="col__header">
            <div class="col__icon fa fa-cubes"></div>
            <div class="col__title">Departments</div>
          </div>
          <div class="col__body">
            <div class="col__row" v-for="department in departments" :key="department.id">
              <router-link class="col__link" :to="{ name: 'ItemAdmin', params: { slug: department.slug } }">{{
                department.name
              }}</router-link>
            </div>
          </div>
          <div class="col__footer">
            <button class="btn btn--fw">+ Add department</button>
          </div>
        </div>
      </div>

      <div>
        <h2 class="title-2">Products</h2>
        <div class="col">
          <div class="col__header">
            <div class="col__icon fa fa-cube"></div>
            <div class="col__title">Products</div>
          </div>
          <div class="col__body">
            <div class="col__row" v-for="product in products" :key="product.id">
              <router-link class="col__link" :to="{ name: 'ItemAdmin', params: { slug: product.slug } }">{{
                product.name
              }}</router-link>
            </div>
          </div>
          <div class="col__footer">
            <button class="btn btn--fw">+ Add product</button>
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
  box-shadow: 0 2px 3px rgba($color-grey-500, 0.5);
}

.col__header {
  display: flex;
  align-items: center;
  padding: 0.5rem;
}

.col__footer {
  margin-top: auto;
  padding: 1rem;
}

.col__body {
}

.col__icon {
  margin-right: 0.5rem;
}

.col__title {
  font-weight: 500;
}
</style>
