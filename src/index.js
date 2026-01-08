const calculator = require('./calculator');
const stringUtils = require('./stringUtils');

module.exports = {
  ...calculator,
  ...stringUtils
};
