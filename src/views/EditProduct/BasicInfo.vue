<template>
  <div>
    <h1 class="title-2">Detaljer</h1>

    <div class="narrow content">
      <label class="form-group">
        <span class="form-label">Produktnavn</span>
        <input @input="edited = true" type="text" v-model="product.product" />
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
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
  data: () => ({
    edited: false,
    submit: false,
    showInfo: false,
    info: '',
    team: [],
  }),

  computed: {
    ...mapState(['data']),
    ...mapGetters(['getObjectById']),

    allUsers() {
      return this.data.Users;
    },

    selectedUserIds() {
      return this.team.map(d => d.id).join(',');
    },

    product() {
      return this.getObjectById(this.$route.params.id);
    },
  },

  mounted() {
    this.team = this.product.team;
  },

  methods: {
    ...mapActions(['updateObject', 'updateProductDetails']),

    submitForm() {
      this.setSubmitInfo(true, false, '');
      this.updateProductDetails({ ...this.product, team_members: this.selectedUserIds })
        .then(() => {
          this.updateObject({
            key: 'Products',
            data: { ...this.product, team_members: this.selectedUserIds },
          });
        })
        .then(() => {
          this.edited = false;
          this.setSubmitInfo(false, false, '');
          this.$router.push({ name: 'product', params: { id: this.product.id } });
        })
        .catch(() => {
          this.edited = false;
          this.setSubmitInfo(false, true, 'Noe gikk galt');
        });
    },

    setSubmitInfo(submit, showInfo, info) {
      this.submit = submit;
      this.showInfo = showInfo;
      this.info = info;
    },
  },
};
</script>
