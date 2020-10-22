<template>
  <div>
    <h1 class="title-1">Create new organization</h1>

    <div class="container">
      <validation-observer v-slot="{ handleSubmit }">
        <form id="createOrganization" @submit.prevent="handleSubmit(save)">
          <form-component input-type="input" name="name" rules="required" label="Name" v-model="name" type="text" />

          <form-component
            input-type="textarea"
            name="missionStatement"
            label="Mission statement"
            rules="required"
            v-model="missionStatement"
          />
        </form>
      </validation-observer>

      <div class="button-row">
        <button class="btn btn--icon btn--pri" form="createOrganization" :disabled="loading">
          <span class="icon fa fa-fw fa-save"></span> Create
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Organization from '@/db/Organization';
import findSlugAndRedirect from '@/util/findSlugAndRedirect';

export default {
  data: () => ({
    name: '',
    missionStatement: '',
    loading: false,
  }),

  components: {
    FormComponent: () => import('@/components/FormComponent.vue'),
  },

  computed: {
    ...mapState(['user']),
  },

  async mounted() {
    if (!this.user.admin) {
      await this.$router.push({ name: 'Home' });
    }
  },

  methods: {
    async save() {
      const { name, missionStatement } = this;
      const data = {
        name: name.trim(),
        missionStatement: missionStatement.trim(),
        archived: false,
      };

      this.loading = true;

      try {
        await Organization.create(data).then(findSlugAndRedirect);
      } catch (error) {
        this.$toasted.show('Could not create organization');
        throw new Error(error);
      }

      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors';

.container {
  padding: 1rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba($color-grey-400, 0.3);

  @media screen and (min-width: bp(s)) {
    width: span(8);
    padding: 1.5rem;
  }

  @media screen and (min-width: bp(m)) {
    width: span(5, 0, span(9));
    padding: 1.5rem;
  }

  @media screen and (min-width: bp(l)) {
    width: span(4, 0, span(10));
    padding: 1.5rem;
  }
}
</style>
