const calculator = require('./calculator');
const stringUtils = require('./stringUtils');
const arrayUtils = require('./arrayUtils');
const dateUtils = require('./dateUtils');

module.exports = {
  ...calculator,
  ...stringUtils,
  ...arrayUtils,
  ...dateUtils
};
