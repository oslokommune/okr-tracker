<script>
import Btn from './BtnBase.vue';

export default {
  name: 'BtnSave',
  extends: Btn,

  props: {
    type: {
      type: String,
      required: false,
      default: 'submit',
    },
    label: {
      type: String,
      required: false,
      default() {
        return this.$t('btn.save');
      },
    },
    variant: {
      type: String,
      required: false,
      default: 'confirm',
    },
    icon: {
      type: String,
      required: false,
      default: 'save',
    },
  },
};
</script>
