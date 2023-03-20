export default {
  region: 'europe-west1',
  autoKpiFetchFrequency: '45 6,18 * * *',
  autoKeyResFetchFrequency: '35 7 * * *',
  backupFrequency: '45 2 * * *',
  runtimeOpts: {
    timeoutSeconds: 300,
    memory: '2GB',
  },
  timeZone: 'Europe/Oslo',
};
