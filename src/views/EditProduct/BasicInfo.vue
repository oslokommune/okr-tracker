<template>
  <div>
    <h1 class="title-2">Detaljer</h1>

    <div class="narrow content">
      <label class="form-group">
        <span class="form-label">Produktnavn</span>
        <input @input="edited = true" type="text" v-model="product.name" />
      </label>

      <label class="form-group">
        <span class="form-label">Produktbilde</span>
        <input @input="edited = true" type="text" v-model="product.product_image" />
      </label>

      <label class="form-group">
        <span class="form-label">Oppdrag</span>
        <textarea @input="edited = true" v-model="product.mission_statement"></textarea>
      </label>

      <div class="form-group">
        <span class="form-label">Team</span>
        <v-select
          @input="edited = true"
          class="form-group objective__select"
          label="name"
          multiple
          v-model="team"
          :options="allUsers"
        ></v-select>
        <pre>{{ selectedUserIds }}</pre>
      </div>

      <button class="btn" :disabled="!edited || submit" @click="submitForm">
        Lagre endringer
      </button>
      <p v-if="showInfo">{{ info }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    edited: false,
    submit: false,
    showInfo: false,
    info: '',
    team: [],
  }),

  props: {
    product: {
      type: Object,
      required: true,
    },
  },
};
</script>
