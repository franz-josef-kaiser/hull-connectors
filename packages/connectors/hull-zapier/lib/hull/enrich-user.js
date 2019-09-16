"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function ({ hull, user, events = false }) {
  const q = [hull.as(user.id).get("/me/segments")];
  if (events) q.push(hull.post("search/events", (0, _queries.events)(user.id)));
  return Promise.all(q).then(([segments, e = {}]) => ({
    user: (0, _groupUser2.default)({ hull, user }),
    events: e.data || {},
    segments: _lodash2.default.map(segments, s => _lodash2.default.pick(s, ['id', 'name', 'type'])),
    changes: {}
  }), err => console.log);
};

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _queries = require("./queries");

var _groupUser = require("../lib/group-user");

var _groupUser2 = _interopRequireDefault(_groupUser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }