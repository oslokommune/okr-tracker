<template>
  <form-component
    input-type="textarea"
    type="text"
    :label="label"
    :rows="5"
    :readonly="true"
    :copy-button="true"
    :value="example"
  >
    <template #help>
      <span v-if="help" class="form-help">{{ help }}</span>
    </template>
  </form-component>
</template>

<script>
/**
 * Component for displaying an example of how to use the progress update API.
 */
export default {
  name: 'ProgressUpdateAPIExample',

  props: {
    path: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: false,
      default: '',
    },
    help: {
      type: String,
      required: false,
      default: '',
    },
  },

  computed: {
    example() {
      return [
        'curl -X POST -H "okr-team-secret: <YOUR SECRET>"',
        '-H "x-api-key: <YOUR API-KEY>"',
        '-H "Content-Type: application/json"',
        `-d '{ "progress": <VALUE> }'`,
        `${import.meta.env.VITE_API_GATEWAY_URL}/${this.path}`,
      ].join(' \\\n  ');
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

::v-deep textarea {
  margin: 0;
  font-size: typography.$font-size-1;
}
</style>
