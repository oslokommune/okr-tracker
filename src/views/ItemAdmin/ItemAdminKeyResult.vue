<template>
  <div v-if="keyResult">
    <archived-restore v-if="keyResult.archived" :delete-deep="deleteDeep" :restore="restore"></archived-restore>

    <validation-observer v-slot="{ handleSubmit }">
      <form id="update-keyresult" @submit.prevent="handleSubmit(update)">
        <form-component
          input-type="input"
          name="name"
          :label="$t('fields.name')"
          rules="required"
          v-model="keyResult.name"
          type="text"
        />

        <label class="form-group">
          <span class="form-label">{{ $t('keyres.description') }}</span>
          <input class="form__field" type="text" v-model="keyResult.description" />
        </label>

        <validation-provider rules="required" name="objective" v-slot="{ errors }">
          <label class="form-group">
            <span class="form-label">{{ $t('keyres.objective') }}</span>
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
            <span v-if="errors[0]" class="form-field--error">{{ errors[0] }}</span>
          </label>
        </validation-provider>

        <form-component
          input-type="input"
          name="unit"
          :label="$t('keyres.unit')"
          rules="required"
          v-model="keyResult.unit"
          type="text"
        />

        <div class="form-row">
          <form-component
            input-type="input"
            name="startValue"
            :label="$t('keyres.startValue')"
            rules="required|numeric"
            v-model.number="keyResult.startValue"
            type="number"
          />

          <form-component
            input-type="input"
            name="targetValue"
            :label="$t('keyres.targetValue')"
            rules="required|numeric"
            v-model.number="keyResult.targetValue"
            type="number"
          />

          <form-component
            input-type="input"
            name="weight"
            :label="$t('keyres.weight')"
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
      <button class="btn btn--icon btn--pri" form="update-keyresult" :disabled="loading">
        <span class="icon fa fa-fw fa-save"></span> {{ $t('btn.saveChanges') }}
      </button>
      <button class="btn btn--icon btn--danger" @click="archive" v-if="!keyResult.archived" :disabled="loading">
        <span class="icon fa fa-fw fa-trash"></span> {{ $t('btn.archive') }}
      </button>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import KeyResult from '@/db/KeyResult';
import * as Toast from '@/util/toasts';

export default {
  components: {
    FormComponent: () => import('@/components/FormComponent.vue'),
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
  },

  data: () => ({
    keyResult: null,
    objectives: [],
    changedObjective: false,
    loading: false,
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
      this.loading = true;

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

        Toast.savedChanges();
      } catch (error) {
        console.log(error);
        Toast.errorSave();
      }

      this.loading = false;
    },
    async archive() {
      this.loading = true;
      try {
        await this.$router.push({ query: { type: 'objective', id: this.keyResult.objective.id } });
        await KeyResult.archive(this.keyResult.id);
        const restoreCallback = await KeyResult.restore.bind(null, this.activeItem.id);

        Toast.deletedRegret({ name: this.keyResult.name, callback: restoreCallback });
      } catch (error) {
        Toast.errorArchive(this.keyResult.name);
        throw new Error(error.message);
      }

      this.loading = false;
    },

    async restore() {
      this.loading = true;

      try {
        await KeyResult.restore(this.keyResult.id);
        this.keyResult.archived = false;
        Toast.revertedDeletion();
      } catch (error) {
        Toast.errorRestore(this.keyResult.name);
        throw new Error(error.message);
      }
      this.loading = false;
    },

    async deleteDeep() {
      this.loading = true;

      try {
        await this.$router.push({ query: { type: 'objective', id: this.keyResult.objective.id } });
        await KeyResult.deleteDeep(this.keyResult.id);
        Toast.deletedPermanently();
      } catch (error) {
        Toast.errorDelete(this.keyResult.name);
        throw new Error(error.message);
      }

      this.loading = false;
    },
  },
};
</script>

<style lang="scss">
.toggle__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
}
</style>
