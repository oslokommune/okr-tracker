<template>
  <div>
    <h2>Legg til ny Key result</h2>

    <ul>
      <li>
        <label>
          <span>Mål</span><br />
          <select v-model="newKeyResult.objective_id">
            <option v-for="objective in objectives" :value="objective.id" :key="objective.id">{{
              objective.objective
            }}</option>
          </select>
        </label>
      </li>

      <li>
        <label>
          <span>Mål</span><br />
          <input type="text" v-model="newKeyResult.key_result" />
        </label>
      </li>

      <li>
        <label>
          <span>Startverdi</span><br />
          <input type="number" v-model="newKeyResult.start_value" />
        </label>
      </li>

      <li>
        <label>
          <span>måltype</span><br />
          <select v-model="newKeyResult.target_type">
            <option value="greater_than">Større enn</option>
            <option value="less_than">Mindre enn</option>
            <option value="exactly">Nøyaktig</option>
          </select>
        </label>
      </li>

      <li>
        <label>
          <span>Målverdi</span><br />
          <input type="number" v-model="newKeyResult.target_value" />
        </label>
      </li>

      <li>
        <label>
          <span>Kvartal</span><br />
          <input type="text" v-model="newKeyResult.quarter" />
        </label>
      </li>
    </ul>
    <button @click="send">Legg til</button>
  </div>
</template>

<script>
import uniqid from 'uniqid';
import { mapActions, mapGetters } from 'vuex';

export default {
  data: () => ({
    newKeyResult: {
      id: uniqid(),
      objective_id: null,
      key_result: '',
      start_value: 0,
      target_value: 0,
      target_type: 'greater_than',
      quarter: '',
    },
  }),

  computed: {
    ...mapGetters(['objectives']),
  },

  methods: {
    ...mapActions(['addKeyResult']),
    send() {
      this.addKeyResult(this.newKeyResult)
        .then(() => {
          this.newKeyResult = {
            id: uniqid(),
            objective_id: null,
            key_result: '',
            start_value: 0,
            target_value: 0,
            target_type: 'greater_than',
            quarter: '',
          };
        })
        .catch(e => {
          throw new Error(e);
        });
    },
  },
};
</script>
