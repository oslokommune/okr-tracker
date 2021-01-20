exports.region = 'europe-west2';
exports.autoKeyresFetchFrequency = '0 6 * * *';
exports.backupFrequency = '0 0 * * *';
exports.runtimeOpts = {
  timeoutSeconds: 300,
  memory: '2GB',
};
exports.autoKpiFetchFrequency = '0 6,18 * * *';
