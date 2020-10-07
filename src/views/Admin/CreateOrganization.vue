<template>
  <div>
    <h1 class="title-1">Create new organization</h1>

    <div class="container">
      <form>
        <label class="form-group">
          <span class="form-label">Name</span>
          <input class="form__field" type="text" v-model="name" />
        </label>
        <label class="form-group">
          <span class="form-label">Mission statement</span>
          <textarea class="form__field" v-model="missionStatement" rows="4"></textarea>
        </label>
      </form>

      <div class="button-row">
        <button class="btn btn--icon btn--pri" @click="save"><span class="icon fa fa-fw fa-save"></span> Create</button>
      </div>
    </div>
  </div>
</template>

<script>
import Organization from '@/db/Organization';

export default {
  data: () => ({
    name: '',
    missionStatement: '',
  }),

  methods: {
    async save() {
      const { name, missionStatement } = this;
      const data = {
        name: name.trim(),
        missionStatement: missionStatement.trim(),
        archived: false,
      };

      try {
        await Organization.create(data);
      } catch (error) {
        this.$toasted.show('Could not create organization');
        throw new Error(error);
      }
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
