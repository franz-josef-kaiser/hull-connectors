/* @flow */
const _ = require("lodash");

const { isUndefinedOrNull } = require("./utils");

function notNull(param: string) {
  return (context) => {
    const contextVariable = _.get(context, param);
    return !isUndefinedOrNull(contextVariable);
  };
}

function isNull(param: string) {
  return (context) => {
    const contextVariable = _.get(context, param);
    return isUndefinedOrNull(contextVariable);
  };
}

module.exports = {
  notNull,
  isNull
}