import { ref, toRef, watchEffect } from 'vue';

export function useProgressModal(props, context) {
  const record = toRef(props.record);
  const loading = ref(false);
  const thisRecord = ref({});

  watchEffect(() => {
    if (record.value) {
      const { value, comment, timestamp } = record.value;
      thisRecord.value = {
        value,
        comment,
        timestamp: timestamp.toDate(),
      };
    } else {
      thisRecord.value = {
        value: null,
        comment: '',
        timestamp: new Date(),
      };
    }
  });

  function saveRecord() {
    loading.value = true;

    if (record.value) {
      context.emit('update-record', record.value.id, thisRecord.value, close);
    } else {
      context.emit('create-record', thisRecord.value, close);
    }
  }

  function deleteRecord() {
    if (record.value) {
      loading.value = true;
      context.emit('delete-record', record.value.id, close);
    }
  }

  function close(e) {
    loading.value = false;
    context.emit('close', e);
  }

  return { thisRecord, loading, saveRecord, deleteRecord, close };
}

export default useProgressModal;
