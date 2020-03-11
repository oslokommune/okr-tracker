/* eslint-disable  */
exports.orgsPath = 'orgs/{orgId}';
exports.departmentsPath = orgsPath + '/departments/{departmentId}';
exports.productsPath = departmentsPath + '/products/{productId}';
exports.objectivesPath = productsPath + '/objectives/{objectiveId}';
exports.keyResultsPath = objectivesPath + '/keyResults/{keyresId}';
exports.progressionsPath = keyResultsPath + '/progress/{progressionId}';
exports.departmentObjectivesPath = departmentsPath + '/objectives/{objectiveId}';
exports.departmentKeyResultsPath = departmentObjectivesPath + '/keyResults/{keyResId}';
exports.departmentProgressionsPath = departmentKeyResultsPath + '/progress/{progressionId}';
exports.organizationObjectivesPath = orgsPath + '/objectives/{objectiveId}';
exports.organizationKeyResultsPath = organizationObjectivesPath + '/keyResults/{keyResId}';
exports.organizationProgressionsPath = organizationKeyResultsPath + '/progress/{progressionId}';
/* eslint-enable */
