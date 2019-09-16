"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = groupUser;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function groupUser({ hull, user }) {
  return hull.utils.groupTraits(_lodash2.default.omitBy(user, v => v === null || v === "" || v === undefined));
}