/* eslint-disable  */
const orgsPath = 'orgs/{orgId}';
const departmentsPath = orgsPath + '/departments/{departmentId}';
const productsPath = departmentsPath + '/products/{productId}';
const objectivesPath = productsPath + '/objectives/{objectiveId}';
const keyResultsPath = objectivesPath + '/keyResults/{keyresId}';
const progressionsPath = keyResultsPath + '/progress/{progressionId}';
const departmentObjectivesPath = departmentsPath + '/objectives/{objectiveId}';
const departmentKeyResultsPath = departmentObjectivesPath + '/keyResults/{keyresId}';
const departmentProgressionsPath = departmentKeyResultsPath + '/progress/{progressionId}';
const organizationObjectivesPath = orgsPath + '/objectives/{objectiveId}';
const organizationKeyResultsPath = organizationObjectivesPath + '/keyResults/{keyresId}';
const organizationProgressionsPath = organizationKeyResultsPath + '/progress/{progressionId}';
/* eslint-enable */

exports.orgsPath = orgsPath;
exports.departmentsPath = departmentsPath;
exports.productsPath = productsPath;
exports.objectivesPath = objectivesPath;
exports.keyResultsPath = keyResultsPath;
exports.progressionsPath = progressionsPath;
exports.departmentObjectivesPath = departmentObjectivesPath;
exports.departmentKeyResultsPath = departmentKeyResultsPath;
exports.departmentProgressionsPath = departmentProgressionsPath;
exports.organizationObjectivesPath = organizationObjectivesPath;
exports.organizationKeyResultsPath = organizationKeyResultsPath;
exports.organizationProgressionsPath = organizationProgressionsPath;
