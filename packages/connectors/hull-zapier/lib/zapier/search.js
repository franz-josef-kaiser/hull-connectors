"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  const router = _express2.default.Router();

  router.get("/", (req, res) => {
    const { hull } = req;
    const { email } = req.query;
    (0, _fetchUsers2.default)({ search: { email }, hull: hull.client, multi: true }).then(user => res.send(user), err => console.log(err));
    // res.send("OK")
  });

  router.get("/user", (req, res) => {
    const { hull } = req;
    const { email, external_id } = req.query;
    const search = {};
    if (email) search.email = email;
    if (external_id) search.external_id = external_id;
    (0, _fetchUsers2.default)({ search, hull: hull.client, multi: false }).then(user => res.send(user), err => console.log(err));
  });

  return router;
};

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _fetchUsers = require("../hull/fetch-users");

var _fetchUsers2 = _interopRequireDefault(_fetchUsers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }