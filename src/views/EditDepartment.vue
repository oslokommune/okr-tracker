<template>
  <div v-if="department">
    <header class="page-header page-header--edit">
      <div class="container">
        <div class="page-header__container">
          <router-link class="page-header__edit" :to="{ name: 'department', params: { id: $route.params.id } }">
            Gå tilbake til {{ department.name }}
          </router-link>
          <div class="page-header__name">
            <h1 class="title-1">Endre «{{ department.name }}»</h1>
          </div>

          <img
            :src="department.photoURL || '/placeholder-image.svg'"
            :alt="`Profilbilde for ${department.name}`"
            class="page-header__profile-image"
          />
        </div>
      </div>
    </header>

    <nav class="sub-nav">
      <div class="container container--sidebar">
        <div class="content--main">
          <router-link class="sub-nav__element" exact :to="{ name: 'edit-department' }">Produkt</router-link>
          <router-link class="sub-nav__element" :to="{ name: 'edit-department-keyres' }">
            Mål og nøkkelresultater
          </router-link>
          <router-link class="sub-nav__element" exact :to="{ name: 'home' }">Team</router-link>
        </div>
      </div>
    </nav>

    <div class="content">
      <router-view :docref="department.ref"></router-view>
    </div>
  </div>
</template>

<script>
import { departmentListener, isAdmin } from '../util/db';

export default {
  name: 'Department',

  data: () => ({
    department: null,
  }),

  async beforeRouteEnter(to, from, next) {
    if (await isAdmin()) {
      next();
    } else {
      next(false);
      throw new Error('You do not have access to this page!');
    }
  },

  created() {
    departmentListener.call(this, this.$route.params.slug);
  },
};
</script>

<style lang="scss" scoped></style>
