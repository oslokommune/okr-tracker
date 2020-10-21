<template>
  <div v-if="keyResult">
    <validation-observer v-slot="{ handleSubmit }">
      <form id="update-keyresult" @submit.prevent="handleSubmit(update)">
        <form-component
          input-type="input"
          name="name"
          label="Name"
          rules="required"
          v-model="keyResult.name"
          type="text"
        />

        <label class="form-group">
          <span class="form-label">Description</span>
          <input class="form__field" type="text" v-model="keyResult.description" />
        </label>

        <validation-provider rules="required" name="objective" v-slot="{ errors }">
          <label class="form-group">
            <span class="form-label">Objective</span>
            <v-select
              label="name"
              v-model="keyResult.objective"
              :options="objectives"
              :clearable="false"
              @input="changedObjective = true"
            >
              <template #option="option">
                {{ option.name }}
                <span v-if="option.period && option.period.name"> ({{ option.period.name }}) </span>
              </template>
            </v-select>
          </label>
          <div v-if="errors[0]" class="form-field--error">{{ errors[0] }}</div>
        </validation-provider>

        <form-component
          input-type="input"
          name="unit"
          label="Unit"
          rules="required"
          v-model="keyResult.unit"
          type="text"
        />

        <div class="form-row">
          <form-component
            input-type="input"
            name="startValue"
            label="Start Value"
            rules="required|numeric"
            v-model.number="keyResult.startValue"
            type="number"
          />

          <form-component
            input-type="input"
            name="targetValue"
            label="Target Value"
            rules="required|numeric"
            v-model.number="keyResult.targetValue"
            type="number"
          />

          <form-component
            input-type="input"
            name="weight"
            label="Weight"
            rules="required|numeric"
            v-model.number="keyResult.weight"
            type="number"
          />
        </div>

        <div class="toggle__container">
          <span class="toggle__label">{{ $t('keyres.automation.header') }}</span>
          <label class="toggle">
            <input class="toggle__input" type="checkbox" v-model="keyResult.auto" />
            <span class="toggle__switch"></span>
          </label>
        </div>

        <div v-if="keyResult.auto">
          <p>
            <router-link :to="{ name: 'Help' }">{{ $t('keyres.automation.readMore') }}</router-link>
          </p>

          <form-component
            :label="$t('keyres.automation.googleSheetId')"
            :rules="`${keyResult.auto ? 'required' : ''}`"
            input-type="input"
            name="sheetId"
            v-model="keyResult.sheetId"
            type="text"
          >
            <template #help>
              <span class="form-help" v-html="$t('keyres.automation.googleSheetIdHelp')"></span>
            </template>
          </form-component>

          <form-component
            :label="$t('keyres.automation.sheetsTab')"
            :rules="`${keyResult.auto ? 'required' : ''}`"
            input-type="input"
            name="sheetTab"
            v-model="keyResult.sheetName"
            type="text"
          >
            <template #help>
              <span class="form-help">{{ $t('keyres.automation.sheetsTabHelp') }}</span>
            </template>
          </form-component>

          <form-component
            :label="$t('keyres.automation.sheetsCell')"
            :rules="`${keyResult.auto ? 'required' : ''}`"
            input-type="input"
            name="sheetCell"
            v-model="keyResult.sheetCell"
            type="text"
          >
            <template #help>
              <span class="form-help">{{ $t('keyres.automation.sheetsCellHelp') }}</span>
            </template>
          </form-component>
        </div>
      </form>
    </validation-observer>

    <div class="button-row">
      <button class="btn btn--icon btn--pri" form="update-keyresult">
        <span class="icon fa fa-fw fa-save"></span> Save changes
      </button>
      <button class="btn btn--icon btn--danger" @click="archive" v-if="!keyResult.archived">
        <span class="icon fa fa-fw fa-trash"></span> Archive key result
      </button>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import KeyResult from '@/db/KeyResult';
import { extend } from 'vee-validate';
import { required, numeric } from 'vee-validate/dist/rules';
import FormComponent from '@/components/FormComponent.vue';

extend('required', required);
extend('numeric', numeric);

export default {
  components: { FormComponent },

  data: () => ({
    keyResult: null,
    objectives: [],
    changedObjective: false,
  }),
  props: {
    data: {
      type: Object,
      required: true,
    },
  },

  watch: {
    data: {
      immediate: true,
      async handler() {
        const parent = await db
          .collection('slugs')
          .doc(this.data.parent.slug)
          .get()
          .then(snapshot => snapshot.data().reference);
        this.$bind('objectives', db.collection('objectives').where('parent', '==', parent));
        this.keyResult = { ...this.data, id: this.data.id };
      },
    },
  },

  methods: {
    async update() {
      try {
        const {
          id,
          name,
          weight,
          description,
          objective,
          auto,
          unit,
          startValue,
          targetValue,
          sheetId,
          sheetName,
          sheetCell,
        } = this.keyResult;

        const data = {
          name: name || '',
          weight: weight || 1,
          description: description || '',
          objective: db.collection('objectives').doc(objective.id),
          auto: auto || false,
          unit: unit || '',
          startValue: startValue || 0,
          targetValue: targetValue || 100,
          sheetCell: sheetCell || '',
          sheetId: sheetId || '',
          sheetName: sheetName || '',
        };

        await KeyResult.update(id, data);

        if (this.changedObjective) {
          await this.$router.push({ query: {} });
          await this.$router.push({ query: { type: 'keyResult', id } });
        }

        this.$toasted.show('Successfully saved changes');
      } catch (error) {
        console.log(error);
        this.$toasted.show('Could not save changes');
      }
    },
    async archive() {
      try {
        await KeyResult.archive(this.keyResult.id);
        this.$router.push({ query: {} });
        this.$toasted.show('Archived');
      } catch (error) {
        console.log(error);
        this.$toasted.show('Could not archive product');
      }
    },
  },
};
</script>

<style lang="scss">
.button-row {
  display: flex;
  flex-wrap: wrap;
  margin: 2.5rem -0.25rem -0.25rem;

  > .btn {
    margin: 0.25rem;
  }
}

.toggle__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
}
</style>
