<template>
  <div>
    <form-component
      v-model="sheetIdModel"
      input-type="input"
      name="sheetId"
      :label="$t('keyResult.automation.googleSheetId')"
      rules="required"
      type="text"
    >
      <template #help>
        <span
          class="form-help"
          v-html="$t('keyResult.automation.googleSheetIdHelp')"
        ></span>
      </template>
    </form-component>

    <div class="form-row">
      <form-component
        v-model="sheetNameModel"
        input-type="input"
        name="sheetTab"
        :label="$t('keyResult.automation.sheetsTab')"
        placeholder="Sheet1"
        rules="required"
        type="text"
      >
        <template #help>
          <span
            class="form-help"
            v-html="$t('keyResult.automation.sheetsTabHelp')"
          ></span>
        </template>
      </form-component>

      <form-component
        v-model="sheetCellModel"
        input-type="input"
        name="sheetCell"
        :label="$t('keyResult.automation.sheetsCell')"
        placeholder="A1"
        rules="required"
        type="text"
      >
        <template #help>
          <span
            class="form-help"
            v-html="$t('keyResult.automation.sheetsCellHelp')"
          ></span>
        </template>
      </form-component>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoogleSheetsFormGroup',

  props: {
    sheetId: {
      required: false,
      type: String,
      default: '',
    },
    sheetName: {
      required: false,
      type: String,
      default: '',
    },
    sheetCell: {
      required: false,
      type: String,
      default: '',
    },
  },

  computed: {
    sheetIdModel: {
      get() {
        return this.sheetId;
      },
      set(value) {
        this.$emit('update:sheetId', value);
      },
    },
    sheetNameModel: {
      get() {
        return this.sheetName;
      },
      set(value) {
        this.$emit('update:sheetName', value);
      },
    },
    sheetCellModel: {
      get() {
        return this.sheetCell;
      },
      set(value) {
        this.$emit('update:sheetCell', value);
      },
    },
  },
};
</script>
