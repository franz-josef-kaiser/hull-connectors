"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fetchUsers;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _enrichUser = require("./enrich-user");

var _enrichUser2 = _interopRequireDefault(_enrichUser);

var _queries = require("./queries");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function fetchUsers({ hull, search = {}, multi = false, events = true }) {
  const { email, name, id } = search;
  let params = {};

  if (id) params = (0, _queries.id)(id);else if (email) params = (0, _queries.email)(email);else if (name) params = (0, _queries.name)(name);else params = (0, _queries.latest)();

  hull.logger.debug("user.search", params);

  return hull.post("search/user_reports", params).then(args => {
    const { data: users = [] } = args;

    if (!users.length) return Promise.reject({ message: "User not found!" });

    // If searching for a single user, only use the first result. else use all (list)

    if (multi) return Promise.all(_lodash2.default.map(users, user => (0, _enrichUser2.default)({ hull, user, events })));

    return (0, _enrichUser2.default)({ hull, user: users[0], events });
  });
}